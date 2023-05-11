import {
  withReact,
  Editable,
  Slate,
  type RenderElementProps,
  type RenderLeafProps,
} from "slate-react";
import { createEditor, Transforms, type Descendant, Editor } from "slate";
import type { NonTextNode } from "datocms-structured-text-slate-utils";
import { useMemo, useCallback, useEffect, useState } from "react";

import {
  EDITOR_ISEMPTY_ID_R,
  EDITOR_ISEMPTY_ID_S,
  EDITOR_RESET_EVENT_ID,
} from "@lib/utils/editor/editorActions";
import EditorToolbar from "@components/community/editor/EditorToolbar";
import RenderElement from "@components/community/editor/RenderElement";
import RenderLeaf from "@components/community/editor/RenderLeaf";
import { withPlugin } from "@lib/utils/editor/textEditorUtils";

type Props = {
  onChange?: (props: { ast: Descendant[]; deletedImages: string[] }) => void;
  value: Descendant[];
  id: string;
};

const TextEditor: React.FC<Props> = ({ onChange, value, id }) => {
  const editor = useMemo(() => withPlugin(withReact(createEditor())), []);
  const renderElement = useCallback(
    (props: RenderElementProps) => <RenderElement {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <RenderLeaf {...props} />,
    []
  );
  const reset = useCallback(() => {
    Transforms.delete(editor, {
      at: {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      },
    });
    editor.children = [{ type: "paragraph", children: [{ text: "" }] }];
    //editor.history = { redos: [], undos: [] };
  }, [editor]);

  const isEmpty = useCallback(() => {
    let state = false;
    if (editor.children.length <= 1) {
      const root = editor.children[0];
      if (root) {
        state = Editor.isEmpty(editor, root as NonTextNode);
      }
    }
    window.dispatchEvent(
      new CustomEvent(`${EDITOR_ISEMPTY_ID_R}${id}`, { detail: state })
    );
  }, [editor, id]);

  useEffect(() => {
    window.addEventListener(`${EDITOR_RESET_EVENT_ID}${id}`, reset, false);
    window.addEventListener(`${EDITOR_ISEMPTY_ID_S}${id}`, isEmpty, false);
    return () => {
      window.removeEventListener(`${EDITOR_ISEMPTY_ID_S}${id}`, isEmpty, false);
      window.removeEventListener(`${EDITOR_RESET_EVENT_ID}${id}`, reset, false);
    };
  }, [id, reset, isEmpty]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(e) => {
        if (onChange) onChange({ ast: e, deletedImages: editor.deletedImages });
      }}
    >
      <EditorToolbar />
      <Editable
        style={{ minHeight: "100px" }}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        spellCheck
        autoFocus
        placeholder="Write something here..."
        className="prose relative max-w-none rounded-sm border border-neutral-400 px-2 py-1 focus:outline-none"
      />
    </Slate>
  );
};

export default TextEditor;
