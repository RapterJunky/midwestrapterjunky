import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import RichTextToolBar from "./RichTextToolBar";
import type { LexicalEditor } from 'lexical';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const RootEditor = forwardRef<LexicalEditor, { editorConfig: InitialConfigType, height?: string }>(({ editorConfig, height = "min-h-[150px]" }, ref) => {
    return (
        <LexicalComposer initialConfig={editorConfig}>
            <RichTextToolBar />
            <div className="relative prose prose-p:my-0 prose-headings:my-0 max-w-none prose-a:text-blue-500 prose-a:cursor-pointer rounded-sm border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300">
                <RichTextPlugin
                    ErrorBoundary={LexicalErrorBoundary}
                    contentEditable={
                        <div className={cn("flex relative outline-0 border-0 z-0 overflow-auto resize-y", height)}>
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
            <EditorRefPlugin editorRef={ref as ((instance: LexicalEditor | null) => void) | React.MutableRefObject<LexicalEditor | null | undefined>} />
        </LexicalComposer>
    );
});

RootEditor.displayName = "EditorRoot";

export default RootEditor;