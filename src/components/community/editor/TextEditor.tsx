import { withReact, Editable, Slate, type RenderElementProps, type RenderLeafProps } from 'slate-react';
import { useMemo, useCallback } from 'react';
import { createEditor } from 'slate';

import EditorToolbar from '@components/community/editor/EditorToolbar';
import RenderElement from "@components/community/editor/RenderElement";
import RenderLeaf from '@components/community/editor/RenderLeaf';
import { withPlugin } from '@lib/utils/textEditorUtils';

const TextEditor: React.FC = () => {
    const editor = useMemo(() => withPlugin(withReact(createEditor())), []);
    const renderElement = useCallback((props: RenderElementProps) => (<RenderElement {...props} />), []);
    const renderLeaf = useCallback((props: RenderLeafProps) => <RenderLeaf {...props} />, []);

    return (
        <Slate editor={editor} value={[{ type: "paragraph", children: [{ text: "A Line of text in a paragraph" }] }]}>
            <EditorToolbar />
            <Editable disableDefaultStyles renderElement={renderElement} renderLeaf={renderLeaf} spellCheck autoFocus placeholder="Write somethings here..." className="border border-neutral-400 prose max-w-none focus:outline-none rounded-sm py-1 px-2 min-h-[100px]" />
        </Slate>
    );
}

export default TextEditor;