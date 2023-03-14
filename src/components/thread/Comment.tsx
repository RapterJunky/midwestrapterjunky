import type { User, Comment } from "@api/prisma";
import type { useSession } from "next-auth/react"
import { Menu } from '@headlessui/react';
import Image from 'next/image';
import { HiArrowCircleRight, HiDotsHorizontal, HiFlag, HiReply, HiTrash } from "react-icons/hi";
import { formatLocalDate } from '@lib/utils/timeFormat';
import { useState } from "react";

type Session = ReturnType<typeof useSession>;
export type TComment = Omit<Comment, "ownerId" | "threadPostId"> & { owner: Omit<User, "email" | "emailVerified"> };

interface Props {
    comment: TComment,
    session: Session,
    handleEdit: (ev: React.FormEvent<HTMLFormElement>) => Promise<void>,
    handleCreate: (ev: React.FormEvent<HTMLFormElement>) => Promise<void>,
    deleteComment: (id: string) => Promise<void>,
    reportComment: (id: string) => Promise<void>
}

const Comment: React.FC<Props> = ({ handleEdit, handleCreate, deleteComment, reportComment, comment, session }) => {
    const [reply, setReply] = useState(false);
    const [edit, setEdit] = useState(false);

    return (
        <li className={`w-full flex flex-col gap-2 py-2 ${comment.parentCommentId ? " ml-11 border-l-2 border-gray-300 pl-2" : ""}`}>
            <div className="w-full flex gap-4">
                <div>
                    <Image width={40} height={40} className="rounded-full" src={comment.owner.image ?? ""} alt="avatar" />
                </div>
                <div className='flex flex-col gap-2 w-full'>
                    <div className="text-xs text-gray-500">{comment.owner.name} • {formatLocalDate(comment.created, "en-us", { weekday: "short" })}</div>
                    {edit ? (
                        <form className="flex gap-1" onSubmit={handleEdit} onBlur={() => setEdit(false)}>
                            <input autoComplete="off" value={comment.content.message} name="comment" className="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" type="text" placeholder="Edit comment" />
                            <button type="submit" className='px-1'>
                                <HiArrowCircleRight className="h-10 w-10 text-blue-400 hover:text-blue-500" />
                            </button>
                        </form>
                    ) : (
                        <article className='prose max-w-none line'>
                            {comment.content?.message ?? "Lorm"}
                        </article>
                    )}
                    <div className="flex gap-2 items-center text-gray-500">
                        <button className='text-xs flex gap-1 items-center hover:text-gray-700' onClick={() => setReply(!reply)}>
                            <HiReply /> Reply
                        </button>
                        •
                        {session.data?.user.id === comment.owner.id ? (
                            <>
                                <button className='text-xs flex gap-1 items-center hover:text-gray-700' onClick={() => setEdit(true)}>
                                    Edit
                                </button> •
                            </>
                        ) : null}
                        <Menu as="div" className="relative">
                            <Menu.Button className="hover:text-gray-700 flex items-center">
                                <HiDotsHorizontal className="h-5 w-5" />
                            </Menu.Button>
                            {session.status === "authenticated" ? (
                                <Menu.Items className="absolute z-50 float-left m-0 min-w-max overflow-hidden rounded-md bg-white shadow-lg text-left bg-clip-padding text-base ">
                                    <Menu.Item>
                                        <button className="flex items-center gap-1 text-left w-full whitespace-nowrap py-2 px-4 text-sm font-normal text-neutral-700 hover:bg-neutral-100 active:text-neutral-800 " onClick={() => reportComment(comment.id)}>
                                            <HiFlag />
                                            Report
                                        </button>
                                    </Menu.Item>
                                    {session.data?.user.id === comment.owner.id ? (
                                        <Menu.Item>
                                            <button className="flex items-center gap-1 text-left w-full whitespace-nowrap py-2 px-4 text-sm font-normal text-neutral-700 hover:bg-neutral-100 active:text-neutral-800 " onClick={() => deleteComment(comment.id)}>
                                                <HiTrash />
                                                Delete
                                            </button>
                                        </Menu.Item>
                                    ) : null}
                                </Menu.Items>
                            ) : null}
                        </Menu>
                    </div>
                </div>
            </div>
            {reply ? (
                <form onSubmit={handleCreate} className="ml-12 flex gap-1" onBlur={() => setReply(false)}>
                    <input autoComplete="off" name="comment" className="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-black" type="text" placeholder="Add a comment" />
                    <button type="submit" className='px-1'>
                        <HiArrowCircleRight className="h-10 w-10 text-blue-400 hover:text-blue-500" />
                    </button>
                </form>
            ) : null}
        </li>
    );
}

export default Comment;