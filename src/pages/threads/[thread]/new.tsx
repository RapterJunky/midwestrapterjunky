import type { GetStaticPropsResult, GetStaticPropsContext, NextPage, GetStaticPathsResult } from 'next';
import { createEditor, Transforms, Text, Editor, Element as SlateElement, Node } from "slate";
import { useState, useMemo, useCallback } from 'react';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import type { FullPageProps } from '@type/page';
import { useForm } from 'react-hook-form';

import SiteTags from '@components/SiteTags';
import Navbar from '@components/Navbar';
import ExitPreview from '@components/ExitPreview';
import Footer from '@components/Footer';

import GenericPageQuery from '@query/queries/generic';
import { DatoCMS } from '@api/gql';
import { fetchCacheData } from '@lib/cache';
import { StructuredText } from 'react-datocms/structured-text';

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

    const props = await fetchCacheData<Props>("fav-nav", () => DatoCMS<Props>(GenericPageQuery, {
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
    const style = { textAlign: element.align }
    switch (element.type) {
        case 'block-quote':
            return (
                <blockquote style={style} {...attributes}>
                    {children}
                </blockquote>
            )
        case 'bulleted-list':
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            )
        case 'heading-one':
            return (
                <h1 style={style} {...attributes}>
                    {children}
                </h1>
            )
        case 'heading-two':
            return (
                <h2 style={style} {...attributes}>
                    {children}
                </h2>
            )
        case 'list-item':
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            )
        case 'numbered-list':
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            )
        default:
            return (
                <p style={style} {...attributes}>
                    {children}
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
        <button type="button" className='inline-block rounded bg-indigo-600 px-8 py-3 text-sm font-medium text-white transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-indigo-500' onMouseDown={(ev) => {
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
        <button className='inline-block rounded bg-indigo-600 px-8 py-3 text-sm font-medium text-white transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-indigo-500' type="button"
            onClick={event => {
                event.preventDefault()
                toggleBlock(editor, format)
            }}
        >
            {format}
        </button>
    )
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

const toggleBlock = (editor: Editor, format: string) => {
    const isActive = isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
    )
    const isList = LIST_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            LIST_TYPES.includes((n as any).type) &&
            !TEXT_ALIGN_TYPES.includes(format),
        split: true,
    })
    let newProperties: any
    if (TEXT_ALIGN_TYPES.includes(format)) {
        newProperties = {
            align: isActive ? undefined : format,
        }
    } else {
        newProperties = {
            type: isActive ? 'paragraph' : isList ? 'list-item' : format,
        }
    }
    Transforms.setNodes<SlateElement>(editor, newProperties)

    if (!isActive && isList) {
        const block = { type: format, children: [] }
        Transforms.wrapNodes(editor, block)
    }
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

const NewThreadPost: NextPage<Props> = ({ _site, navbar, preview }) => {
    const { handleSubmit } = useForm();
    const [test, setTest] = useState<any>(exampleDast);
    const editor = useMemo(() => withReact(createEditor()), []);
    const renderElement = useCallback((props: any) => <Element {...props} />, []);
    const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

    const onSubmit = () => {
        const dast = {
            type: "root",
            children: [] as any[]
        }

        console.log(editor.children);

        for (const i of editor.children) {
            if ((i as any)?.type === "paragraph") {
                const node = {
                    type: "paragraph",
                    children: [
                        {
                            type: "span",
                            value: (i as any).children[0].text
                        }
                    ],
                    marks: []
                }
                dast.children.push(node);
            } else {

            }
        }

        setTest(dast);
    }

    return (
        <div className="flex flex-col h-full">
            <SiteTags tags={[_site.faviconMetaTags, [{ tag: "title", content: `Create Post - Midwest Raptor Junkies` }]]} />
            <header>
                <Navbar {...navbar} mode="none" />
            </header>
            <main className="flex-1 flex flex-col items-center">
                <h1 className="font-bold">Creat a post</h1>
                <form className="flex flex-col max-w-5xl w-full gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
                    <input type="text" placeholder='Title' name="title" className="from-input" />
                    <Slate editor={editor} value={[{ type: "paragraph", children: [{ text: 'A line of text in a paragraph.' }], } as any]}>
                        <div className="flex gap-2 items-center mt-2 flex-wrap">
                            <MarkButton format='bold' />
                            <MarkButton format="italic" />
                            <MarkButton format="underline" />
                            <BlockButton format="heading-one" />
                            <BlockButton format="heading-two" />
                            <BlockButton format="block-quote" />
                            <BlockButton format="numbered-list" />
                            <BlockButton format="bulleted-list" />
                            <BlockButton format="left" />
                            <BlockButton format="center" />
                            <BlockButton format="right" />
                            <BlockButton format="justify" />
                        </div>
                        <Editable className="form-textarea mt-4 prose max-w-none" renderElement={renderElement} renderLeaf={renderLeaf} spellCheck autoFocus placeholder="Enter some rich text…" />
                    </Slate>
                    <button type="submit" className='inline-block rounded bg-indigo-600 px-8 py-3 text-sm font-medium text-white transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-indigo-500'>Post</button>
                </form>
                <div className="prose">
                    <StructuredText data={test} />
                </div>
            </main>
            <Footer />
            {preview ? <ExitPreview /> : null}
        </div>
    );
}

export default NewThreadPost;