"use client";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkNode } from "@lexical/link"
import { ListNode, ListItemNode } from "@lexical/list";
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
//import { Bold, Heading1, Heading2, Heading3, Italic, Link, List, ListOrdered, Paintbrush, Quote, Strikethrough, Underline } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";


export type FormState = {
    message: unknown[];
    deletedImages: string[];
};

const editorConfig = {
    namespace: "usercomment",
    onError(error) {
        throw error;
    },
    nodes: [LinkNode, ListItemNode, ListNode],
    theme: {
        root: "flex min-h-[100px] w-full rounded-sm border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
    }
} as InitialConfigType

const CommentBox: React.FC<{
    commentId?: string;
    postId: string;
    onSubmit: (formData: FormData) => Promise<void>
}> = ({ onSubmit }) => {

    const form = useForm<FormState>({
        defaultValues: {
            deletedImages: [],
            message: [{ type: "paragraph", children: [{ text: "" }] }]
        },
    });

    const formSubmit = async (state: FormState) => {
        try {
            const formData = new FormData();

            if (state.deletedImages) {
                state.deletedImages.forEach((item) => {
                    formData.append("deletedImages[]", item);
                });
            }

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
            <form id="comment-form" onSubmit={form.handleSubmit(formSubmit)}>
                <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem className="my-4">
                        <FormControl>
                            <div className="relative">
                                <LexicalComposer initialConfig={editorConfig}>
                                    <RichTextPlugin
                                        ErrorBoundary={LexicalErrorBoundary}
                                        contentEditable={<ContentEditable />}
                                        placeholder={<div className="pointer-events-none absolute left-4 top-2 select-none overflow-hidden text-zinc-400">Enter some text...</div>}
                                    />
                                    <HistoryPlugin />
                                    <ListPlugin />
                                    <LinkPlugin />
                                    <OnChangePlugin onChange={(ev) => {
                                        console.log(ev);
                                    }} />
                                </LexicalComposer>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="flex w-full justify-end">
                    <Button form="comment-form" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Spinner className="mr-2 h-6 w-6" /> : null}
                        Submit
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default CommentBox;