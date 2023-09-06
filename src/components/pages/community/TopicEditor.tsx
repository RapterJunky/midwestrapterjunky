"use client";
import { $getRoot, $insertNodes, CLEAR_EDITOR_COMMAND, type LexicalEditor } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { LinkNode } from "@lexical/link";
import { useRef } from "react";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, } from "@/components/ui/select";
import type { ExtendLexicalEditor } from "./editor/plugins/ImagesPlugin";
import { $getNewImages, ImageNode } from "./editor/nodes/ImageNode";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { Input } from "@/components/ui/input";
import RootEditor from "./editor/RootEditor";
import TagInput from "./editor/TagInput";

type FormState = {
    content: string,
    title: string;
    category: string;
    tags: string[];
    notification: boolean;
}

const editorConfig = {
    namespace: "topic-editor",
    onError(error) {
        console.error(error);
        throw error;
    },
    nodes: [LinkNode, ListItemNode, ListNode, HeadingNode, QuoteNode, ImageNode],
    theme: {
        text: {
            strikethrough: "line-through",
            underline: "underline",
            underlineStrikethrough: "underline line-through"
        },
        root: "select-text whitespace-pre-wrap break-words px-2 block relative min-h-[400px] flex-1 md:min-h-[700px] outline-none"
    }
} as InitialConfigType;


const TopicEditor: React.FC<React.PropsWithChildren<{ defaultCategory: string }>> = ({ children, defaultCategory }) => {
    const searchParams = useSearchParams();
    const editMode = searchParams?.get("editId") !== null;
    const { status } = useSession({
        required: true,
    })
    const editorRef = useRef<LexicalEditor>(null);
    const form = useForm<FormState>({
        defaultValues: async () => {
            const id = searchParams?.get("editId");
            if (id) {
                if (!editorRef.current) throw new Error("Unable to update editor");

                const request = await fetch(`/api/community/topic?post=${id}`);

                if (!request.ok) throw new Error("Failed to load post");

                const content = await request.json() as FormState;

                await new Promise<void>((ok) => {
                    editorRef.current?.update(() => {
                        const parser = new DOMParser();
                        const dom = parser.parseFromString(content.content, "text/html");
                        const nodes = $generateNodesFromDOM(editorRef.current as LexicalEditor, dom);
                        $getRoot().select();
                        $insertNodes(nodes);
                        ok();
                    });
                });

                return content;
            }

            return {
                content: "",
                title: "",
                notification: true,
                category: defaultCategory,
                tags: []
            }
        },
    });

    const onSubmit = async (formState: FormState) => {
        try {
            if (!editorRef.current) return;
            const state = editorRef.current.getEditorState();
            if (state.isEmpty()) throw new Error("Editor is empty!", { cause: "content" });

            const formData = new FormData();

            await new Promise<void>((ok, rej) => {
                state.read(() => {
                    const html = $generateHtmlFromNodes(editorRef.current as LexicalEditor, null);
                    formData.set("content", html);

                    const deletedIds = (editorRef.current as ExtendLexicalEditor).getDeletedImages();

                    const images = $getNewImages();

                    if (images.length > 5) return rej(new Error("Can not upload more then 5 images at once.", { cause: "content" }));

                    deletedIds.forEach((id) => {
                        formData.append("deletedId", id);
                    });

                    images.forEach(image => {
                        if (image.file) formData.append("image", image.file, image.id);
                    });

                    ok()
                });
            });

            formState.tags.forEach(tag => {
                formData.append("tag", tag);
            });

            formData.set("category", formState.category);
            formData.set("notification", formState.notification ? "true" : "false");
            formData.set("title", formState.title);

            if (editMode) {
                const id = searchParams?.get("editId");
                if (!id) throw new Error("Unable to update, missing post id");
                formData.set("postId", id);
            }

            const request = await fetch("/api/community/topic", {
                method: editMode ? "PUT" : "POST",
                body: formData,
            });

            if (!request.ok) {
                throw new Error("Failed to update/create post");
            }

            editorRef.current.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        } catch (error) {
            form.setError((error as Error)?.cause as "title" | "content" | "root" | "category" ?? "root", {
                message: (error as Error).message,
                type: "validate"
            });
        }
    }

    return (
        <Form {...form}>
            <Dialog open={form.formState.isSubmitting}>
                <DialogContent closeable={false}>
                    <Spinner className="h-14 w-14" />
                </DialogContent>
            </Dialog>
            <form className="grid h-full grid-cols-1 items-stretch gap-6 md:grid-cols-[1fr_200px]" onSubmit={form.handleSubmit(onSubmit)}>
                {form.formState.isLoading || status === "loading" ? (
                    <>
                        <div className="md:order-1">
                            <div className="flex h-full flex-col space-y-4">
                                <Skeleton className="min-h-[400px] flex-1 md:min-h-[700px]" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-10 w-14" />
                            </div>
                        </div>
                        <div className="block sm:flex flex-col space-y-4 order-first md:order-2">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>

                    </>
                ) : (<>
                    <div className="md:order-1">
                        <div className="flex h-full flex-col space-y-4">
                            <FormField control={form.control} name="content" render={() => (
                                <FormItem>
                                    <FormControl>
                                        <RootEditor height="min-h-[400px] flex-1 md:min-h-[700px]" editorConfig={editorConfig} ref={editorRef} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="flex items-center space-x-2">
                                <Button data-cy="post-submit" disabled={form.formState.isSubmitting} type="submit">Submit</Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-col space-y-4 sm:flex order-first md:order-2">
                        <FormField rules={{
                            maxLength: { message: "Title is too long", value: 255 },
                            minLength: { message: "Title is too short", value: 3 },
                            required: { message: "A title is required.", value: true }
                        }}
                            control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input minLength={3} maxLength={255} required {...field} placeholder="title" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        <FormField rules={{ required: { message: "A category is required.", value: true } }} control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <Select disabled={editMode} value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        {children}
                                    </Select>
                                </FormControl>
                                <FormMessage />
                                <FormDescription>The category to which this post will be added to.</FormDescription>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="tags" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                    <TagInput onBlur={field.onBlur} value={field.value ?? []} onChange={field.onChange} vailidate={(tag, tags) => {
                                        if (!tag.length || tag.length < 3) {
                                            form.setError("tags", {
                                                message: "The minium length for a tag is 3.",
                                                type: "minLength",
                                            });
                                            return false;
                                        }
                                        if (tag.length > 12) {
                                            form.setError("tags", {
                                                message: "The maxium length for a tag is 12.",
                                                type: "maxLength",
                                            });
                                            return false;
                                        }

                                        if (tags.includes(tag)) {
                                            form.setError("tags", {
                                                message: `The tag "${tag}" is already in the list.`,
                                                type: "pattern",
                                            });
                                            return false;
                                        }

                                        form.clearErrors("tags");

                                        return true;
                                    }} />
                                </FormControl>
                                <FormMessage />
                                <FormDescription>Short 1-2 words desciption of the posts content.</FormDescription>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="notification" render={({ field: { value, onChange, ...field } }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <Checkbox checked={value} onCheckedChange={onChange} {...field} />
                                    </FormControl>
                                    <FormLabel>Notifications</FormLabel>
                                </div>

                                <FormMessage />
                                <FormDescription>
                                    Allow sending notifications to you by email about events on your post.
                                </FormDescription>
                            </FormItem>
                        )} />
                    </div>

                </>)}
            </form>
        </Form>
    );
}

export default TopicEditor;