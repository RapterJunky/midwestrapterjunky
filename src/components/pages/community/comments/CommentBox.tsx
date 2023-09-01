"use client";
import RenderElement from "@/components/community/editor/RenderElement";
import RenderLeaf from "@/components/community/editor/RenderLeaf";
import Spinner from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

import extractSlateImages from "@/lib/utils/editor/extractSlateImages";
import { isBlockActive, isMarkActive, toggleBlock, toggleMark, withPlugin } from "@/lib/utils/editor/textEditorUtils";
import { type NonTextNode } from "datocms-structured-text-slate-utils";
import { Bold, Heading1, Heading2, Heading3, Italic, Link, List, ListOrdered, Paintbrush, Quote, Strikethrough, Underline } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { createEditor, type Descendant } from "slate";
import { Editable, type RenderElementProps, type RenderLeafProps, Slate, withReact } from "slate-react";
import ImageDialog from "./ImageDialog";

export type FormState = {
    message: Descendant[];
    deletedImages: string[];
};

const CommentBox: React.FC<{
    commentId?: string;
    postId: string;
    onSubmit: (formData: FormData) => Promise<void>
}> = ({ onSubmit }) => {
    const editor = useMemo(() => withPlugin(withReact(createEditor()), () => { }), []);

    const renderElement = useCallback((props: RenderElementProps) => <RenderElement {...props} />, []);
    const renderLeaf = useCallback((props: RenderLeafProps) => <RenderLeaf {...props} />, []);

    const form = useForm<FormState>({
        defaultValues: {
            deletedImages: [],
            message: [{ type: "paragraph", children: [{ text: "" }] }]
        }
    });

    const formSubmit = async (state: FormState) => {
        try {
            const formData = new FormData();

            if (state.deletedImages) {
                state.deletedImages.forEach((item) => {
                    formData.append("deletedImages[]", item);
                });
            }

            formData.append("message", JSON.stringify(state.message));

            const images = extractSlateImages(state.message as NonTextNode[]);

            if (images.length > 5) {
                throw new Error("There can be no more then 5 images uploaded at a time.", { cause: "MAX_IMAGES" });
            }

            for (const imageData of images)
                formData.append(
                    "imageData[]",
                    JSON.stringify({
                        id: imageData.id,
                        width: imageData.width,
                        height: imageData.height,
                    }),
                );

            for (const image of images)
                formData.append(`image[${image.id}]`, image.file, image.id);

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
                            <Slate onChange={(e) => {
                                field.onChange(e);
                                form.setValue("deletedImages", editor.deletedImages);
                            }} editor={editor} initialValue={field.value}>
                                <div className="flex flex-wrap gap-1 rounded-sm border border-zinc-400 p-1">
                                    <Button type="button" className="ui-active:text-blue-500 h-7 w-7" data-headlessui-state={isMarkActive(editor, "strong") ? "active" : ""} onMouseDown={(e) => e.preventDefault()} onClick={() => toggleMark(editor, "strong")} title="Bold" variant="ghost" size="icon">
                                        <Bold className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" title="Italic" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon" data-headlessui-state={isMarkActive(editor, "emphasis") ? "active" : ""} onMouseDown={(e) => e.preventDefault()} onClick={() => toggleMark(editor, "emphasis")}>
                                        <Italic className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" title="Underline" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon" data-headlessui-state={isMarkActive(editor, "underline") ? "active" : ""} onMouseDown={(e) => e.preventDefault()} onClick={() => toggleMark(editor, "underline")}>
                                        <Underline className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" title="Strikethrough" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon" data-headlessui-state={isMarkActive(editor, "strikethrough") ? "active" : ""} onMouseDown={(e) => e.preventDefault()} onClick={() => toggleMark(editor, "strikethrough")}>
                                        <Strikethrough className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" title="Highlight" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon" data-headlessui-state={isMarkActive(editor, "highlight") ? "active" : ""} onMouseDown={(e) => e.preventDefault()} onClick={() => toggleMark(editor, "highlight")}>
                                        <Paintbrush className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" title="Quote" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleBlock(editor, "blockquote")} data-headlessui-state={isBlockActive(editor, "blockquote") ? "active" : ""}>
                                        <Quote className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" title="List" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleBlock(editor, "list", { list: "bulleted" })} data-headlessui-state={isBlockActive(editor, "list", { list: "bulleted" }) ? "active" : ""}>
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" title="Ordered List" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleBlock(editor, "list", { list: "numbered" })} data-headlessui-state={isBlockActive(editor, "list", { list: "numbered" }) ? "active" : ""}>
                                        <ListOrdered className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" title="Add Link" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon">
                                        <Link className="h-4 w-4" />
                                    </Button>
                                    <ImageDialog />
                                    <Button type="button" title="Heading 1" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleBlock(editor, "heading", { level: 1 })} data-headlessui-state={isBlockActive(editor, "heading", { level: 1 }) ? "active" : ""}>
                                        <Heading1 className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" title="Heading 2" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleBlock(editor, "heading", { level: 2 })} data-headlessui-state={isBlockActive(editor, "heading", { level: 2 }) ? "active" : ""}>
                                        <Heading2 className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" title="Heading 3" className="h-7 w-7 ui-active:text-blue-500" variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleBlock(editor, "heading", { level: 3 })} data-headlessui-state={isBlockActive(editor, "heading", { level: 3 }) ? "active" : ""}>
                                        <Heading3 className="h-4 w-4" />
                                    </Button>
                                </div>
                                {/**
                                 * disableDefaultStyles breaks input so set styles using style
                                 * @see https://github.com/ianstormtaylor/slate/issues/5379
                                 */}
                                <Editable
                                    renderElement={renderElement}
                                    renderLeaf={renderLeaf}
                                    style={{ minHeight: "100px" }}
                                    className="prose relative max-w-none rounded-sm border border-zinc-200 px-3 py-2 ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                    spellCheck
                                    placeholder="Write something here..." />
                            </Slate>
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