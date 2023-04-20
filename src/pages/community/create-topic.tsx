import { Controller, useForm } from 'react-hook-form';
import SiteTags from "@/components/SiteTags";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import GenericPageQuery from "@/gql/queries/generic";
import { fetchCachedQuery } from "@/lib/cache";
import genericSeoTags from "@/lib/utils/genericSeoTags";
import { FullPageProps } from "@/types/page";
import { GetStaticPropsContext, GetStaticPropsResult, NextPage } from "next";
import { Descendant } from 'slate';
import CommentBox from '@/components/thread/CommentBox';
import TagInput from '@/components/TagInput';
import { isEditorEmpty } from '@lib/utils/editor/editorActions';
import prisma from '@api/prisma';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import type { Block, NonTextNode } from 'datocms-structured-text-slate-utils';

type DialogData = {
    open: boolean;
    mode: "loading" | "message";
    title?: string;
    message?: string;
}

type FormState = {
    title: string;
    tags: PrismaJson.Tags;
    categoryId: string;
    message: Descendant[]
}

interface Props extends FullPageProps {
    categories: {
        id: number;
        tags: PrismaJson.Tags | null;
        name: string;
    }[]
}

export const getStaticProps = async ({ preview }: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {
    const props = await fetchCachedQuery<FullPageProps>(
        "GenericPage",
        GenericPageQuery
    );

    const categories = await prisma.thread.findMany({
        select: {
            id: true,
            name: true,
            tags: true
        }
    })

    return {
        props: {
            ...props,
            categories,
            preview: preview ?? false
        }
    };
};


const getImages = (nodes: NonTextNode[]) => {
    const images: {
        id: string,
        width: number,
        height: number,
        file: File,
    }[] = [];

    for (const node of nodes) {
        if (node.type === "block" && node.blockModelId === "ImageRecord") {
            if (!node.id) continue;

            images.push({
                id: node.id,
                width: (node as Block & { width: number; height: number; file: File }).width,
                height: (node as Block & { width: number; height: number; file: File }).height,
                file: (node as Block & { width: number; height: number; file: File }).file
            });

            delete node.width;
            delete node.height;
            delete node.file;
            delete node.src;

            continue;
        }

        if (node.children) {
            const data = getImages(node.children as NonTextNode[]);
            images.push(...data);
        }
    }

    return images;
}

const CreateTopicDialog: React.FC<{ data: DialogData, onClose: () => void }> = ({ data, onClose }) => {
    return (
        <Transition appear show={data.open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose /*() => data.mode === "message" ? onClose() : () => { }*/}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-sm bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {data.mode === "loading" ? (
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                            role="status">
                                            <span
                                                className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                                            >Loading...</span
                                            >
                                        </div>
                                        <span className="text-xl mt-4">Processing...</span>
                                    </div>
                                ) : (<>
                                    <Dialog.Title
                                        as="h3"
                                        className="text-xl font-medium leading-6 text-gray-900"
                                    >
                                        {data.title}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {data.message}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                                            onClick={onClose}
                                        >
                                            Ok
                                        </button>
                                    </div>
                                </>)}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

const CreateTopic: NextPage<Props> = ({ _site, navbar, categories }) => {
    const session = useSession();
    const router = useRouter();
    const [dialog, setDialog] = useState<DialogData>({ open: false, mode: "message" });
    const { control, register, handleSubmit, formState: { errors, isSubmitting }, setError, clearErrors } = useForm<FormState>({
        defaultValues: {
            tags: [],
            message: [{ type: "paragraph", children: [{ text: "" }] }]
        }
    });

    useEffect(() => {
        if (session.status === "loading" || session.status === "authenticated") return;
        router.replace("/community").catch(e => console.error(e));
    }, [session.status])

    const onSubmit = async (state: FormState) => {
        if (await isEditorEmpty()) {
            setError("message", {
                type: "required",
                message: "Please enter a message"
            })
            return;
        }
        try {
            setDialog({
                open: true,
                mode: "loading"
            });

            console.log(state);

            const formData = new FormData();

            formData.append("type", "post");
            formData.append("title", state.title);
            state.tags.forEach((tag) => formData.append("tags", tag));

            const images = getImages(state.message as NonTextNode[]);

            for (const image of images) {
                formData.append(`image[${image.id}]`, image.file, `${image.id}.${image.file.type.split("/")[1]}`);
                formData.append(`imageData[${image.id}]`, JSON.stringify({ width: image.width, height: image.height }));
            }
            formData.append("message", JSON.stringify(state.message));
            console.log(formData);
            const response = await fetch("/api/community/create", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw response;

            /*const data = await response.json() as { postId: string };
 
            await router.replace({
                pathname: "/community/p/[slug]",
                query: {
                    slug: data.postId
                }
            });*/

        } catch (error) {
            console.error(error);

            const message = error instanceof Response ? `STATUS_CODE: ${error.statusText}` : "";

            setDialog({
                open: true,
                mode: "message",
                title: "Error",
                message: `There was an error creating your post. ${message}`
            });
        }
    }

    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[
                _site.faviconMetaTags,
                genericSeoTags({
                    title: "Create Topic",
                    description: "Create a new topic"
                })
            ]} />
            <Navbar {...navbar} mode="none" />
            <CreateTopicDialog data={dialog} onClose={() => setDialog((current) => ({ ...current, open: false }))} />
            <main className="flex flex-1 justify-center">
                <form onSubmit={handleSubmit(onSubmit)} className="container max-w-3xl mb-4">
                    <h1 className="font-bold text-2xl mb-4">Create a new topic</h1>
                    <div className='flex flex-col mb-4'>
                        <label htmlFor="title" className="mb-1 text-neutral-600">Title</label>
                        <input placeholder="Enter a title..." id="title" type="text" {...register("title", {
                            minLength: {
                                message: "The title must 3 characters in length.",
                                value: 3
                            },
                            maxLength: {
                                value: 40,
                                message: "The title must be less then 40 characters in length."
                            },
                            required: "A Title is required"
                        })} />
                        {errors.title ? (
                            <span className="text-red-500">{errors.title.message}</span>
                        ) : null}
                    </div>
                    <div className='flex flex-col mb-4'>
                        <label htmlFor="category" className="mb-1 text-neutral-600">Category</label>
                        <select id="category" {...register("categoryId", { required: "A Category is required" })}>
                            {categories.map((cat, i) => (
                                <option key={i} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.categoryId ? (
                            <span className="text-red-500">{errors.categoryId.message}</span>
                        ) : null}
                    </div>
                    <div className='flex flex-col mb-4'>
                        <label className="mb-1 text-neutral-600">Tags</label>
                        <Controller rules={{
                            max: {
                                message: "6 is the max amount of tags",
                                value: 6
                            }
                        }} control={control} name="tags" render={({ field }) => (
                            <TagInput max={6} clearError={() => clearErrors("tags")} value={field.value} onChange={field.onChange} setError={(type, message) => setError("tags", { type: type, message: message })} />
                        )} />
                        {errors.tags ? (
                            <span className="text-red-500">{errors.tags.message}</span>
                        ) : null}
                        <span className="text-neutral-500">Tags must be 3-12 characters in length, with a max of 6 tags</span>
                    </div>
                    <div className="mb-4 flex flex-col gap-1">
                        <label className="text-neutral-600">Post Content</label>
                        <CommentBox control={control} name="message" />
                        {errors.message ? (
                            <span className="text-red-500">{errors.message.message}</span>
                        ) : null}
                    </div>

                    <div className="flex justify-end">
                        <button disabled={isSubmitting} className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70" type="submit">Submit</button>
                    </div>
                </form>
            </main>
            <Footer />
        </div>
    );
}

export default CreateTopic;