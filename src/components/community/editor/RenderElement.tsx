import {
  ReactEditor,
  type RenderElementProps,
  useFocused,
  useSelected,
  useSlateStatic,
} from "slate-react";
import type { Block } from "datocms-structured-text-slate-utils";
import { DefaultElement } from "slate-react";
import { Transforms } from "slate";
import Image from "next/image";

import HiTrash from "@components/icons/HiTrash";
import HiLink from "@components/icons/HiLink";

type SlateBlockImage = Block & {
  imageId?: string;
  src: string;
  width: number;
  height: number;
};

const SlateImage: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, element);

  const selected = useSelected();
  const focused = useFocused();

  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        className="not-prose relative flex justify-center"
      >
        <Image
          data-headlessui-state={selected && focused ? "selected" : ""}
          className="block max-w-full rounded-sm object-center shadow ui-selected:shadow-blue-500"
          src={(element as SlateBlockImage).src}
          alt="Inserted Image"
          width={(element as SlateBlockImage).width}
          height={(element as SlateBlockImage).height}
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          data-headlessui-state={selected && focused ? "selected" : ""}
          onClick={() => {
            const imageId = (element as SlateBlockImage)?.imageId;
            if (imageId) editor.deletedImages.push(imageId);
            Transforms.removeNodes(editor, { at: path });
          }}
          className="focus absolute  left-2 top-2 hidden rounded-sm bg-red-400 p-1 text-white shadow-lg ui-selected:inline"
        >
          <HiTrash className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

const RenderElement: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  switch (element.type) {
    case "blockquoteSource":
      return <footer {...attributes}>{children}</footer>;
    case "blockquote":
      return (
        <blockquote {...attributes}>
          <p>{children}</p>
        </blockquote>
      );
    case "heading": {
      switch (element.level) {
        case 1:
          return <h1 {...attributes}>{children}</h1>;
        case 2:
          return <h2 {...attributes}>{children}</h2>;
        case 3:
          return <h3 {...attributes}>{children}</h3>;
        case 4:
          return <h4 {...attributes}>{children}</h4>;
        case 5:
          return <h5 {...attributes}>{children}</h5>;
        default:
          return <h6 {...attributes}>{children}</h6>;
      }
    }
    case "list": {
      if (element.style === "bulleted") {
        return <ul {...attributes}>{children}</ul>;
      }
      return <ol {...attributes}>{children}</ol>;
    }
    case "thematicBreak":
      return <hr {...attributes} />;
    case "listItem":
      return <li {...attributes}>{children}</li>;
    case "paragraph":
      return <p {...attributes}>{children}</p>;
    case "block": {
      if (element.blockModelId === "ImageRecord") {
        return (
          <SlateImage attributes={attributes} element={element}>
            {children}
          </SlateImage>
        );
      }
      return null;
    }
    case "link":
      return (
        <span className="inline-flex items-center gap-1" {...attributes}>
          <HiLink />
          <a href={element.url} className="underline">
            {children}
          </a>
        </span>
      );
    case "inlineItem":
    case "itemLink":
    default:
      return (
        <DefaultElement attributes={attributes} element={element}>
          {children}
        </DefaultElement>
      );
  }
};

export default RenderElement;
