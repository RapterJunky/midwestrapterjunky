"use client";

import { $getNewImages, ImageNode } from "./nodes/ImageNode";
import { type ExtendLexicalEditor } from "./plugins/ImagesPlugin";
import RootEditor from "./RootEditor";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  $getRoot,
  $insertNodes,
  CLEAR_EDITOR_COMMAND,
  type LexicalEditor,
} from "lexical";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Spinner from "@/components/ui/Spinner";

export type FormState = {
  message: unknown[];
};

const RichtextEditor: React.FC<{
  content?: string;
  id: string;
  onSubmit: (formData: FormData) => Promise<void>;
}> = ({ onSubmit, id, content }) => {
  const editorRef = useRef<LexicalEditor>(null);
  const form = useForm<FormState>();

  const formSubmit = async () => {
    try {
      if (!editorRef.current) return;
      const state = editorRef.current.getEditorState();
      if (state.isEmpty()) throw new Error("Editor is empty!");

      const formData = new FormData();

      formData.set("id", id);

      await new Promise<void>((ok, rej) => {
        state.read(() => {
          const html = $generateHtmlFromNodes(
            editorRef.current as LexicalEditor,
          );
          formData.set("content", html);

          const deletedIds = (
            editorRef.current as ExtendLexicalEditor
          ).getDeletedImages();

          const images = $getNewImages();

          if (images.length > 5)
            return rej(new Error("Can not upload more then 5 images at once."));

          deletedIds.forEach((id) => {
            formData.append("deletedId", id);
          });

          images.forEach((image) => {
            if (image.file) formData.append("image", image.file, image.id);
          });

          ok();
        });
      });

      await onSubmit(formData);

      editorRef.current.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    } catch (error) {
      form.setError("message", {
        message: (error as Error)?.message ?? "An Error happened.",
        type: "validate",
      });
    }
  };

  const editorConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: "usercomment",
      onError(error) {
        console.error(error);
        throw error;
      },
      nodes: [
        LinkNode,
        ListItemNode,
        ListNode,
        HeadingNode,
        QuoteNode,
        ImageNode,
      ],
      editorState(editor) {
        if (content?.length)
          editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(content, "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);
            $getRoot().select();
            $insertNodes(nodes);
          });
      },
      theme: {
        text: {
          strikethrough: "line-through",
          underline: "underline",
          underlineStrikethrough: "underline line-through",
        },
        root: "select-text whitespace-pre-wrap break-words px-2 block relative min-h-[150px] outline-none",
      },
    }),
    [content],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(formSubmit)}>
        <FormField
          control={form.control}
          name="message"
          render={() => (
            <FormItem className="my-4">
              <FormControl>
                <RootEditor editorConfig={editorConfig} ref={editorRef} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex w-full justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Spinner className="mr-2 h-6 w-6" />
            ) : null}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RichtextEditor;
