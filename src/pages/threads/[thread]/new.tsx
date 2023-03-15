import type { GetStaticPropsResult, GetStaticPropsContext, NextPage, GetStaticPathsResult } from 'next';
import { createEditor, Transforms, Text, Editor, Element as SlateElement, Node } from "slate";
import { useState, useMemo, useCallback } from 'react';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import type { FullPageProps } from 'types/page';
import { useForm } from 'react-hook-form';
import { Tab } from '@headlessui/react'

import { z } from 'zod';

import SiteTags from '@components/SiteTags';
import Navbar from '@components/layout/Navbar';
import ExitPreview from '@components/ExitPreview';
import Footer from '@components/layout/Footer';

import GenericPageQuery from '@query/queries/generic';
import { DatoCMS } from '@api/gql';
import { fetchCacheData } from '@lib/cache';
import { StructuredText } from 'react-datocms/structured-text';

const mark = z.enum(["strong", "code", "emphasis", "underline", "strikethrough", "highlight"]);
const span = z.object({
    type: z.literal("span"),
    marks: z.array(mark).optional(),
    value: z.string()
});
const link = z.object({
    type: z.literal("link"),
    url: z.string().url(),
    meta: z.array(z.object({ id: z.string(), value: z.string() })).optional(),
    children: z.array(span)
});

const inlineNode = z.union([span, link]);

const heading = z.object({
    type: z.literal("heading"),
    level: z.number().min(1).max(6),
    style: z.string().optional(),
    children: z.array(inlineNode)
});

const paragraph = z.object({
    type: z.literal("paragraph"),
    children: z.array(inlineNode),
    style: z.string().optional()
});
const dastSchema = z.object({
    type: z.literal("root"),
    children: z.array(z.union([paragraph, heading]))
});

type Dast = z.infer<typeof dastSchema>;

//https://www.slatejs.org/examples/richtext
//https://github.com/ianstormtaylor/slate/blob/main/site/examples/richtext.tsx#L111
//https://docs.slatejs.org/concepts/08-plugins

interface Props extends FullPageProps { }

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

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
        case "heading": {
            switch (element.level) {
                case 1:
                    return (<h1 {...attributes}>{children}</h1>);
                case 2:
                    return (<h2 {...attributes}>{children}</h2>);
                default:
                    return (<h6 {...attributes}>{children}</h6>);
            }
        }
        case "list": {
            if (element.style === "bulleted") {
                return (<ol {...attributes}>{children}</ol>);
            }
            return (<ul {...attributes}>{children}</ul>);
        }
        case 'blockquote':
            return (
                <blockquote {...attributes}>
                    {children}
                </blockquote>
            );
        default:
            return (
                <p {...attributes}>
                    <span>{children}</span>
                </p>
            )
    }
}

const Leaf = ({ attributes, children, leaf }: any) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>
    }

    if (leaf.code) {
        children = <code>{children}</code>
    }

    if (leaf.italic) {
        children = <em>{children}</em>
    }

    if (leaf.underline) {
        children = <u>{children}</u>
    }

    return <span {...attributes}>{children}</span>
}

const isMarkActive = (editor: any, format: string) => {
    const marks = Editor.marks(editor);
    return marks ? (marks as any)[format] === true : false
}
const toggleMark = (editor: any, format: string) => {
    const isActive = isMarkActive(editor, format)

    if (isActive) {
        Editor.removeMark(editor, format)
    } else {
        Editor.addMark(editor, format, true)
    }
}

const MarkButton = ({ format }: { format: string }) => {
    const editor = useSlate();
    return (
        <button type="button" className="p-2 border border-gray-400" onClick={(ev) => {
            ev.preventDefault();
            toggleMark(editor, format);
        }}>
            {format}
        </button>
    )
}

const BlockButton = ({ format }: { format: string }) => {
    const editor = useSlate()
    return (
        <button className="p-2 border border-gray-400" type="button"
            onClick={event => {
                event.preventDefault()
                toggleBlock(editor, format)
            }}
        >
            {format}
        </button>
    )
}

const SelectHeading = () => {
    const editor = useSlate()
    return (
        <select onChange={(ev) => {
            ev.preventDefault();
            const meta = ev.target.options[ev.target.selectedIndex]?.getAttribute("data-level");
            toggleBlock(editor, ev.target.value, meta);
        }}>
            <option value="paragraph">Normal</option>
            <option value="heading" data-level="1">Heading One</option>
            <option value="heading" data-level="2">Heading Two</option>

        </select>
    );
}

const isBlockActive = (editor: Editor, format: string, blockType = 'type') => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                (n as any)[blockType] === format,
        })
    )

    return !!match
}

