import type { BaseEditor } from 'slate';
import type { ReactEditor } from 'slate-react';

type CustomElementTypes = "image" | "paragraph" | "heading" | "list" | "blockquote" | "link" | "thematicBreak";

type HeadingElement = { type: "heading", level: number, children: CustomText[] }
type BlockQuoteElement = { type: "blockquote", attribution?: string, children: CustomText[] }

type CustomElement = {
    type: CustomElementTypes;
    children: CustomText[]
};
type CustomText = {
    text: string;
    strong?: true;
    emphasis?: true;
    underline?: true;
    strikethrough?: true;
    highlight?: true;
};

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor;
        Element: CustomElement | HeadingElement | BlockQuoteElement;
        Text: CustomText;
    }
}