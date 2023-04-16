import { Editor, Transforms, Element } from 'slate';
import type { Text, NonTextNode, Heading } from 'datocms-structured-text-slate-utils';

export type Mark = keyof Omit<Text, "text">;
type BlockType = keyof NonTextNode;
export type FormatType = NonTextNode["type"];
type ListStyle = "bulleted" | "numbered";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const insertImage = (editor: Editor, image: HTMLImageElement) => {
    const el: NonTextNode = { type: "block", blockModelId: "image", id: "Wadf", width: image.width, height: image.height, url: image.src, children: [{ text: "" }] };
    Transforms.insertNodes(editor, el);
}

export const toggleMark = (editor: Editor, format: Mark) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) return Editor.removeMark(editor, format);
    Editor.addMark(editor, format, true);
}

export const toggleBlock = (editor: Editor, format: FormatType, style?: { level?: HeadingLevel, list?: ListStyle }) => {
    const isActive = isBlockActive(editor, "type");

    const isList = format === "list";
    const isHeading = format === "heading";

    Transforms.unwrapNodes(editor, {
        match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === "list",
        split: true
    });

    let newProps: Partial<Element> = {
        type: isActive ? "paragraph" : isList ? "listItem" : format
    }

    if (isHeading) {
        (newProps as Heading).level = style?.level ?? 1;
    }

    Transforms.setNodes<Element>(editor, newProps);

    if (!isActive && isList) {
        const block = { type: format, children: [], style: style?.list ?? "bulleted" } satisfies NonTextNode;
        Transforms.wrapNodes(editor, block);
    }
}

const isBlockActive = (editor: Editor, format: string, blockType: BlockType = "type") => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n => !Editor.isEditor(n) && n[blockType as never] === format
        })
    );

    return !!match;
}

export const isMarkActive = (editor: Editor, format: Mark) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
}