import onError from "@/lib/api/handleError";
import { authConfig } from "@/lib/config/auth";
import createHttpError from "http-errors";
import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "@/lib/api/prisma";
import { NextResponse } from "next/server";

const HEADER_TYPE = "x-content-type";

const schema = z.object({
    id: z.string().uuid()
});

const reportSchema = schema.extend({
    reason: z.string()
})

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authConfig);
        if (!session) throw createHttpError.Unauthorized();

        const body = await request.json();

        const type = z.enum(["like-comment", "like-post", "report-comment", "report-post"]).parse(request.headers.get(HEADER_TYPE));

        switch (type) {
            case "like-comment": {
                const { id } = schema.parse(body);

                const data = await prisma.like.create({
                    data: {
                        id: `${session.user.id}${id}`,
                        type: "Comment",
                        userId: session.user.id,
                        commentId: id,
                    },
                    select: {
                        comment: {
                            select: {
                                id: true,
                                content: true,
                                created: true,
                                parentCommentId: true,
                                _count: {
                                    select: {
                                        likes: true,
                                    },
                                },
                                owner: {
                                    select: {
                                        image: true,
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                });

                if (!data.comment)
                    throw createHttpError.InternalServerError("No comment was returned");

                const { _count, ...comment } = data.comment;

                return NextResponse.json({
                    ...comment,
                    children: 0,
                    likedByMe: true,
                    likeCount: _count.likes,
                }, { status: 201 });
            }
            case "like-post": {
                const { id } = schema.parse(body);

                const data = await prisma.like.create({
                    data: {
                        id: `${session.user.id}${id}`,
                        userId: session.user.id,
                        threadPostId: id,
                        type: "Post",
                    },
                    select: {
                        post: {
                            select: {
                                _count: {
                                    select: {
                                        likes: true,
                                    },
                                },
                            },
                        },
                    },
                });

                return NextResponse.json({
                    likedByMe: true,
                    likesCount: data.post?._count.likes ?? 1,
                }, { status: 201 });
            }
            case "report-comment": {
                const { id, reason } = reportSchema.parse(body);

                await prisma.report.create({
                    data: {
                        ownerId: session.user.id,
                        commentId: id,
                        reason,
                        type: "Comment",
                    },
                });

                return NextResponse.json({ message: "Reported" }, { status: 201 });
            }
            case "report-post": {
                const { id, reason } = reportSchema.parse(body);

                await prisma.report.create({
                    data: {
                        ownerId: session.user.id,
                        postId: id,
                        reason,
                        type: "Post",
                    },
                });

                return NextResponse.json({ message: "Reported" }, { status: 201 });
            }
        }
    } catch (error) {
        return onError(error);
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authConfig);
        if (!session) throw createHttpError.Unauthorized();
        const type = z.enum(["like-comment", "like-post"]).parse(request.headers.get(HEADER_TYPE));
        const { searchParams } = new URL(request.url);

        const id = z.string().uuid().parse(searchParams.get("id"));

        switch (type) {
            case "like-comment": {
                const data = await prisma.like.delete({
                    where: {
                        id: `${session.user.id}${id}`,
                    },
                    select: {
                        comment: {
                            select: {
                                id: true,
                                content: true,
                                created: true,
                                parentCommentId: true,
                                _count: {
                                    select: {
                                        likes: true,
                                    },
                                },
                                owner: {
                                    select: {
                                        image: true,
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                });

                if (!data.comment)
                    throw createHttpError.InternalServerError("Failed to get comment");

                const { _count, ...comment } = data.comment;

                return NextResponse.json({
                    ...comment,
                    likedByMe: false,
                    likeCount: _count.likes - 1,
                });
            }
            case "like-post": {
                const data = await prisma.like.delete({
                    where: {
                        id: `${session.user.id}${id}`,
                    },
                    select: {
                        post: {
                            select: {
                                _count: {
                                    select: {
                                        likes: true,
                                    },
                                },
                            },
                        },
                    },
                });

                return NextResponse.json({
                    likedByMe: false,
                    likesCount: data.post?._count.likes ?? 0,
                });
            }
        }
    } catch (error) {
        return onError(error);
    }
}