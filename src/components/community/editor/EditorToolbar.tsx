import { useSlate } from "slate-react";
import { useRef } from "react";

import {
  isMarkActive,
  isBlockActive,
  toggleBlock,
  toggleMark,
  insertImage,
  insertLink,
  isLinkActive,
  type Mark,
  type FormatType,
  type ListStyle,
  type HeadingLevel,
  getActiveHeading,
} from "@/lib/utils/editor/textEditorUtils";
import SvgIcon from "@/components/ui/FontAwesomeIcon";

const FaBold = () => (
  <SvgIcon
    prefix="fa"
    iconName="bold"
    icon={[
      384,
      512,
      [],
      "",
      "M333.49 238a122 122 0 0 0 27-65.21C367.87 96.49 308 32 233.42 32H34a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h31.87v288H34a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h209.32c70.8 0 134.14-51.75 141-122.4 4.74-48.45-16.39-92.06-50.83-119.6zM145.66 112h87.76a48 48 0 0 1 0 96h-87.76zm87.76 288h-87.76V288h87.76a56 56 0 0 1 0 112z",
    ]}
  />
);
const FaFileImage = () => (
  <SvgIcon
    prefix="fa"
    iconName="fileimage"
    icon={[
      384,
      512,
      [],
      "",
      "M384 121.941V128H256V0h6.059a24 24 0 0 1 16.97 7.029l97.941 97.941a24.002 24.002 0 0 1 7.03 16.971zM248 160c-13.2 0-24-10.8-24-24V0H24C10.745 0 0 10.745 0 24v464c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24V160H248zm-135.455 16c26.51 0 48 21.49 48 48s-21.49 48-48 48-48-21.49-48-48 21.491-48 48-48zm208 240h-256l.485-48.485L104.545 328c4.686-4.686 11.799-4.201 16.485.485L160.545 368 264.06 264.485c4.686-4.686 12.284-4.686 16.971 0L320.545 304v112z",
    ]}
  />
);
const FaHighlighter = () => (
  <SvgIcon
    prefix="fa"
    iconName="highlighter"
    icon={[
      544,
      512,
      [],
      "",
      "M0 479.98L99.92 512l35.45-35.45-67.04-67.04L0 479.98zm124.61-240.01a36.592 36.592 0 0 0-10.79 38.1l13.05 42.83-50.93 50.94 96.23 96.23 50.86-50.86 42.74 13.08c13.73 4.2 28.65-.01 38.15-10.78l35.55-41.64-173.34-173.34-41.52 35.44zm403.31-160.7l-63.2-63.2c-20.49-20.49-53.38-21.52-75.12-2.35L190.55 183.68l169.77 169.78L530.27 154.4c19.18-21.74 18.15-54.63-2.35-75.13z",
    ]}
  />
);
const FaItalic = () => (
  <SvgIcon
    prefix="fa"
    iconName="italic"
    icon={[
      320,
      512,
      [],
      "",
      "M320 48v32a16 16 0 0 1-16 16h-62.76l-80 320H208a16 16 0 0 1 16 16v32a16 16 0 0 1-16 16H16a16 16 0 0 1-16-16v-32a16 16 0 0 1 16-16h62.76l80-320H112a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h192a16 16 0 0 1 16 16z",
    ]}
  />
);
const FaLink = () => (
  <SvgIcon
    prefix="fa"
    iconName="link"
    icon={[
      512,
      512,
      [],
      "",
      "M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z",
    ]}
  />
);
const FaListOl = () => (
  <SvgIcon
    prefix="fa"
    iconName="listol"
    icon={[
      512,
      512,
      [],
      "",
      "M61.77 401l17.5-20.15a19.92 19.92 0 0 0 5.07-14.19v-3.31C84.34 356 80.5 352 73 352H16a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h22.83a157.41 157.41 0 0 0-11 12.31l-5.61 7c-4 5.07-5.25 10.13-2.8 14.88l1.05 1.93c3 5.76 6.29 7.88 12.25 7.88h4.73c10.33 0 15.94 2.44 15.94 9.09 0 4.72-4.2 8.22-14.36 8.22a41.54 41.54 0 0 1-15.47-3.12c-6.49-3.88-11.74-3.5-15.6 3.12l-5.59 9.31c-3.72 6.13-3.19 11.72 2.63 15.94 7.71 4.69 20.38 9.44 37 9.44 34.16 0 48.5-22.75 48.5-44.12-.03-14.38-9.12-29.76-28.73-34.88zM496 224H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zM16 160h64a8 8 0 0 0 8-8v-16a8 8 0 0 0-8-8H64V40a8 8 0 0 0-8-8H32a8 8 0 0 0-7.14 4.42l-8 16A8 8 0 0 0 24 64h8v64H16a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8zm-3.91 160H80a8 8 0 0 0 8-8v-16a8 8 0 0 0-8-8H41.32c3.29-10.29 48.34-18.68 48.34-56.44 0-29.06-25-39.56-44.47-39.56-21.36 0-33.8 10-40.46 18.75-4.37 5.59-3 10.84 2.8 15.37l8.58 6.88c5.61 4.56 11 2.47 16.12-2.44a13.44 13.44 0 0 1 9.46-3.84c3.33 0 9.28 1.56 9.28 8.75C51 248.19 0 257.31 0 304.59v4C0 316 5.08 320 12.09 320z",
    ]}
  />
);
const FaListUl = () => (
  <SvgIcon
    prefix="fa"
    iconName="listul"
    icon={[
      512,
      512,
      [],
      "",
      "M48 48a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 16H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z",
    ]}
  />
);
const FaQuoteRight = () => (
  <SvgIcon
    prefix="fa"
    iconName="quoteright"
    icon={[
      512,
      512,
      [],
      "",
      "M464 32H336c-26.5 0-48 21.5-48 48v128c0 26.5 21.5 48 48 48h80v64c0 35.3-28.7 64-64 64h-8c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h8c88.4 0 160-71.6 160-160V80c0-26.5-21.5-48-48-48zm-288 0H48C21.5 32 0 53.5 0 80v128c0 26.5 21.5 48 48 48h80v64c0 35.3-28.7 64-64 64h-8c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24h8c88.4 0 160-71.6 160-160V80c0-26.5-21.5-48-48-48z",
    ]}
  />
);
const FaStrikethrough = () => (
  <SvgIcon
    prefix="fa"
    iconName="strikethrough"
    icon={[
      512,
      512,
      [],
      "",
      "M496 224H293.9l-87.17-26.83A43.55 43.55 0 0 1 219.55 112h66.79A49.89 49.89 0 0 1 331 139.58a16 16 0 0 0 21.46 7.15l42.94-21.47a16 16 0 0 0 7.16-21.46l-.53-1A128 128 0 0 0 287.51 32h-68a123.68 123.68 0 0 0-123 135.64c2 20.89 10.1 39.83 21.78 56.36H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h480a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm-180.24 96A43 43 0 0 1 336 356.45 43.59 43.59 0 0 1 292.45 400h-66.79A49.89 49.89 0 0 1 181 372.42a16 16 0 0 0-21.46-7.15l-42.94 21.47a16 16 0 0 0-7.16 21.46l.53 1A128 128 0 0 0 224.49 480h68a123.68 123.68 0 0 0 123-135.64 114.25 114.25 0 0 0-5.34-24.36z",
    ]}
  />
);
const FaUnderline = () => (
  <SvgIcon
    prefix="fa"
    iconName="underline"
    icon={[
      448,
      512,
      [],
      "",
      "M32 64h32v160c0 88.22 71.78 160 160 160s160-71.78 160-160V64h32a16 16 0 0 0 16-16V16a16 16 0 0 0-16-16H272a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h32v160a80 80 0 0 1-160 0V64h32a16 16 0 0 0 16-16V16a16 16 0 0 0-16-16H32a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16zm400 384H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z",
    ]}
  />
);

