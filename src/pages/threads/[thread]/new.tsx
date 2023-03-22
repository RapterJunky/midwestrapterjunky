import type {
  GetStaticPropsResult,
  GetStaticPropsContext,
  NextPage,
  GetStaticPathsResult,
} from "next";
import { createEditor, Text, Node, type Descendant } from "slate";
import { useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { Slate, Editable, withReact } from "slate-react";
import { StructuredText } from "react-datocms/structured-text";
import { useForm, Controller } from "react-hook-form";
import { Tab } from "@headlessui/react";

import SiteTags from "@components/SiteTags";
import Navbar from "@components/layout/Navbar";
import ExitPreview from "@components/ExitPreview";
import Footer from "@components/layout/Footer";
import type { FullPageProps } from "types/page";
import GenericPageQuery from "@query/queries/generic";
import { fetchCachedQuery } from "@lib/cache";
import { z } from "zod";

//https://www.slatejs.org/examples/richtext
//https://github.com/ianstormtaylor/slate/blob/main/site/examples/richtext.tsx#L111
//https://docs.slatejs.org/concepts/08-plugins

interface FormState {
  title: string;
  document: Descendant[];
}
interface Props extends FullPageProps { }

export const getStaticPaths = (): GetStaticPathsResult => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
  const result = z.coerce.number().positive().min(1).safeParse(ctx.params?.thread);

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

const Element = ({ attributes, children, element }: any) => {
  switch (element.type) {
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const serialize = (nodes: Descendant[]) => {
  const document: any[] = [];

  for (const node of nodes) {
    if (Text.isText(node)) {
      const marks = Object.keys(node)
        .map((value) => value)
        .filter((value) => value !== "text");
      const span = {
        type: "span",
        value: Node.string(node),
        marks: !marks.length ? undefined : marks,
      };
      document.push(span);
      continue;
    }

    switch (node.type) {
      case "paragraph": {
        const paragraph = {
          type: "paragraph",
          children: serialize(node.children),
        };
        document.push(paragraph);
        continue;
      }
    }
  }
  return document;
};

const toDast = (nodes: Descendant[]): PrismaJson.Dast => {
  return {
    value: {
      schema: "dast",
      document: {
        type: "root",
        children: serialize(nodes),
      },
    },
    blocks: [],
    links: [],
  };
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

  const previewDocuemnt = watch("document");

  const onSubmit = async (state: FormState) => {
    try {
      const request = await fetch("/api/threads/post", {
        method: "POST",
        body: JSON.stringify({
          name: state.title,
          threadId: parseInt(router.query.thread as string),
          content: toDast(state.document),
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
      <main className="flex flex-1 flex-col items-center bg-neutral-200">
        <h1 className="mt-4 text-3xl font-bold">Create a post</h1>
        <Tab.Group
          as="div"
          className="flex w-full max-w-6xl flex-col justify-center"
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
                    className="mt-0 block w-full border-0 border-b-2 border-gray-400 bg-neutral-200 px-0.5 focus:border-black focus:ring-0"
                  />
                </label>
                <label>
                  <span className="text-gray-700">Post Content</span>
                  <Controller
                    control={control}
                    name="document"
                    render={({ field: { onChange, value } }) => (
                      <Slate editor={editor} value={value} onChange={onChange}>
                        <Editable
                          className="prose mt-2 min-h-[320px] max-w-none bg-white p-2 shadow-md"
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
              <div className="prose mt-2 min-h-[320px] max-w-none bg-white p-2 shadow-md">
                <StructuredText data={toDast(previewDocuemnt)} />
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
