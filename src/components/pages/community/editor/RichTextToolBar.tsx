import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  type RangeSelection,
} from "lexical";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Paintbrush,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import {
  $isListNode,
  ListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { useCallback, useEffect, useReducer, useState } from "react";
import { $setBlocksType, $isAtNodeEnd } from "@lexical/selection";
import { $isLinkNode, $isAutoLinkNode } from "@lexical/link";
import { Button } from "@/components/ui/button";
import ImageDialog from "./ImageDialog";
import LinkDialog from "./LinkDialog";

const defaultEditorState = {
  isBold: false,
  isItalic: false,
  isLink: false,
  isUnderline: false,
  isStrikethrough: false,
  isHighlight: false,
  blockType: "",
};

function editorStateReducer(
  state: typeof defaultEditorState,
  action: { ev: keyof typeof defaultEditorState; payload: boolean | string },
) {
  state[action.ev] = action.payload as never;
  return {
    ...state,
  };
}

function getSelectedNode(selection: RangeSelection) {
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();

  if (anchorNode === focusNode) return anchorNode;

  if (selection.isBackward()) {
    return $isAtNodeEnd(selection.focus) ? anchorNode : focusNode;
  }

  return $isAtNodeEnd(selection.anchor) ? focusNode : anchorNode;
}

const RichTextToolBar: React.FC = () => {
  const [state, dispatch] = useReducer(editorStateReducer, defaultEditorState);
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const formatHeading = (heading: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(heading));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const $updateToolBar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();

          dispatch({ ev: "blockType", payload: type });
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          dispatch({ ev: "blockType", payload: type });
        }
      }

      dispatch({ ev: "isBold", payload: selection.hasFormat("bold") });
      dispatch({ ev: "isItalic", payload: selection.hasFormat("italic") });
      dispatch({
        ev: "isUnderline",
        payload: selection.hasFormat("underline"),
      });
      dispatch({
        ev: "isStrikethrough",
        payload: selection.hasFormat("strikethrough"),
      });
      dispatch({
        ev: "isHighlight",
        payload: selection.hasFormat("highlight"),
      });

      const node = getSelectedNode(selection);
      const parent = node.getParent();

      dispatch({
        ev: "isLink",
        payload: $isLinkNode(parent) || $isAutoLinkNode(node),
      });
    }
  }, [activeEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, newEditor) => {
          $updateToolBar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor, $updateToolBar]);

  useEffect(() => {
    return mergeRegister(
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => $updateToolBar());
      }),
    );
  }, [activeEditor, $updateToolBar]);

  return (
    <div className="flex gap-1 border border-zinc-200 p-1">
      <Button
        data-headlessui-state={state.isBold ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        variant="ghost"
        size="icon"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        data-headlessui-state={state.isItalic ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        data-headlessui-state={state.isHighlight ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "highlight")}
      >
        <Paintbrush className="h-4 w-4" />
      </Button>
      <Button
        data-headlessui-state={state.isStrikethrough ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        variant="ghost"
        size="icon"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        data-headlessui-state={state.isUnderline ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        data-headlessui-state={state.blockType === "ol" ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        variant="ghost"
        size="icon"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        data-headlessui-state={state.blockType === "ul" ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        variant="ghost"
        size="icon"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        data-headlessui-state={state.blockType === "h1" ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => {
          state.blockType === "h1" ? formatParagraph() : formatHeading("h1");
        }}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        data-headlessui-state={state.blockType === "h2" ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => {
          state.blockType === "h2" ? formatParagraph() : formatHeading("h2");
        }}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        data-headlessui-state={state.blockType === "h3" ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => {
          state.blockType === "h3" ? formatParagraph() : formatHeading("h3");
        }}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        data-headlessui-state={state.blockType === "quote" ? "active" : ""}
        className="h-8 w-8 ui-active:text-blue-500"
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => {
          state.blockType === "quote" ? formatParagraph() : formatQuote();
        }}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <LinkDialog activeEditor={activeEditor}>
        <Button
          data-headlessui-state={state.isLink ? "active" : ""}
          className="h-8 w-8 ui-active:text-blue-500"
          type="button"
          variant="ghost"
          size="icon"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </LinkDialog>
      <ImageDialog activeEditor={activeEditor}>
        <Button
          data-headlessui-state={state.blockType === "image" ? "active" : ""}
          className="h-8 w-8 ui-active:text-blue-500"
          type="button"
          variant="ghost"
          size="icon"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </ImageDialog>
    </div>
  );
};

export default RichTextToolBar;
