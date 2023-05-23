import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import type { NonTextNode } from "datocms-structured-text-slate-utils";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import { Dialog, Transition } from "@headlessui/react";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Descendant } from "slate";
import dynamic from "next/dynamic";
import { WithContext as ReactTags } from 'react-tag-input';

import Footer from "@components/layout/Footer";
import Navbar from "@components/layout/Navbar";
import SiteTags from "@components/SiteTags";
//import TagInput from "@components/inputs/TagInput";
import Spinner from "@components/ui/Spinner";

import extractSlateImages from "@lib/utils/editor/extractSlateImages";
import { isEditorEmpty } from "@lib/utils/editor/editorActions";
import genericSeoTags from "@lib/utils/genericSeoTags";
import GenericPageQuery from "@query/queries/generic";
import type { FullPageProps } from "@type/page";
import { fetchCachedQuery } from "@lib/cache";
import useReplace from "@hook/useReplace";
import { singleFetch } from "@api/fetch";
import prisma from "@api/prisma";

type DialogData = {
  open: boolean;
  mode: "loading" | "message";
  title?: string;
  message?: string;
};

type FormState = {
  title: string;
  tags: PrismaJson.Tags;
  categoryId: string;
  message: Descendant[];
  notification: boolean;
  deletedImages: string[];
};

interface Props extends FullPageProps {
  seo: SeoOrFaviconTag[];
  categories: {
    id: number;
    tags: PrismaJson.Tags | null;
    name: string;
  }[];
}

