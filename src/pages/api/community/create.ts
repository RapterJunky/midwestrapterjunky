import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, type File } from "formidable";
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { google } from 'googleapis';
import createHttpError from "http-errors";
import { getSession } from "@/lib/getSession";
import { applyRateLimit } from "@/lib/api/rateLimiter";
import { handleError } from "@/lib/api/errorHandler";
import { z } from 'zod';
import { slateToDast } from "@/lib/utils/slateToDast";
import { NonTextNode } from "datocms-structured-text-slate-utils";
import prisma from "@/lib/api/prisma";

const tagsSchema = z.array(z.string().min(3).max(15)).max(6);
const imageDataSchema = z.string().transform((str, ctx) => {
    try {
        return JSON.parse(str);
    } catch (error) {
        ctx.addIssue({ code: "custom", message: "Invaild JSON" });
        return z.NEVER;
    }
}).pipe(z.object({ id: z.string().uuid(), width: z.number(), height: z.number() }));

const schema = z.object({
    thread: z.coerce.number().positive().min(1),
    type: z.enum(["post", "comment"]),
    title: z.string().nonempty(),
    tags: tagsSchema.or(z.string().transform(val => [val]).pipe(tagsSchema)),
    message: z.string().transform((str, ctx) => {
        try {
            return JSON.parse(str);
        } catch (error) {
            ctx.addIssue({ code: "custom", message: "Invaild JSON" });
            return z.NEVER;
        }
    }).pipe(z.array(z.object({ type: z.string() }).passthrough()).min(1)),
    imageData: z.array(imageDataSchema).optional().or(imageDataSchema)
});

type ImageData = z.infer<typeof imageDataSchema>;
type Schema = z.infer<typeof schema>;
type ImageBlock = {
    __typename: string;
    id: string;
    content: {
        blurUpThumb: string;
        responsiveImage: {
            src: string;
            alt: string;
            height: number;
            width: number;
        };
    };
};

export const config = {
    api: {
        bodyParser: false
    }
}

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== "POST") throw createHttpError.MethodNotAllowed();
        await applyRateLimit(req, res);
        const session = await getSession(req, res);

        const form = new IncomingForm({
            keepExtensions: true,
            allowEmptyFiles: false,
            multiples: true,
            maxFiles: 5,
            filter({ name, originalFilename, mimetype }) {
                return !!(mimetype && mimetype.includes("image"))
            }
        });

        const formData = await new Promise<{ fields: Schema, files: Record<`image[${string}]`, File> }>((ok, reject) => {
            form.on("error", (err) => reject(err))
                .on("field", (field, value) => {
                    const hasKey = schema.keyof().safeParse(field.replace("[]", ""));

                    if (!hasKey.success) throw hasKey.error;

                    const result = schema.shape[hasKey.data].safeParse(value);
                    if (!result.success) {
                        throw result.error;
                    }
                })
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);

                const data = schema.safeParse(fields);

                if (!data.success) {
                    return reject(data.error);
                }

                ok({
                    fields: data.data,
                    files: files as Record<`image[${string}]`, File>
                });
            });
        });

        let imageBlocks: ImageBlock[] = [];
        if (formData.fields.imageData) {
            const folderId = '1V8YE-FBAK3tYenL0CHwiMIOFbdEvEuf2';
            const auth = new google.auth.GoogleAuth({
                scopes: ["https://www.googleapis.com/auth/drive"]
            });
            const driveService = google.drive({ version: 'v3', auth });
            //https://www.labnol.org/google-api-service-account-220404
            const fileLinks = await Promise.all(Object.entries(formData.files).map(async ([key, value]) => {
                const uuid = key.replace("image[", "").replace("]", "");
                const file = await driveService.files.create({
                    requestBody: {
                        name: value.newFilename,
                        parents: [folderId],
                    },
                    media: {
                        mimeType: value.mimetype ?? undefined,
                        body: createReadStream(value.filepath)
                    },
                    fields: "id,permissionIds"
                });

                await driveService.permissions.create({
                    fileId: file.data.id ?? undefined,
                    requestBody: {
                        role: "reader",
                        type: "anyone"
                    }
                });

                //clean up
                await unlink(value.filepath);

                return {
                    recordId: uuid,
                    //https://dev.to/temmietope/embedding-a-google-drive-image-in-html-3mm9
                    src: `https://drive.google.com/uc?export=view&id=${file.data.id}`
                }
            }));

            imageBlocks = (formData.fields.imageData as ImageData[]).map((value) => {
                const data = fileLinks.find(item => item.recordId === value.id) ?? { recordId: value.id, src: "" };
                return {
                    __typename: "ImageRecord",
                    id: data.recordId,
                    content: {
                        blurUpThumb: "",
                        responsiveImage: {
                            src: data.src,
                            alt: "Uploaded Image",
                            height: value.height,
                            width: value.width
                        }
                    },
                }
            }).filter(Boolean);
        }

        const dast = slateToDast(formData.fields.message as NonTextNode[]);

        if (!dast) throw createHttpError.BadRequest("Failed to vaildate dast");

        const document: PrismaJson.Dast = {
            blocks: imageBlocks,
            value: dast
        }

        const topic = await prisma.threadPost.create({
            data: {
                ownerId: session.user.id,
                content: document,
                name: formData.fields.title,
                tags: formData.fields.tags,
                threadId: formData.fields.thread,
            }
        });

        return res.status(201).json({ postId: topic.id });
    } catch (error) {
        return handleError(error, res);
    }
}

export default handle;