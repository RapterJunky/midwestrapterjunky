import type { NonTextNode } from "datocms-structured-text-slate-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, type File } from "formidable";
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import createHttpError from "http-errors";
import { google } from 'googleapis';
import { z } from 'zod';

import { slateToDast } from "@lib/utils/slateToDast";
import { applyRateLimit } from "@api/rateLimiter";
import { handleError } from "@api/errorHandler";
import { getSession } from "@lib/getSession";
import { compileWebp } from "@lib/webp";
import { logger } from "@lib/logger";
import prisma from "@api/prisma";

const creationType = z.enum(["post", "comment"]);
const tagsSchema = z.array(z.string().min(3).max(15)).max(6);
const imageDataSchema = z.string().transform((str, ctx) => {
    try {
        return JSON.parse(str);
    } catch (error) {
        ctx.addIssue({ code: "custom", message: "Invaild JSON" });
        return z.NEVER;
    }
}).pipe(z.object({ id: z.string().uuid(), width: z.number(), height: z.number() }));

const rootSchema = z.object({
    message: z.string().transform((str, ctx) => {
        try {
            return JSON.parse(str);
        } catch (error) {
            ctx.addIssue({ code: "custom", message: "Invaild JSON" });
            return z.NEVER;
        }
    }).pipe(z.array(z.object({ type: z.string() }).passthrough()).min(1)),
    imageData: z.array(imageDataSchema).or(imageDataSchema.transform(val => [val])).optional()
});

const createPostSchema = rootSchema.extend({
    thread: z.coerce.number().positive().min(1),
    title: z.string().nonempty(),
    tags: tagsSchema.or(z.string().transform(val => [val]).pipe(tagsSchema)),
});

const createCommentSchema = rootSchema.extend({
    parentId: z.string().uuid().optional(),
    postId: z.string().uuid()
});

type ImageData = z.infer<typeof imageDataSchema>;
type CreatePostSchema = z.infer<typeof createPostSchema>;
type CreateCommentSchema = z.infer<typeof createCommentSchema>;

const MAX_IMAGES = 5;
const UPLOAD_FILE_ID = '1V8YE-FBAK3tYenL0CHwiMIOFbdEvEuf2';

export const config = {
    api: {
        bodyParser: false
    }
}

const parseForm = <T extends z.AnyZodObject>(req: NextApiRequest, schema: T): Promise<{ fields: z.infer<T>, files: Record<`image[${string}]`, File> }> => {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm({
            keepExtensions: true,
            allowEmptyFiles: false,
            multiples: true,
            maxFiles: MAX_IMAGES,
            filter({ name, originalFilename, mimetype }) {
                return !!(mimetype && mimetype.includes("image"))
            }
        });

        form.on("field", (field, value) => {
            const hasKey = schema.keyof().safeParse(field.replace("[]", ""));

            if (!hasKey.success) throw hasKey.error;

            const result = schema.shape[hasKey.data].safeParse(value);
            if (!result.success) throw result.error;
        });
        form.parse(req, async (err, fields, files) => {
            if (err) {
                // remove images here
                for (const file of Object.values(files)) {
                    await unlink((file as File).filepath);
                }
                return reject(err);
            }

            const data = schema.safeParse(fields);

            if (!data.success) {
                return reject(data.error);
            }

            resolve({
                fields: data.data,
                files: files as Record<`image[${string}]`, File>
            });
        });


    });
}

/**
 * @see https://www.labnol.org/google-api-service-account-220404
 * @see https://dev.to/temmietope/embedding-a-google-drive-image-in-html-3mm9
 */
const uploadImages = async (images: ImageData[] | undefined, files: Record<`image[${string}]`, File>) => {
    if (!images) return [];

    const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/drive"]
    });

    const driveService = google.drive({ version: 'v3', auth });

    const fileLinks = await Promise.allSettled(Object.entries(files).map(async ([key, value]) => {
        const uuid = key.replace("image[", "").replace("]", "");

        let filename = value.newFilename;
        let filepath = value.filepath;
        let mimetype = value.mimetype ?? undefined;
        if (mimetype && mimetype !== "image/webp") {
            const data = await compileWebp(filepath);

            filename = data.filename;
            filepath = data.filepath;
            mimetype = "image/webp";
        }

        const file = await driveService.files.create({
            requestBody: {
                name: filename,
                parents: [UPLOAD_FILE_ID],
            },
            media: {
                mimeType: mimetype,
                body: createReadStream(filepath)
            },
            fields: "id"
        });

        await driveService.permissions.create({
            fileId: file.data.id ?? undefined,
            requestBody: {
                role: "reader",
                type: "anyone"
            }
        });

        await unlink(filepath);

        return {
            recordId: uuid,
            id: file.data.id,
            src: `https://drive.google.com/uc?export=view&id=${file.data.id}`
        }
    }));

    const links = fileLinks.map(link => {
        if (link.status === "rejected") {
            logger.error(link.reason, "Image upload failed");
            return null;
        }
        return link.value
    }).filter(Boolean);

    return images.map((value) => {
        const data = links.find(item => item.recordId === value.id) ?? {
            recordId: value.id,
            id: "",
            src: "https://api.dicebear.com/6.x/initials/png?seed=%3F"
        };
        return {
            __typename: "ImageRecord",
            id: data.recordId,
            content: {
                imageId: data.id,
                blurUpThumb: "",
                responsiveImage: {
                    src: data.src,
                    alt: "Uploaded Image",
                    height: value.height,
                    width: value.width
                }
            },
        }
    });
}

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (!req.method || !["POST", "PATCH"].includes(req.method)) throw createHttpError.MethodNotAllowed();
        if (req.headers["content-type"] !== "multipart/form-data") throw createHttpError.BadRequest();
        const header = creationType.parse(req.headers["x-type-create"]);

        await applyRateLimit(req, res);
        const session = await getSession(req, res);

        if (req.method === "PATCH") throw createHttpError.NotImplemented();

        const schema = header === "comment" ? createCommentSchema : createPostSchema;
        const formData = await parseForm(req, schema);

        // check dast before having to handle image uploading.
        const dast = slateToDast(formData.fields.message as NonTextNode[]);
        if (!dast) throw createHttpError.BadRequest("Failed to vaildate dast");

        const imageBlocks = await uploadImages(formData.fields.imageData, formData.files);

        const document: PrismaJson.Dast = {
            blocks: imageBlocks,
            value: dast
        }

        if (header === "comment") {
            const comment = await prisma.comment.create({
                data: {
                    ownerId: session.user.id,
                    content: document,
                    parentCommentId: (formData.fields as CreateCommentSchema).parentId,
                    threadPostId: (formData.fields as CreateCommentSchema).postId
                },
                select: {
                    id: true,
                    content: true,
                    created: true,
                    parentCommentId: true,
                    owner: {
                        select: {
                            image: true,
                            id: true,
                            name: true,
                        },
                    },
                }
            });

            return res.status(201).json({
                ...comment,
                likedByMe: false,
                likeCount: 0
            });
        }

        const topic = await prisma.threadPost.create({
            data: {
                ownerId: session.user.id,
                content: document,
                name: (formData.fields as CreatePostSchema).title,
                tags: (formData.fields as CreatePostSchema).tags,
                threadId: (formData.fields as CreatePostSchema).thread,
            }
        });

        return res.status(201).json({ postId: topic.id });
    } catch (error) {
        return handleError(error, res);
    }
}

export default handle;