export const getStaticProps = async ({
  draftMode,
  preview,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {
  const props = await fetchCachedQuery<FullPageProps>(
    "GenericPage",
    GenericPageQuery
  );

  const categories = await prisma.thread.findMany({
    select: {
      id: true,
      name: true,
      tags: true,
    },
  });

  return {
    props: {
      ...props,
      categories,
      preview: (draftMode || preview) ?? false,
      seo: genericSeoTags({
        title: "Topic",
        description: "Create or edit an topic",
        url: "https://midwestraptorjunkies.com/community/create-topic",
      }),
    },
  };
};

// Loading Slate and all that
const TextEditor = dynamic(
  () => import("@components/community/editor/TextEditor")
);

const CreateTopicDialog: React.FC<{
  data: DialogData;
  onClose: () => void;
}> = ({ data, onClose }) => {
  return (
    <Transition appear show={data.open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => (data.mode === "message" ? onClose() : undefined)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-sm bg-white p-6 text-left align-middle shadow-xl transition-all">
                {data.mode === "loading" ? (
                  <div className="flex flex-col items-center">
                    <Spinner size="h-10 w-10" />
                    <span className="mt-4 text-xl">Processing...</span>
                  </div>
                ) : (
                  <>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-medium leading-6 text-gray-900"
                    >
                      {data.title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{data.message}</p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                        onClick={onClose}
                      >
                        Ok
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const CreateTopic: NextPage<Props> = ({ _site, navbar, categories, seo }) => {
  const session = useSession();
  const replace = useReplace();
  const [dialog, setDialog] = useState<DialogData>({
    open: false,
    mode: "message",
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading, isValid },
    setError,
    clearErrors,
    setValue,
  } = useForm<FormState>({
    defaultValues: async () => {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get("edit");

      if (editId) {
        return singleFetch<FormState>(`/api/community/create?id=${editId}`, {
          headers: { "X-Type-Create": "post" },
        });
      }

      return {
        tags: [] as PrismaJson.Tags,
        message: [{ type: "paragraph", children: [{ text: "" }] }],
      } as FormState;
    },
  });

  useEffect(() => {
    if (
      session.status === "unauthenticated" ||
      (session.status === "authenticated" && !!session.data?.user.banned)
    )
      replace("/community").catch((e) => console.error(e));
  }, [session.status, replace, session.data?.user.banned]);

  const onSubmit = async (state: FormState) => {
    if (await isEditorEmpty(":ct")) {
      setError("message", {
        type: "required",
        message: "Please enter a message",
      });
      return;
    }
    try {
      setDialog({
        open: true,
        mode: "loading",
      });

      const editId = new URLSearchParams(window.location.search).get("edit");

      const formData = new FormData();

      formData.append(
        "notification",
        state.notification ? "true" : "false"
      );
      formData.append("title", state.title);
      formData.append("thread", state.categoryId);
      if (editId) formData.append("editId", editId);
      if (state.deletedImages)
        state.deletedImages.forEach((item) =>
          formData.append("deletedImages[]", item)
        );

      state.tags.forEach((tag) => formData.append("tags[]", tag));

      const images = extractSlateImages(state.message as NonTextNode[]);

      if (images.length > 5) {
        throw new Error(
          "There can be no more then 5 images uploaded at a time.",
          { cause: "MAX_IMAGES" }
        );
      }

      formData.append("message", JSON.stringify(state.message));

      for (const image of images) {
        formData.append(
          `imageData[]`,
          JSON.stringify({
            id: image.id,
            width: image.width,
            height: image.height,
          })
        );
      }

      for (const image of images) {
        formData.append(
          `image[${image.id}]`,
          image.file,
          `${image.id}.${image.file.type.split("/")[1]}`
        );
      }

      const response = await fetch("/api/community/create", {
        method: editId ? "PATCH" : "POST",
        body: formData,
        headers: {
          "X-Type-Create": "post",
        },
      });

      if (!response.ok) throw response;

      const data = (await response.json()) as { postId: string };

      await replace({
        pathname: "/community/p/[slug]",
        query: {
          slug: data.postId,
        },
      });
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Response
          ? `STATUS_CODE: ${error.statusText}`
          : error instanceof Error
            ? error.cause === "MAX_IMAGES"
              ? error.message
              : ""
            : "";

      setDialog({
        open: true,
        mode: "message",
        title: "Error",
        message: `There was an error creating your post. ${message}`,
      });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <Navbar {...navbar} mode="none" />
      <CreateTopicDialog
        data={dialog}
        onClose={() => setDialog((current) => ({ ...current, open: false }))}
      />
      <main className="flex flex-1 justify-center">
        {isLoading ? (
          <div>
            <Spinner />
            Loading...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="container mb-4 max-w-3xl"
          >
            <h1 className="mb-4 text-2xl font-bold">Create a new topic</h1>
            <div className="mb-4 flex flex-col">
              <label htmlFor="title" className="mb-1 text-neutral-600">
                Title
              </label>
              <input
                placeholder="Enter a title..."
                id="title"
                type="text"
                {...register("title", {
                  minLength: {
                    message: "The title must 3 characters in length.",
                    value: 3,
                  },
                  maxLength: {
                    value: 40,
                    message:
                      "The title must be less then 40 characters in length.",
                  },
                  required: "A Title is required",
                })}
              />
              {errors.title ? (
                <span className="text-red-500">{errors.title.message}</span>
              ) : null}
            </div>
            <div className="mb-4 flex flex-col">
              <label htmlFor="category" className="mb-1 text-neutral-600">
                Category
              </label>
              <select
                id="category"
                {...register("categoryId", {
                  required: "A Category is required",
                })}
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId ? (
                <span className="text-red-500">
                  {errors.categoryId.message}
                </span>
              ) : null}
            </div>
            <div className="mb-4 flex flex-col">
              <label className="mb-1 text-neutral-600">Tags</label>
              <Controller
                rules={{
                  max: {
                    message: "6 is the max amount of tags",
                    value: 6,
                  },
                }}
                control={control}
                name="tags"
                render={({ field, fieldState }) => (
                  <div>
                    <ReactTags
                      inline
                      classNames={{
                        selected: "flex flex-wrap gap-1",
                        tags: "flex",
                        tagInputField: "h-full",
                        tag: "font-bold py-2 px-2.5 flex gap-2 border border-neutral-500 items-center justify-center",
                        remove: "text-red-500 text-lg font-bold flex items-center text-center justify-center"
                      }}
                      allowUnique
                      autofocus
                      maxLength={12}
                      inputFieldPosition="inline"
                      handleInputBlur={field.onBlur}
                      tags={field.value.map((tag, i) => ({ id: i.toString(), text: tag }))}
                      handleDelete={(idx) => {
                        const tags = field.value.map((tag, i) => ({ id: i.toString(), text: tag })).map(value => value.text).filter((_tag, i) => i !== idx);
                        field.onChange(tags)
                      }}
                      handleAddition={(tag: { id: string; text: string; }) => {
                        field.onChange([...field.value, tag.text]);
                      }}
                      handleDrag={(tag: { id: string; text: string; }, curr: number, next: number) => {
                        const tags = field.value.map((tag, i) => ({ id: i.toString(), text: tag }));

                        tags.splice(curr, 1);
                        tags.splice(next, 0, tag);
                        field.onChange(tags.map(value => value.text));
                      }}
                    />
                    {fieldState.error ? (
                      <span className="text-red-500">{fieldState.error.message}</span>
                    ) : null}
                  </div>
                )}
              />
              <span className="text-neutral-500">
                Tags are short 1-2 word descriptions that describe this post. Tags must be 3-12 characters with a maxium of 6 tags.
              </span>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <input
                {...register("notification")}
                id="notification"
                type="checkbox"
                defaultChecked
              />
              <label htmlFor="notification">Send me email notifications</label>
            </div>
            <div className="mb-4 flex flex-col gap-1">
              <label className="text-neutral-600">Post Content</label>
              <Controller
                control={control}
                name="message"
                render={({ field }) => (
                  <TextEditor
                    id=":ct"
                    value={field.value}
                    onChange={(values) => {
                      field.onChange(values.ast);
                      setValue("deletedImages", values.deletedImages);
                    }}
                  />
                )}
              />
              {errors.message ? (
                <span className="text-red-500">{errors.message.message}</span>
              ) : null}
            </div>

            <div className="flex justify-end">
              <button disabled={isSubmitting || !isValid} className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70" type="submit">
                Submit
              </button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CreateTopic;
/*
tags={field.value.map((item, i) => ({ id: i, tag: item }))}
                      handleAddition={(item: { id: number; tag: string; }) => field.onChange([...field.value, item.tag])}
                      handleDelete={(idx: number) => {
                        const tags = field.value.map((item, i) => ({ id: i, tag: item }))
                        field.onChange(tags.filter(item => item.id !== idx).map(value => value.tag));
                      }}
                      handleDrag={(tag: { id: number; tag: string; }, currPos: number, newPos: number) => {
                        const tags = field.value.map((item, i) => ({ id: i, tag: item })).slice();
                        tags.splice(currPos, 1);
                        tags.splice(newPos, 0, tag);
                        field.onChange(tags.map(value => value.tag));
                      }} />
 */