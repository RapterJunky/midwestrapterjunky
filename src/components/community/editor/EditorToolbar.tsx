import { useSlate } from "slate-react";
import { useRef } from 'react';
import { isMarkActive, isBlockActive, toggleBlock, toggleMark, insertImage, insertLink, isLinkActive, type Mark, type FormatType, type ListStyle, type HeadingLevel, getActiveHeading } from "@/lib/utils/editor/textEditorUtils";
import { FaBold, FaFileImage, FaHighlighter, FaItalic, FaLink, FaListOl, FaListUl, FaQuoteRight, FaStrikethrough, FaUnderline } from "react-icons/fa";

const MarkButton: React.FC<React.PropsWithChildren<{ mark: Mark; }>> = ({ mark, children }) => {
    const editor = useSlate();
    return (
        <button onMouseDown={e => e.preventDefault()} onClick={() => toggleMark(editor, mark)} type="button" data-headlessui-state={isMarkActive(editor, mark) ? "active" : ""} className="p-1 text-neutral-500 ui-active:text-black">
            {children}
        </button>
    );
}

const BlockButton: React.FC<React.PropsWithChildren<{ type: FormatType; list?: ListStyle }>> = ({ list, type, children }) => {
    const editor = useSlate();
    return (
        <button onMouseDown={e => e.preventDefault()} onClick={() => toggleBlock(editor, type, { list })} className="p-1 text-neutral-500 ui-active:text-black" type="button" data-headlessui-state={isBlockActive(editor, type, { list }) ? "active" : ""} >
            {children}
        </button>
    );
}

const LinkButton: React.FC = () => {
    const editor = useSlate();
    return (
        <button onMouseDown={e => e.preventDefault()} onClick={() => insertLink(editor, "")} className="p-1 text-neutral-500 ui-active:text-black" type="button" data-headlessui-state={isLinkActive(editor) ? "active" : ""} >
            <FaLink />
        </button>
    );
}

const ImageButton: React.FC = () => {
    const input = useRef<HTMLInputElement>(null);
    const editor = useSlate();
    return (
        <>
            <input type="file" onChange={e => {
                const file = e.target.files?.item(0);
                if (!file) return;

                const reader = new FileReader();
                reader.addEventListener("load", () => {
                    const url = reader.result;
                    if (!url) return;
                    const image = new Image();
                    image.addEventListener("load", () => insertImage(editor, image, file), false);
                    image.src = url as string;
                }, false);
                reader.readAsDataURL(file);
            }} ref={input} accept="image/*" name="image" className="hidden" />
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
                if (!input.current) return;
                input.current.click();
            }} className="p-1 text-neutral-500 ui-active:text-black">
                <FaFileImage />
            </button>
        </>
    );
}

const TextStyleButton: React.FC = () => {
    const editor = useSlate();

    return (
        <select value={getActiveHeading(editor)} onChange={(e) => {
            if (e.target.value === "normal") return toggleBlock(editor, "paragraph");
            toggleBlock(editor, "heading", { level: (parseInt(e.target.value) ?? 1) as HeadingLevel });
        }} title="Text Styles" className="text-sm border-none pr-8">
            <option value="normal">Normal Text</option>
            <option value="1" className="text-3xl">Heading 1</option>
            <option value="2" className="text-2xl">Heading 2</option>
            <option value="3" className="text-xl">Heading 3</option>
            <option value="4" className="text-lg">Heading 4</option>
            <option value="5" className="text-sm">Heading 5</option>
            <option value="6" className="text-sm">Heading 6</option>
        </select>
    );
}

const EditorToolbar: React.FC = () => {
    return (
        <div className="border border-neutral-400 flex gap-1 rounded-sm flex-wrap p-1">
            <TextStyleButton />
            <MarkButton mark="underline">
                <FaUnderline />
            </MarkButton>
            <MarkButton mark="emphasis">
                <FaItalic />
            </MarkButton>
            <MarkButton mark="highlight">
                <FaHighlighter />
            </MarkButton>
            <MarkButton mark="strikethrough">
                <FaStrikethrough />
            </MarkButton>
            <MarkButton mark="strong">
                <FaBold />
            </MarkButton>
            <BlockButton type="list" list="bulleted">
                <FaListUl />
            </BlockButton>
            <BlockButton type="list" list="numbered">
                <FaListOl />
            </BlockButton>
            <BlockButton type="blockquote">
                <FaQuoteRight />
            </BlockButton>
            <LinkButton />
            <ImageButton />
        </div>
    );
}

export default EditorToolbar;