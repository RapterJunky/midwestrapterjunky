import type {
  GetStaticPropsResult,
  GetStaticPropsContext,
  NextPage,
  GetStaticPathsResult,
} from "next";
import {
  createEditor,
  Text,
  Node,
  type Descendant,
  Editor,
  Transforms,
  Range,
} from "slate";
import { useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { Slate, Editable, withReact, useSlate, useFocused } from "slate-react";
import { StructuredText } from "react-datocms/structured-text";
import { useForm, Controller } from "react-hook-form";
import { Portal, Tab } from "@headlessui/react";

import SiteTags from "@components/SiteTags";
import Navbar from "@components/layout/Navbar";
import ExitPreview from "@components/ExitPreview";
import Footer from "@components/layout/Footer";
import type { FullPageProps } from "types/page";
import GenericPageQuery from "@query/queries/generic";
import { fetchCachedQuery } from "@lib/cache";
import { z } from "zod";
import { FaBold, FaItalic, FaUnderline } from "react-icons/fa";
import type { DefaultMark } from "datocms-structured-text-utils";

const slateToDastI = import("datocms-structured-text-slate-utils");

//https://www.slatejs.org/examples/richtext
//https://github.com/ianstormtaylor/slate/blob/main/site/examples/richtext.tsx#L111
//https://docs.slatejs.org/concepts/08-plugins

interface FormState {
  title: string;
  document: Descendant[];
}
interface Props extends FullPageProps {}

export const getStaticPaths = (): GetStaticPathsResult => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
  const result = z.coerce
    .number()
    .positive()
    .min(1)
    .safeParse(ctx.params?.thread);

  if (!result.success) return { notFound: true };

  const exists = await prisma.thread.exists({ where: { id: result.data } });
  if (!exists) return { notFound: true };

  const props = await fetchCachedQuery<Props>("GenericPage", GenericPageQuery);

  return {
    props: {
      ...props,
      preview: ctx?.preview ?? false,
    },
  };
};

const toggleFormat = (editor: Editor, format: DefaultMark) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive },
    { match: Text.isText, split: true }
  );
};

const isFormatActive = (editor: Editor, format: DefaultMark): boolean => {
  const [match] = Editor.nodes(editor, {
    match: (n) => (n as never as Record<string, boolean>)[format] === true,
    mode: "all",
  });
  return !!match;
};

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.strong) {
    children = <strong>{children}</strong>;
  }
  if (leaf.emphasis) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const Element = ({ attributes, children, element }: any) => {
  switch (element.type) {
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();
  const inFocus = useFocused();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) return;

    if (
      !selection ||
      !inFocus ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      el.removeAttribute("style");
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection) return;
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = "1";
    el.style.top = `${rect.top + window.scrollY - el.offsetHeight}px`;
    el.style.left = `${
      rect.left + window.scrollX - el.offsetWidth / 2 + rect.width / 2
    }px`;
  });

  return (
    <Portal>
      <div
        ref={ref}
        className="absolute z-10 -mt-2 divide-x-2 divide-neutral-400 bg-gray-800 p-2 text-neutral-400 opacity-0 transition-opacity duration-75"
        onMouseDown={(ev) => ev.preventDefault()}
      >
        <button
          className={`p-1 ${
            isFormatActive(editor, "strong") ? "text-white" : ""
          }`}
          onClick={() => toggleFormat(editor, "strong")}
        >
          <FaBold />
        </button>
        <button
          className={`p-1 ${
            isFormatActive(editor, "emphasis") ? "text-white" : ""
          }`}
          onClick={() => toggleFormat(editor, "emphasis")}
        >
          <FaItalic />
        </button>
        <button
          className={`p-1 ${
            isFormatActive(editor, "underline") ? "text-white" : ""
          }`}
          onClick={() => toggleFormat(editor, "underline")}
        >
          <FaUnderline />
        </button>
      </div>
    </Portal>
  );
};

const NewThreadPost: NextPage<Props> = ({ _site, navbar, preview }) => {
  const router = useRouter();
  const { handleSubmit, register, control, watch } = useForm<FormState>({
    defaultValues: {
      document: [
        {
          type: "paragraph",
          children: [{ text: "A line of text in a paragraph." }],
        },
      ],
      title: "",
    },
  });
  const editor = useMemo(() => withReact(createEditor()), []);
  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  const previewDocuemnt = watch("document");

  const onSubmit = async (state: FormState) => {
    try {
      const { slateToDast } = await slateToDastI;
      const request = await fetch("/api/threads/post", {
        method: "POST",
        body: JSON.stringify({
          name: state.title,
          threadId: parseInt(router.query.thread as string),
          content: await slateToDast(state.document, {}),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!request.ok) throw request;

      router.replace(`/threads/${router.query.thread}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          [{ tag: "title", content: `Create Post - Midwest Raptor Junkies` }],
        ]}
      />
      <header>
        <Navbar {...navbar} mode="none" />
      </header>
      <main className="flex flex-grow flex-col items-center">
        <h1 className="mt-4 text-3xl font-bold">Create a post</h1>
        <Tab.Group
          as="div"
          className="flex w-full max-w-6xl flex-col justify-center px-2"
        >
          <Tab.List className="flex w-full">
            <Tab className="inline-block w-full border-b border-gray-300 px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-gray-600 transition duration-150 ease-in-out ui-selected:border-b-blue-600 ui-selected:text-blue-600">
              Write
            </Tab>
            <Tab className="inline-block w-full border-b border-gray-300 px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-gray-600 transition duration-150 ease-in-out ui-selected:border-b-blue-600 ui-selected:text-blue-600">
              Preview
            </Tab>
          </Tab.List>
          <Tab.Panels className="w-full">
            <Tab.Panel className="flex justify-center">
              <form
                className="mt-4 flex w-full max-w-5xl flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <label className="block">
                  <span className="text-gray-700">Title</span>
                  <input
                    {...register("title", { required: "Title is required." })}
                    required
                    type="text"
                    placeholder="Enter a title"
                    name="title"
                    className="mt-0 block w-full border-0 border-b-2 border-gray-300 px-0.5 focus:border-black focus:ring-0"
                  />
                </label>
                <label>
                  <span className="text-gray-700">Post Content</span>
                  <Controller
                    control={control}
                    name="document"
                    render={({ field: { onChange, value } }) => (
                      <Slate editor={editor} value={value} onChange={onChange}>
                        <HoveringToolbar />
                        <Editable
                          onDOMBeforeInput={(ev: InputEvent) => {
                            ev.preventDefault();
                            switch (ev.inputType) {
                              case "strong":
                                return toggleFormat(editor, "strong");
                              case "emphasis":
                                return toggleFormat(editor, "emphasis");
                              case "underline":
                                return toggleFormat(editor, "underline");
                            }
                          }}
                          className="prose mt-2 min-h-[320px] max-w-none bg-neutral-200 p-2 shadow-md"
                          renderLeaf={renderLeaf}
                          renderElement={renderElement}
                          spellCheck
                          autoFocus
                          placeholder="Enter some rich text…"
                        />
                      </Slate>
                    )}
                  />
                </label>
                <button
                  type="submit"
                  className="inline-block rounded bg-primary-700 px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-selected:bg-primary-700 ui-selected:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                >
                  Post
                </button>
              </form>
            </Tab.Panel>
            <Tab.Panel>
              <div className="prose mt-2 min-h-[320px] max-w-none bg-neutral-200 p-2 shadow-md">
                <StructuredText
                  data={{
                    schema: "dast",
                    document: { type: "root", children: [] },
                  }}
                />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>
      <Footer />
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default NewThreadPost;
