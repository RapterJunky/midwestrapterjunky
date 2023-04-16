import { useMemo, useCallback, useRef } from 'react';
import { FaBold, FaFileImage, FaHighlighter, FaItalic, FaListOl, FaListUl, FaStrikethrough, FaUnderline } from 'react-icons/fa';
import { HiLink } from 'react-icons/hi';
import { createEditor } from 'slate';
import { withReact, Editable, Slate, useSlate, type RenderElementProps, type RenderLeafProps } from 'slate-react';
import RenderElement from './RenderElement';
import RenderLeaf from './RenderLeaf';
import { toggleBlock, toggleMark, HeadingLevel, isMarkActive, insertImage } from '@/lib/utils/textEditorUtils';

const TextEditor: React.FC = () => {
    const wrapper = useRef<HTMLInputElement>(null);
    const editor = useMemo(() => withReact(createEditor()), []);
    const renderElement = useCallback((props: RenderElementProps) => (<RenderElement {...props} />), []);
    const renderLeaf = useCallback((props: RenderLeafProps) => <RenderLeaf {...props} />, []);

    return (
        <Slate editor={editor} value={[{ type: "paragraph", children: [{ text: "A Line of text in a paragraph" }] }]}>
            <div className="border border-neutral-400 flex rounded-sm flex-wrap">
                <select onChange={(e) => {
                    if (e.target.value === "normal") {
                        return toggleBlock(editor, "paragraph");
                    }
                    toggleBlock(editor, "heading", { level: (parseInt(e.target.value) ?? 1) as HeadingLevel });
                }} title="Text heading" className="border-none">
                    <option value="normal">Normal</option>
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                    <option value="4">Heading 4</option>
                    <option value="5">Heading 5</option>
                    <option value="6">Heading 6</option>
                </select>
                <button data-headlessui-state={isMarkActive(editor, "emphasis") ? "active" : ""} type="button" className="p-2 hover:bg-neutral-400 hover:text-neutral-100 rounded-sm ui-active:bg-slate-600" onClick={() => toggleMark(editor, "emphasis")}>
                    <FaItalic className="h-5 w-5" title="empize" />
                </button>
                <button type="button" className="p-2 hover:bg-neutral-400 hover:text-neutral-100 rounded-sm">
                    <FaStrikethrough className="h-5 w-5" title="strikethrough" onClick={() => toggleMark(editor, "strikethrough")} />
                </button>
                <button type="button" className="p-2 hover:bg-neutral-400 hover:text-neutral-100 rounded-sm">
                    <FaHighlighter className="h-5 w-5" title="highlight" onClick={() => toggleMark(editor, "highlight")} />
                </button>
                <button data-headlessui-state={isMarkActive(editor, "underline") ? "active" : ""} type="button" className="p-2 hover:bg-neutral-400 hover:text-neutral-100 rounded-sm ui-active:bg-gray-700" onClick={() => toggleMark(editor, "underline")}>
                    <FaUnderline className="h-5 w-5" title="underline" />
                </button>
                <button type="button" className="p-2 hover:bg-neutral-400 hover:text-neutral-100 rounded-sm" onClick={() => toggleMark(editor, "strong")}>
                    <FaBold className="h-5 w-5" title="bold" />
                </button>
                <button type="button" className="p-2 hover:bg-neutral-400 hover:text-neutral-100 rounded-sm" onClick={() => toggleBlock(editor, "list", { list: "bulleted" })} title="Create unorder list">
                    <FaListUl className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 hover:bg-neutral-400 hover:text-neutral-100 rounded-sm" onClick={() => toggleBlock(editor, "list", { list: "numbered" })} title="Create ordered list">
                    <FaListOl className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 hover:bg-neutral-400 hover:text-neutral-100 rounded-sm" onClick={() => toggleBlock(editor, "link")} title="Add a link">
                    <HiLink className="h-5 w-5" />
                </button>
                <input accept="image/*" ref={wrapper} onChange={async (e) => {
                    const file = e.target.files?.item(0);
                    if (!file) return;

                    const url = await new Promise<string>((ok, reject) => {
                        const reader = new FileReader();
                        reader.addEventListener("load", () => {
                            const url = reader.result;
                            if (!url) return reject("Failed to get image url");
                            ok(url as string);
                        }, false);
                        reader.readAsDataURL(file);
                    });

                    const image = new Image();
                    image.src = url;
                    image.onload = () => insertImage(editor, image);

                }} className="hidden" type="file" />
                <button type="button" className="p-2 hover:bg-neutral-400 hover:text-neutral-100 rounded-sm" title="Upload Image" onClick={async () => {
                    if (!wrapper.current) return;
                    wrapper.current.click();
                }}>
                    <FaFileImage className="h-5 w-5" />
                </button>
            </div>
            <Editable disableDefaultStyles renderElement={renderElement} renderLeaf={renderLeaf} spellCheck autoFocus placeholder="Write somethings here..." className="border border-neutral-400 prose max-w-none rounded-sm py-1 px-2 min-h-[100px]" />
        </Slate>
    );
}

export default TextEditor;