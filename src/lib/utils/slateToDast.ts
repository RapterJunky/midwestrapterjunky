import { Node as SlateNode } from 'slate';
import {
    allowedAttributes,
    defaultMarks,
    type BlockType,
    type Blockquote as FieldBlockquote,
    type Code as FieldCode,
    type Document as FieldDocument,
    type InlineItem as FieldInlineItem,
    type ItemLink as FieldItemLink,
    type Mark,
    type Span as FieldSpan,
    type DefaultMark
} from 'datocms-structured-text-utils';
import type { Block, BlockquoteSource, Node, NonTextNode, Paragraph, Heading, ThematicBreak, ItemLink, Text, InlineItem, Link, List, Blockquote, ListItem, InlineNode, Code } from 'datocms-structured-text-slate-utils';

type FieldBlockWithFullItem = {
    type: BlockType;
    /** The DatoCMS block record ID */
    item: Record<string, unknown>;
};

type Item = {
    id?: string;
    type: 'item';
    attributes: Record<string, unknown>;
    relationships: {
        item_type: {
            data: {
                id: string;
                type: 'item_type';
            };
        };
    };
};

export const isNonTextNode = (node: SlateNode): node is NonTextNode =>
    'type' in node;

export const isText = (node: SlateNode): node is Text =>
    !isNonTextNode(node) && 'text' in node;

export const isThematicBreak = (el: NonTextNode): el is ThematicBreak => el.type === 'thematicBreak';

export const isParagraph = (el: NonTextNode): el is Paragraph => el.type === 'paragraph';

export const isBlockquoteSource = (el: NonTextNode): el is Paragraph => el.type === 'blockquoteSource';

export const isHeading = (el: NonTextNode): el is Heading => el.type === 'heading';

export const isLink = (el: NonTextNode): el is Link => el.type === 'link';

export const isItemLink = (el: NonTextNode): el is ItemLink => el.type === "itemLink"

export const isInlineItem = (el: NonTextNode): el is InlineItem => el.type === "inlineItem";

export const isBlock = (el: NonTextNode): el is Block =>
    el.type === "block";

export const isList = (element: NonTextNode): element is List =>
    element.type === "list";

export const isListItem = (element: NonTextNode): element is ListItem =>
    element.type === "listItem";

export const isBlockquote = (element: NonTextNode): element is Blockquote =>
    element.type === "blockquote";

export const isCode = (element: NonTextNode): element is Code =>
    element.type === "code";

export const isInlineNode = (element: NonTextNode): element is InlineNode =>
    ["link", "itemLink", "inlineItem"].includes(element.type);

function innerSerialize(
    nodes: Node[],
    convertBlock: (block: Block) => FieldBlockWithFullItem,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
    return nodes.map((node: Node) => {
        if (isText(node)) {
            const marks: Mark[] = [];

            Object.keys(node).forEach((key) => {
                if (defaultMarks.includes(key as DefaultMark)) {
                    marks.push(key);
                }

                if (key.startsWith('customMark_')) {
                    marks.push(key.replace(/^customMark_/, ''));
                }
            });

            const value = node.text.replace(/\uFEFF/g, '');

            const fieldSpan: FieldSpan = {
                type: 'span',
                // Code block creates \uFEFF char to prevent a bug!
                value,
                marks: marks.length > 0 ? marks : undefined,
            };

            return fieldSpan;
        }

        if (!([
            "paragraph",
            "heading",
            "link",
            "itemLink",
            "inlineItem",
            "block",
            "list",
            "listItem",
            "blockquote",
            "blockquoteSource",
            "code",
            "thematicBreak"
        ] as NonTextNode["type"][]).includes(node.type)) {
            throw new Error(`Don't know how to serialize block of type ${node.type}`);
        }

        if (isBlock(node)) {
            return convertBlock(node);
        }

        if (isCode(node)) {
            const codeBlock: FieldCode = {
                type: 'code',
                code: node.children[0].text,
                highlight: node.highlight,
                language: node.language,
            };

            return codeBlock;
        }

        if (isBlockquote(node)) {
            const childrenWithoutSource = node.children.filter(
                (n) => !isBlockquoteSource(n),
            );
            const sourceNode = node.children.find((n) =>
                isBlockquoteSource(n),
            ) as BlockquoteSource;

            const blockquoteNode: FieldBlockquote = {
                type: 'blockquote',
                children: innerSerialize(childrenWithoutSource, convertBlock),
            };

            if (sourceNode) {
                blockquoteNode.attribution = sourceNode.children[0].text;
            }

            return blockquoteNode;
        }

        if (isInlineItem(node)) {
            const inlineItemNode: FieldInlineItem = {
                type: 'inlineItem',
                item: node.item,
            };

            return inlineItemNode;
        }

        if (isItemLink(node)) {
            const itemLinkNode: FieldItemLink = {
                type: 'itemLink',
                item: node.item,
                meta: node.meta,
                children: innerSerialize(node.children, convertBlock),
            };

            return itemLinkNode;
        }

        if (isThematicBreak(node)) {
            return { type: 'thematicBreak' };
        }

        if (node.type === 'blockquoteSource') {
            return node;
        }

        const serializedNode = allowedAttributes[node.type].reduce((acc, curr) => {
            (acc as Record<string, unknown>)[curr] = (node as Record<string, unknown>)[curr];
            return acc;
        }, { type: node.type } as Paragraph | Heading | Link | List | ListItem);

        /*const serializedNode = {
            type: node.type,
            ...pick(node, allowedAttributes[node.type]),
        };*/

        if (allowedAttributes[node.type].includes('children')) {
            serializedNode.children = innerSerialize(node.children, convertBlock);
        }

        if (isLink(node) && node.meta && node.meta.length > 0) {
            (serializedNode as Link).meta = node.meta;
        }

        return serializedNode;
    });
}

export function slateToDast(
    nodes: Node[] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allFieldsByItemTypeId: Record<string, any[]>,
): FieldDocument | null {
    if (!nodes || nodes.length === 0) {
        return null;
    }

    const children = innerSerialize(nodes, (node: Block) => {
        const { blockModelId, id, ...blockAttributes } = node;

        const recordAttributes: Record<string, unknown> = {};

        const block = allFieldsByItemTypeId[blockModelId];

        if (block) {
            block.forEach((field) => {
                const apiKey = field.attributes.api_key;

                if (field.attributes.field_type === 'structured_text') {
                    recordAttributes[apiKey] = slateToDast(
                        (blockAttributes[apiKey] as unknown) as Node[],
                        allFieldsByItemTypeId,
                    );
                } else if (blockAttributes[apiKey] === '__NULL_VALUE__') {
                    recordAttributes[apiKey] = null;
                } else {
                    recordAttributes[apiKey] = blockAttributes[apiKey];
                }
            });
        }

        const record: Item = {
            type: 'item',
            attributes: recordAttributes,
            relationships: {
                item_type: {
                    data: {
                        id: blockModelId,
                        type: 'item_type',
                    },
                },
            },
        };

        if (id) {
            record.id = id;
        }

        const fieldBlock: FieldBlockWithFullItem = {
            type: 'block',
            item: record,
        };

        return fieldBlock;
    });

    return {
        schema: 'dast',
        document: { type: 'root', children },
    };
}
