"use client";
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { CLEAR_EDITOR_COMMAND, type LexicalEditor } from "lexical";
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { $generateHtmlFromNodes } from '@lexical/html';
import { useForm } from "react-hook-form";
import { useRef } from "react";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import ImagesPlugin, { type ExtendLexicalEditor } from "./plugins/ImagesPlugin";
import { $getNewImages, ImageNode } from "./nodes/ImageNode";
import RichTextToolBar from "./RichTextToolBar";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";

export type FormState = {
    message: unknown[];
    deletedImages: string[];
};

const editorConfig = {
    namespace: "usercomment",
    onError(error) {
        console.error(error);
        throw error;
    },
    nodes: [LinkNode, ListItemNode, ListNode, HeadingNode, QuoteNode, ImageNode, AutoLinkNode],
    theme: {
        text: {
            strikethrough: "line-through",
            underline: "underline",
            underlineStrikethrough: "underline line-through"
        },
        root: "select-text whitespace-pre-wrap break-words px-2 block relative min-h-[150px] outline-none"
    }
} as InitialConfigType

const RichtextEditor: React.FC<{
    commentId?: string;
    postId: string;
    onSubmit: (formData: FormData) => Promise<void>
}> = ({ onSubmit, postId }) => {
    const editorRef = useRef<LexicalEditor>(null);
    const form = useForm<FormState>({
        defaultValues: {
            deletedImages: [],
        },
    });

    const formSubmit = async () => {
        try {
            if (!editorRef.current) return;
            const state = editorRef.current.getEditorState();
            if (state.isEmpty()) throw new Error("Editor is empty!");

            const formData = new FormData();

            formData.set("postId", postId);

            await new Promise<void>((ok, rej) => {
                state.read(() => {
                    const html = $generateHtmlFromNodes(editorRef.current as LexicalEditor, null);
                    formData.set("content", html);

                    const deletedIds = (editorRef.current as ExtendLexicalEditor).getDeletedImages();

                    const images = $getNewImages();

                    if (images.length > 5) return rej(new Error("Can not upload more then 5 images at once."));

                    deletedIds.forEach((id) => {
                        formData.append("deletedId", id);
                    });

                    images.forEach(image => {
                        if (image.file) formData.append("image", image.file, image.id);
                    });

                    ok()
                });
            });

            editorRef.current.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);

            await onSubmit(formData);

        } catch (error) {
            form.setError("message", {
                message: (error as Error)?.message ?? "An Error happened.",
                type: "validate",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(formSubmit)}>
                <FormField control={form.control} name="message" render={() => (
                    <FormItem className="my-4">
                        <FormControl>
                            <LexicalComposer initialConfig={editorConfig}>
                                <RichTextToolBar />
                                <div className="relative prose prose-p:my-0 prose-headings:my-0 max-w-none prose-a:text-blue-500 prose-a:cursor-pointer rounded-sm border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300">
                                    <RichTextPlugin
                                        ErrorBoundary={LexicalErrorBoundary}
                                        contentEditable={
                                            <div className="min-h-[150px] flex relative outline-0 border-0 z-0 overflow-auto resize-y">
                                                <div className="flex-auto relative resize-y -z-[1]">
                                                    <ContentEditable />
                                                </div>
                                            </div>
                                        }
                                        placeholder={<div className="pointer-events-none absolute top-2 left-5 right-5 select-none overflow-hidden text-zinc-400 text-ellipsis whitespace-nowrap">Enter some text...</div>}
                                    />
                                </div>
                                <ListPlugin />
                                <LinkPlugin />
                                <ImagesPlugin />
                                <ClearEditorPlugin />
                                <EditorRefPlugin editorRef={editorRef} />
                            </LexicalComposer>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="flex w-full justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Spinner className="mr-2 h-6 w-6" /> : null}
                        Submit
                    </Button>
                </div>
            </form>
        </Form >
    )
}

export default RichtextEditor;