const MarkButton: React.FC<React.PropsWithChildren<{ mark: Mark }>> = ({
  mark,
  children,
}) => {
  const editor = useSlate();
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => toggleMark(editor, mark)}
      type="button"
      data-headlessui-state={isMarkActive(editor, mark) ? "active" : ""}
      className="rounded-sm p-1 text-neutral-500 hover:bg-gray-400 hover:bg-opacity-20 hover:text-neutral-600 ui-active:text-black"
    >
      {children}
    </button>
  );
};

const BlockButton: React.FC<
  React.PropsWithChildren<{ type: FormatType; list?: ListStyle }>
> = ({ list, type, children }) => {
  const editor = useSlate();
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => toggleBlock(editor, type, { list })}
      className="rounded-sm p-1 text-neutral-500 hover:bg-gray-400 hover:bg-opacity-20 hover:text-neutral-600 ui-active:text-black"
      type="button"
      data-headlessui-state={
        isBlockActive(editor, type, { list }) ? "active" : ""
      }
    >
      {children}
    </button>
  );
};

const LinkButton: React.FC = () => {
  const editor = useSlate();
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => insertLink(editor, "")}
      className="rounded-sm p-1 text-neutral-500 hover:bg-gray-400 hover:bg-opacity-20 hover:text-neutral-600 ui-active:text-black"
      type="button"
      data-headlessui-state={isLinkActive(editor) ? "active" : ""}
    >
      <FaLink />
    </button>
  );
};

const ImageButton: React.FC = () => {
  const input = useRef<HTMLInputElement>(null);
  const editor = useSlate();
  return (
    <>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.item(0);
          if (!file) return;

          const reader = new FileReader();
          reader.addEventListener(
            "load",
            () => {
              const url = reader.result;
              if (!url) return;
              const image = new Image();
              image.addEventListener(
                "load",
                () => insertImage(editor, image, file),
                false
              );
              image.src = url as string;
            },
            false
          );
          reader.readAsDataURL(file);
        }}
        ref={input}
        accept="image/*"
        name="image"
        className="hidden"
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (!input.current) return;
          input.current.click();
        }}
        className="rounded-sm p-1 text-neutral-500 hover:bg-gray-400 hover:bg-opacity-20 hover:text-neutral-600 ui-active:text-black"
      >
        <FaFileImage />
      </button>
    </>
  );
};

const TextStyleButton: React.FC = () => {
  const editor = useSlate();

  return (
    <select
      value={getActiveHeading(editor)}
      onChange={(e) => {
        if (e.target.value === "normal")
          return toggleBlock(editor, "paragraph");
        toggleBlock(editor, "heading", {
          level: (parseInt(e.target.value) ?? 1) as HeadingLevel,
        });
      }}
      title="Text Styles"
      className="border-none pr-8 text-sm"
    >
      <option value="normal">Normal Text</option>
      <option value="1" className="text-3xl">
        Heading 1
      </option>
      <option value="2" className="text-2xl">
        Heading 2
      </option>
      <option value="3" className="text-xl">
        Heading 3
      </option>
      <option value="4" className="text-lg">
        Heading 4
      </option>
      <option value="5" className="text-sm">
        Heading 5
      </option>
      <option value="6" className="text-sm">
        Heading 6
      </option>
    </select>
  );
};

const EditorToolbar: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-1 rounded-sm border border-neutral-400 p-1">
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
};

export default EditorToolbar;
