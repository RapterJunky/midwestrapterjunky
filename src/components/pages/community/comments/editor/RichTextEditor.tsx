"use client";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkNode } from "@lexical/link"
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { useForm } from "react-hook-form";
import RichTextToolBar from "./RichTextToolBar";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import ImagesPlugin from "./plugins/ImagesPlugin";
import { ImageNode } from "./nodes/ImageNode";

export type FormState = {
    message: unknown[];
    deletedImages: string[];
};

const urlRegExp = new RegExp(
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
);
const validateUrl = (url: string): boolean => {
    return url === 'https://' || urlRegExp.test(url);
}

const editorConfig = {
    namespace: "usercomment",
    onError(error) {
        throw error;
    },
    nodes: [LinkNode, ListItemNode, ListNode, HeadingNode, QuoteNode, ImageNode],
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
            <form onSubmit={form.handleSubmit(formSubmit)}>
                <FormField control={form.control} name="message" render={({ }) => (
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
                                <LinkPlugin validateUrl={validateUrl} />
                                <ImagesPlugin />
                            </LexicalComposer>
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
        </Form >
    )
}

export default RichtextEditor;