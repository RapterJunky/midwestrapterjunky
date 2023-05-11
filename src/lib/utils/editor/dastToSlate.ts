import type {
  NonTextNode,
  Paragraph,
  Link,
  ItemLink,
  InlineItem,
  Text,
  Heading,
  List,
  Code,
  Blockquote,
  Block,
  ThematicBreak,
  ListItem,
  BlockquoteSource,
} from "datocms-structured-text-slate-utils";
import type {
  Node as DastNode,
  Record,
} from "datocms-structured-text-utils";
import type { StructuredTextGraphQlResponse } from "react-datocms";

export interface DastImageRecord extends Record {
  __typename: "ImageRecord";
  content: {
    imageId: string;
    blurUpThumb: string;
    responsiveImage: {
      alt: string;
      src: string;
      width: number;
      height: number;
    };
  };
}

export interface SlateImageBlock extends Block {
  blockModelId: "ImageRecord";
  src: string;
  width: number;
  height: number;
  alt?: string;
  imageId?: string;
  blurUpThumb: string;
}

const parseNode = (
  node: DastNode,
  blocks?: Record[],
  inline?: Record[]
): NonTextNode | Link | ItemLink | InlineItem | Text | ListItem => {
  switch (node.type) {
    case "paragraph": {
      const children: (Link | ItemLink | InlineItem | Text)[] = [];
      for (const child of node.children) {
        children.push(
          parseNode(child, blocks, inline) as
          | Link
          | ItemLink
          | InlineItem
          | Text
        );
      }
      const el: Paragraph = {
        type: "paragraph",
        style: node?.style,
        children,
      };
      return el;
    }
    case "heading": {
      const children: (Link | ItemLink | InlineItem | Text)[] = [];
      for (const child of node.children) {
        children.push(
          parseNode(child, blocks, inline) as
          | Link
          | ItemLink
          | InlineItem
          | Text
        );
      }

      const el: Heading = {
        type: "heading",
        level: node.level,
        style: node?.style,
        children,
      };
      return el;
    }
    case "list": {
      const children: ListItem[] = [];

      for (const child of node.children) {
        children.push(parseNode(child, blocks, inline) as ListItem);
      }

      const el: List = {
        type: "list",
        style: node.style,
        children,
      };
      return el;
    }
    case "code": {
      const el: Code = {
        type: "code",
        highlight: node?.highlight,
        language: node?.language,
        children: [{ text: node.code }],
      };
      return el;
    }
    case "blockquote":
      const children: (Paragraph | BlockquoteSource)[] = [];
      for (const child of node.children) {
        children.push(
          parseNode(child, blocks, inline) as Paragraph | BlockquoteSource
        );
      }
      const el: Blockquote = {
        attribution: node?.attribution,
        type: "blockquote",
        children,
      };
      return el;
    case "block": {
      if (!blocks) throw new Error("Failed to paser block.");
      const block = blocks.find((value) => value.id === node.item);
      if (!block) throw new Error("Failed to find block for item");

      const el: Block = {
        type: "block",
        blockModelId: block.__typename,
        id: node.item,
        children: [{ text: "" }],
      };

      if (block.__typename === "ImageRecord") {
        (el as SlateImageBlock).src = (
          block as DastImageRecord
        ).content.responsiveImage.src;
        (el as SlateImageBlock).width = (
          block as DastImageRecord
        ).content.responsiveImage.width;
        (el as SlateImageBlock).height = (
          block as DastImageRecord
        ).content.responsiveImage.height;
        (el as SlateImageBlock).alt = (
          block as DastImageRecord
        ).content.responsiveImage.alt;
        (el as SlateImageBlock).blurUpThumb = (
          block as DastImageRecord
        ).content.blurUpThumb;
        (el as SlateImageBlock).imageId = (
          block as DastImageRecord
        ).content.imageId;
      }

      return el;
    }
    case "thematicBreak": {
      const el: ThematicBreak = {
        type: "thematicBreak",
        children: [{ text: "" }],
      };
      return el;
    }
    case "itemLink": {
      const children: Text[] = [];
      for (const child of node.children) {
        children.push(parseNode(child, blocks, inline) as Text);
      }
      const el: ItemLink = {
        type: "itemLink",
        item: node.item,
        meta: node?.meta,
        itemTypeId: "",
        children,
      };
      return el;
    }
    case "inlineItem": {
      const el: InlineItem = {
        type: "inlineItem",
        item: node.item,
        itemTypeId: "",
        children: [{ text: "" }],
      };
      return el;
    }
    case "span": {
      const el: Text = { text: node.value };

      if (node?.marks)
        for (const mark of node.marks) {
          el[mark as keyof Omit<Text, "text" | "emoji" | "codeToken">] = true;
        }

      return el;
    }
    case "link": {
      const children: Text[] = [];
      for (const child of node.children) {
        children.push(parseNode(child, blocks, inline) as Text);
      }
      const el: Link = {
        type: "link",
        url: node.url,
        meta: node.meta,
        children,
      };

      return el;
    }
    case "listItem": {
      const children: (Paragraph | List)[] = [];
      for (const child of node.children) {
        children.push(parseNode(child, blocks, inline) as Paragraph | List);
      }
      const el: ListItem = {
        type: "listItem",
        children,
      };

      return el;
    }
    default:
      return { text: "" };
  }
};

const dastToSlate = (
  dast: StructuredTextGraphQlResponse
): (NonTextNode | Text)[] => {
  const nodes: (NonTextNode | Text)[] = [];

  for (const node of dast.value.document.children) {
    nodes.push(parseNode(node, dast.blocks, dast.links));
  }

  return nodes;
};

export default dastToSlate;
