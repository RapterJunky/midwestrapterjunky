import type { GetStaticPropsResult, GetStaticPropsContext, NextPage, GetStaticPathsResult } from 'next';
import { createEditor, Text, Node, type Descendant, } from "slate";
import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Slate, Editable, withReact } from 'slate-react';
import { StructuredText } from 'react-datocms/structured-text';
import type { FullPageProps } from 'types/page';
import { useForm, Controller } from 'react-hook-form';
import { Tab } from '@headlessui/react'


import SiteTags from '@components/SiteTags';
import Navbar from '@components/layout/Navbar';
import ExitPreview from '@components/ExitPreview';
import Footer from '@components/layout/Footer';

import GenericPageQuery from '@query/queries/generic';
import { DatoCMS } from '@api/gql';
import { fetchCacheData } from '@lib/cache';


//https://www.slatejs.org/examples/richtext
//https://github.com/ianstormtaylor/slate/blob/main/site/examples/richtext.tsx#L111
//https://docs.slatejs.org/concepts/08-plugins

interface FormState { title: string; document: Descendant[] };
interface Props extends FullPageProps { }

export const getStaticPaths = (): GetStaticPathsResult => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {

    const props = await fetchCacheData<Props>("GenericPage", () => DatoCMS<Props>(GenericPageQuery, {
        preview: ctx.preview,
    }));

    return {
        props: {
            ...props,
            preview: ctx?.preview ?? false
        }
    }
}

const Element = ({ attributes, children, element }: any) => {
    switch (element.type) {
        default:
            return (
                <p {...attributes}>
                    {children}
                </p>
            )
    }
}

const serialize = (nodes: Descendant[]) => {
    const document: any[] = [];

    for (const node of nodes) {
        if (Text.isText(node)) {
            const marks = Object.keys(node).map(value => value).filter(value => value !== "text");
            const span = {
                type: "span",
                value: Node.string(node),
                marks: !marks.length ? undefined : marks
            }
            document.push(span);
            continue;
        }

        switch (node.type) {
            case "paragraph": {
                const paragraph = {
                    type: "paragraph",
                    children: serialize(node.children)
                }
                document.push(paragraph);
                continue;
            }
        }
    }
    return document;
}

const toDast = (nodes: Descendant[]): PrismaJson.Dast => {
    return {
        value: {
            schema: "dast",
            document: {
                type: "root",
                children: serialize(nodes)
            }
        },
        blocks: [],
        links: []
    }
}

const NewThreadPost: NextPage<Props> = ({ _site, navbar, preview }) => {
    const router = useRouter();
    const { handleSubmit, register, control, watch } = useForm<FormState>({
        defaultValues: {
            document: [{ type: "paragraph", children: [{ text: 'A line of text in a paragraph.' }] }],
            title: ""
        }
    });
    const editor = useMemo(() => withReact(createEditor()), []);
    const renderElement = useCallback((props: any) => <Element {...props} />, []);

    const previewDocuemnt = watch("document");


    const onSubmit = async (state: FormState) => {
        try {
            const request = await fetch("/api/threads/post", {
                method: "POST",
                body: JSON.stringify({
                    name: state.title,
                    threadId: parseInt(router.query.thread as string),
                    content: toDast(state.document)
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!request.ok) throw request;

            router.replace(`/threads/${router.query.thread}`);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: `Create Post - Midwest Raptor Junkies` }]]} />
            <header>
                <Navbar {...navbar} mode="none" />
            </header>
            <main className="flex-1 flex flex-col items-center bg-neutral-200">
                <h1 className="font-bold text-3xl mt-4">Create a post</h1>
                <Tab.Group as="div" className="flex flex-col max-w-6xl w-full justify-center">
                    <Tab.List className="w-full flex">
                        <Tab className="w-full border-b border-gray-300 ui-selected:border-b-blue-600 ui-selected:text-blue-600 text-gray-600 inline-block px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal transition duration-150 ease-in-out">Write</Tab>
                        <Tab className="w-full border-b border-gray-300 ui-selected:border-b-blue-600 ui-selected:text-blue-600 text-gray-600 inline-block px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal transition duration-150 ease-in-out">Preview</Tab>
                    </Tab.List>
                    <Tab.Panels className="w-full">
                        <Tab.Panel className="flex justify-center">
                            <form className="flex flex-col max-w-5xl w-full gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
                                <label className='block'>
                                    <span className='text-gray-700'>Title</span>
                                    <input {...register("title", { required: "Title is required." })} required type="text" placeholder='Enter a title' name="title" className="mt-0 block w-full px-0.5 border-0 border-b-2 border-gray-400 focus:ring-0 focus:border-black bg-neutral-200" />
                                </label>
                                <label>
                                    <span className='text-gray-700'>Post Content</span>
                                    <Controller control={control} name="document" render={({ field: { onChange, value } }) => (
                                        <Slate editor={editor} value={value} onChange={onChange}>
                                            <Editable className="p-2 prose max-w-none shadow-md bg-white min-h-[320px] mt-2" renderElement={renderElement} spellCheck autoFocus placeholder="Enter some rich text…" />
                                        </Slate>
                                    )} />
                                </label>
                                <button type="submit" className="inline-block rounded bg-primary-700 px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-selected:bg-primary-700 ui-selected:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]">Post</button>
                            </form>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="p-2 prose max-w-none shadow-md bg-white min-h-[320px] mt-2">
                                <StructuredText data={toDast(previewDocuemnt)} />
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </main>
            <Footer />
            {preview ? <ExitPreview /> : null}
        </div>
    );
}

export default NewThreadPost;