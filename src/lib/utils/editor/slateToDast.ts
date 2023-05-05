import {
  allowedAttributes,
  defaultMarks,
  type BlockType,
  type Blockquote as FieldBlockquote,
  type Code as FieldCode,
  type InlineItem as FieldInlineItem,
  type ItemLink as FieldItemLink,
  type Paragraph as FieldParagraph,
  type Mark,
  type Span as FieldSpan,
  type DefaultMark,
  type Record as DocumentRecord,
} from "datocms-structured-text-utils";
import type {
  Block,
  BlockquoteSource,
  Node,
  NonTextNode,
  Paragraph,
  Heading,
  ThematicBreak,
  ItemLink,
  Text,
  InlineItem,
  Link,
  List,
  Blockquote,
  ListItem,
  InlineNode,
  Code,
} from "datocms-structured-text-slate-utils";
import type { StructuredTextGraphQlResponse } from "react-datocms/structured-text";
import type { Node as SlateNode } from "slate";
import type { SlateImageBlock, DastImageRecord } from "./dastToSlate";

type FieldBlockWithFullItem = {
  type: BlockType;
  item: string;
};

export const isNonTextNode = (node: SlateNode): node is NonTextNode =>
  "type" in node;

export const isText = (node: SlateNode): node is Text =>
  !isNonTextNode(node) && "text" in node;

export const isThematicBreak = (el: NonTextNode): el is ThematicBreak =>
  el.type === "thematicBreak";

export const isParagraph = (el: NonTextNode): el is Paragraph =>
  el.type === "paragraph";

export const isBlockquoteSource = (el: NonTextNode): el is Paragraph =>
  el.type === "blockquoteSource";

export const isHeading = (el: NonTextNode): el is Heading =>
  el.type === "heading";

export const isLink = (el: NonTextNode): el is Link => el.type === "link";

export const isItemLink = (el: NonTextNode): el is ItemLink =>
  el.type === "itemLink";

export const isInlineItem = (el: NonTextNode): el is InlineItem =>
  el.type === "inlineItem";

export const isBlock = (el: NonTextNode): el is Block => el.type === "block";

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
  convertBlock: (block: Block) => FieldBlockWithFullItem
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  return nodes.map((node: Node) => {
    if (isText(node)) {
      const marks: Mark[] = [];

      Object.keys(node).forEach((key) => {
        if (defaultMarks.includes(key as DefaultMark)) {
          marks.push(key);
        }

        if (key.startsWith("customMark_")) {
          marks.push(key.replace(/^customMark_/, ""));
        }
      });

      const value = node.text.replace(/\uFEFF/g, "");

      const fieldSpan: FieldSpan = {
        type: "span",
        // Code block creates \uFEFF char to prevent a bug!
        value,
        marks: marks.length > 0 ? marks : undefined,
      };

      return fieldSpan;
    }

    if (
      !(
        [
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
          "thematicBreak",
        ] as NonTextNode["type"][]
      ).includes(node.type)
    ) {
      throw new Error(`Don't know how to serialize block of type ${node.type}`);
    }

    if (isBlock(node)) {
      return convertBlock(node);
    }

    if (isCode(node)) {
      const codeBlock: FieldCode = {
        type: "code",
        code: node.children[0].text,
        highlight: node.highlight,
        language: node.language,
      };

      return codeBlock;
    }

    if (isBlockquote(node)) {
      const childrenWithoutSource = node.children.filter(
        (n) => !isBlockquoteSource(n)
      );
      const sourceNode = node.children.find((n) =>
        isBlockquoteSource(n)
      ) as BlockquoteSource;

      const blockquoteNode: FieldBlockquote = {
        type: "blockquote",
        children: innerSerialize(
          childrenWithoutSource,
          convertBlock
        ) as FieldParagraph[],
      };

      if (sourceNode) {
        blockquoteNode.attribution = sourceNode.children[0].text;
      }

      return blockquoteNode;
    }

    if (isInlineItem(node)) {
      const inlineItemNode: FieldInlineItem = {
        type: "inlineItem",
        item: node.item,
      };

      return inlineItemNode;
    }

    if (isItemLink(node)) {
      const itemLinkNode: FieldItemLink = {
        type: "itemLink",
        item: node.item,
        meta: node.meta,
        children: innerSerialize(node.children, convertBlock) as FieldSpan[],
      };

      return itemLinkNode;
    }

    if (isThematicBreak(node)) {
      return { type: "thematicBreak" };
    }

    if (node.type === "blockquoteSource") {
      return node;
    }

    const serializedNode = allowedAttributes[node.type].reduce(
      (acc, curr) => {
        (acc as Record<string, unknown>)[curr] = (
          node as Record<string, unknown>
        )[curr];
        return acc;
      },
      { type: node.type } as Paragraph | Heading | Link | List | ListItem
    );

    /*const serializedNode = {
            type: node.type,
            ...pick(node, allowedAttributes[node.type]),
        };*/

    if (allowedAttributes[node.type].includes("children")) {
      serializedNode.children = innerSerialize(node.children, convertBlock);
    }

    if (isLink(node) && node.meta && node.meta.length > 0) {
      (serializedNode as Link).meta = node.meta;
    }

    return serializedNode;
  });
}

export function slateToDast(
  nodes: Node[] | null
): StructuredTextGraphQlResponse | null {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  const blocks: DocumentRecord[] = [];

  const children = innerSerialize(nodes, (node: Block) => {
    const { id } = node;

    if (node.blockModelId === "ImageRecord" && (node as SlateImageBlock)?.src) {
      blocks.push({
        __typename: "ImageRecord",
        id: node.id,
        content: {
          blurUpThumb: (node as SlateImageBlock).blurUpThumb,
          imageId: (node as SlateImageBlock).imageId,
          responsiveImage: {
            alt: (node as SlateImageBlock).alt,
            height: (node as SlateImageBlock).height,
            width: (node as SlateImageBlock).width,
            src: (node as SlateImageBlock).src,
          },
        },
      } as DastImageRecord);
    }

    const fieldBlock: FieldBlockWithFullItem = {
      type: "block",
      item: id ?? "",
    };

    return fieldBlock;
  });

  return {
    blocks,
    value: {
      schema: "dast",
      document: { type: "root", children },
    },
  };
}
