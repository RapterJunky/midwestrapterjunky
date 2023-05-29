import { Editor, Transforms, Element, Range, Path, Node, type Location } from "slate";
import type {
  Text,
  NonTextNode,
  Heading,
  List,
  Link,
  Paragraph,
} from "datocms-structured-text-slate-utils";
import { ReactEditor } from "slate-react";

export type Mark = keyof Omit<Text, "text">;
type BlockType = keyof NonTextNode;
export type FormatType = NonTextNode["type"];
export type ListStyle = "bulleted" | "numbered";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const toggleMark = (editor: Editor, format: Mark) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) return Editor.removeMark(editor, format);
  Editor.addMark(editor, format, true);
};

export const toggleBlock = (
  editor: Editor,
  format: FormatType,
  style?: { level?: HeadingLevel; list?: ListStyle }
) => {
  const isActive = isBlockActive(editor, format, style);

  const isList = format === "list";
  const isHeading = format === "heading";

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === "list",
    split: true,
  });

  const newProps: Partial<Element> = {
    type: isActive ? "paragraph" : isList ? "listItem" : format,
  };

  if (isHeading) {
    (newProps as Heading).level = style?.level ?? 1;
  }

  Transforms.setNodes<Element>(editor, newProps);

  if (!isActive && isList) {
    const block = {
      type: format,
      children: [],
      style: style?.list ?? "bulleted",
    } satisfies NonTextNode;
    Transforms.wrapNodes(editor, block);
  }
};

export const getActiveHeading = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) return "normal";

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && (n as NonTextNode).type === "heading",
    })
  );
  if (!match) return "normal";
  return (match[0] as Heading).level.toString();
};

export const isBlockActive = (
  editor: Editor,
  format: FormatType,
  style?: { list?: ListStyle; level?: HeadingLevel },
  blockType: BlockType = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        const active = !Editor.isEditor(n) && n[blockType as never] === format;
        if (format === "list" && style?.list)
          return active && (n as List).style === style.list;
        if (format === "heading" && style?.level)
          return active && (n as Heading).level === style.level;
        return active;
      },
    })
  );

  return !!match;
};

export const isMarkActive = (editor: Editor, format: Mark) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const insertImage = (
  editor: Editor,
  image: HTMLImageElement,
  file: File
) => {
  const el: NonTextNode = {
    type: "block",
    blockModelId: "ImageRecord",
    id: crypto.randomUUID(),
    width: image.width,
    height: image.height,
    file,
    src: image.src,
    children: [{ text: "" }],
  };
  Transforms.insertNodes(editor, el);
};

export const removeLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === "link"
  });
}

export const insertLink = (editor: Editor, url: string) => {
  const { selection } = editor;
  const link: Link = {
    type: "link",
    url,
    children: [
      { text: url }
    ]
  };

  ReactEditor.focus(editor);

  if (selection) {
    const [parentNode, parentPath] = Editor.parent(editor, selection.focus?.path);

    // Remove the Link node if we're inserting a new link node inside of another
    // link.
    if ((parentNode as NonTextNode).type === "link") removeLink(editor);

    if (editor.isVoid(parentNode as NonTextNode)) {
      // Insert the new link after the void node
      Transforms.insertNodes(editor, { type: "paragraph", children: [link] } as Paragraph, {
        at: Path.next(parentPath),
        select: true
      });
    } else if (Range.isCollapsed(selection)) {
      // Insert the new link in our last known location
      Transforms.insertNodes(editor, link, { select: true });
    } else {
      // Wrap the currently selected range of text into a Link
      Transforms.wrapNodes(editor, link, { split: true });
      // Remove the highlight and move the cursor to the end of the highlight
      Transforms.collapse(editor, { edge: "end" });
    }

    return;
  }

  Transforms.insertNodes(editor, { type: "paragraph", children: [link] } as Paragraph);
};

export const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && n.type === "link",
  });
  return !!link;
};

export const withPlugin = (editor: Editor, openDialog: (url: string) => void) => {
  const { isVoid, insertData, isInline, insertBreak, deleteBackward } = editor;
  editor.deletedImages = [];
  editor.editLink = openDialog;

  editor.isInline = (el) =>
    ["link", "itemLink", "inlineItem"].includes(el.type) || isInline(el);
  editor.isVoid = (el) =>
    ["block", "inlineItem", "thematicBreak"].includes(el.type) || isVoid(el);

  editor.insertData = (data) => {
    const { files } = data;

    // allow for copy paste
    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mine] = file.type.split("/");
        if (mine !== "image") continue;

        reader.addEventListener(
          "load",
          () => {
            const url = reader.result as string;
            const image = new Image();
            image.addEventListener(
              "load",
              () => {
                insertImage(editor, image, file);
              },
              false
            );
            image.src = url;
          },
          false
        );
      }
    } else {
      insertData(data);
    }
  };

  //https://stackoverflow.com/questions/61997167/how-to-add-paragraph-after-image-within-a-slate-text-editor
  editor.insertBreak = () => {
    if (!editor.selection || !Range.isCollapsed(editor.selection))
      return insertBreak();

    const selectedNodePath = Path.parent(editor.selection.anchor.path);
    const selectedNode = Node.get(editor, selectedNodePath) as NonTextNode;

    if (
      Editor.isVoid(editor, selectedNode) ||
      selectedNode.type === "blockquote"
    ) {
      return Editor.insertNode(editor, {
        type: "paragraph",
        children: [{ text: "" }],
      } as Paragraph);
    }

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (
      !editor.selection ||
      !Range.isCollapsed(editor.selection) ||
      editor.selection.anchor.offset !== 0
    )
      return deleteBackward(unit);

    const parentPath = Path.parent(editor.selection.anchor.path);
    const parentNode = Node.get(editor, parentPath) as NonTextNode;
    const parentIsEmpty = Node.string(parentNode).length === 0;

    if (parentNode?.type === "blockquote" && parentIsEmpty) {
      Transforms.removeNodes(editor, { at: parentPath });
      Editor.insertNode(editor, {
        type: "paragraph",
        children: [{ text: "" }],
      } as Paragraph);
      return;
    }

    if (parentIsEmpty && Path.hasPrevious(parentPath)) {
      const prevNodePath = Path.previous(parentPath);
      const prevNode = Node.get(editor, prevNodePath) as NonTextNode;
      if (Editor.isVoid(editor, prevNode))
        return Transforms.removeNodes(editor);
    }

    deleteBackward(unit);
  };

  return editor;
};
