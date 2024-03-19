import ImagesPlugin from "./plugins/ImagesPlugin";
import RichTextToolBar from "./RichTextToolBar";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import {
  LexicalComposer,
  type InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import type { LexicalEditor } from "lexical";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const RootEditor = forwardRef<
  LexicalEditor,
  { editorConfig: InitialConfigType; height?: string }
>(({ editorConfig, height = "min-h-[150px]" }, ref) => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <RichTextToolBar />
      <div className="prose relative max-w-none rounded-sm border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 prose-headings:my-0 prose-p:my-0 prose-a:cursor-pointer prose-a:text-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300">
        <RichTextPlugin
          ErrorBoundary={LexicalErrorBoundary}
          contentEditable={
            <div
              className={cn(
                "relative z-0 flex resize-y overflow-auto border-0 outline-0",
                height,
              )}
            >
              <div className="relative -z-[1] flex-auto resize-y">
                <ContentEditable />
              </div>
            </div>
          }
          placeholder={
            <div className="pointer-events-none absolute left-5 right-5 top-2 select-none overflow-hidden text-ellipsis whitespace-nowrap text-zinc-400">
              Enter some text...
            </div>
          }
        />
      </div>
      <ListPlugin />
      <LinkPlugin />
      <ImagesPlugin />
      <ClearEditorPlugin />
      <EditorRefPlugin
        editorRef={
          ref as
            | ((instance: LexicalEditor | null) => void)
            | React.MutableRefObject<LexicalEditor | null | undefined>
        }
      />
    </LexicalComposer>
  );
});

RootEditor.displayName = "EditorRoot";

export default RootEditor;