const toggleBlock = (editor: Editor, format: string, meta: any) => {

    let newProperties: any = {
        type: format,
    }

    if (format === "heading") {
        newProperties.level = parseInt(meta);
    }

    Transforms.setNodes<SlateElement>(editor, newProperties);
}

const exampleDast = {
    "type": "root",
    "children": [{
        "type": "heading",
        "level": 1,
        "children": [
            {
                "type": "span",
                "marks": [],
                "value": "This is a title!"
            }
        ]
    },
    {
        "type": "thematicBreak"
    }
    ]
};

const convertToDast = (doc: any[]): any[] => {

    const root = [];
    for (const i of doc) {
        if ("text" in i) {
            const node: { type: string; value: string; marks?: string[] } = {
                type: "span",
                value: i.text
            };

            if (i?.bold) {
                if (!node?.marks) node.marks = [];
                node.marks.push("strong");
            }
            if (i?.code) {
                if (!node?.marks) node.marks = [];
                node.marks.push("code");
            }
            if (i?.italic) {
                if (!node?.marks) node.marks = [];
                node.marks.push("emphasis");
            }
            if (i?.underline) {
                if (!node?.marks) node.marks = [];
                node.marks.push("underline");
            }
            if (i?.strikethrough) {
                if (!node?.marks) node.marks = [];
                node.marks.push("strikethrough");
            }
            if (i?.highlight) {
                if (!node?.marks) node.marks = [];
                node.marks.push("highlight");
            }

            root.push(node);
            continue;
        }
        switch (i.type) {
            case "paragraph": {
                const children = convertToDast(i.children);
                const node = {
                    type: "paragraph",
                    children
                };
                root.push(node);
                break;
            }
            case "heading": {
                const children = convertToDast(i.children);
                const node = {
                    type: "heading",
                    level: i.level,
                    children
                };
                root.push(node);
                break;
            }
            case "blockquote": {
                const children = convertToDast(i.children);
                const node = {
                    type: "blockquote",
                    children
                };
                root.push(node);
                break;
            }
            default: {
                break;
            }
        }
    }
    return root;
}

const NewThreadPost: NextPage<Props> = ({ _site, navbar, preview }) => {
    const { handleSubmit } = useForm();
    const [editorState, setEditorState] = useState([{ type: "paragraph", children: [{ text: 'A line of text in a paragraph.' }] }]);
    const [test, setTest] = useState<any>(exampleDast);
    const editor = useMemo(() => withReact(createEditor()), []);
    const renderElement = useCallback((props: any) => <Element {...props} />, []);
    const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

    const onSubmit = () => {
        console.log(editorState);
        const dast = convertToDast(editorState);

        const root: PrismaJson.Dast = {
            value: {
                schema: "dast",
                document: {
                    type: "root",
                    children: dast
                }
            },
            blocks: [],
            links: []
        };

        setTest(root);
    }

    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: `Create Post - Midwest Raptor Junkies` }]]} />
            <header>
                <Navbar {...navbar} mode="none" />
            </header>
            <main className="flex-1 flex flex-col items-center">
                <h1 className="font-bold">Creat a post</h1>
                <Tab.Group>
                    <Tab.List>
                        <Tab className="inline-block rounded bg-primary-700 px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-selected:bg-primary-700 ui-selected:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]">Write</Tab>
                        <Tab className="inline-block rounded bg-primary-700 px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-selected:bg-primary-700 ui-selected:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]">Preview</Tab>
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>
                            <form className="flex flex-col max-w-5xl w-full gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
                                <input type="text" placeholder='Title' name="title" className="from-input" />
                                <Slate editor={editor} value={editorState} onChange={(ev) => setEditorState(ev as any)}>
                                    <div className="flex gap-2 items-center mt-2 flex-wrap">
                                        <SelectHeading />
                                        <MarkButton format='bold' />
                                        <MarkButton format="italic" />
                                        <MarkButton format="underline" />
                                        <BlockButton format="blockquote" />
                                        <BlockButton format="list" />
                                    </div>
                                    <Editable className="form-textarea mt-4 prose max-w-none" renderElement={renderElement} renderLeaf={renderLeaf} spellCheck autoFocus placeholder="Enter some rich text…" />
                                </Slate>
                                <button type="submit" className='inline-block rounded bg-indigo-600 px-8 py-3 text-sm font-medium text-white transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-indigo-500'>Post</button>
                            </form>
                        </Tab.Panel>
                        <Tab.Panel>
                            <div className="prose">
                                <StructuredText data={test} />
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