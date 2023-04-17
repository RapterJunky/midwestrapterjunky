import type { RenderLeafProps } from 'slate-react';

const RenderLeaf: React.FC<RenderLeafProps> = ({ attributes, leaf, children }) => {

    if (leaf.strong) {
        children = (
            <strong>{children}</strong>
        );
    }
    if (leaf.code) {
        children = (
            <code>{children}</code>
        );
    }
    if (leaf.emphasis) {
        children = (
            <em>{children}</em>
        );
    }
    if (leaf.highlight) {
        children = (
            <mark>{children}</mark>
        );
    }
    if (leaf.underline) {
        children = (
            <u>{children}</u>
        );
    }
    if (leaf.strikethrough) {
        children = (
            <s>
                {children}
            </s>
        );
    }

    return (
        <span {...attributes}>{children}</span>
    );
}

export default RenderLeaf;