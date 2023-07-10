import type { NonTextNode } from "datocms-structured-text-slate-utils";
import { useContext, createContext, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { Descendant } from "slate";
import { useRouter } from "next/router";
import useSWR from "swr";

import extractSlateImages from "@lib/utils/editor/extractSlateImages";
import type { TComment } from "@components/thread/Comment";
import type { Paginate } from "@type/page";
import { singleFetch } from "@api/fetch";

type ItemType = "post" | "comment";
type DialogData = {
  reasonInput: boolean;
  title: string;
  message: string;
  open: boolean;
};
type PostLikes = { likesCount: number; likedByMe: boolean };
export type CreateCommentBody = {
  message: Descendant[];
  deletedImages?: string[];
  parentCommentId?: string;
};

type PostCtx = {
  report: (type: ItemType, id: string) => Promise<void>;
  like: (type: ItemType, id: string) => Promise<void>;
  unlike: (type: ItemType, id: string) => Promise<void>;
  delete: (type: ItemType, id: string) => Promise<void>;
  create: (
    data: CreateCommentBody,
    settings?: { mode: "update"; id: string },
  ) => Promise<boolean>;
  setPage: (page: number) => void;
  likesIsLoading: boolean;
  isLoading: boolean;
  postId: string;
  page: number;
  comments?: Paginate<TComment>;
  likes?: PostLikes;
  likesError?: Response;
  error?: Response;
};

const REPORT_EVENT_REASON = "mrj::report::reason";
const REPORT_EVENT_EXIT = "mrj::report:exit";
const PostContext = createContext<PostCtx | undefined>(undefined);

const ReportDialog: React.FC<{ data: DialogData; close: () => void }> = ({
  data,
  close,
}) => {
  const rejectOnClose = () => {
    window.dispatchEvent(new CustomEvent(REPORT_EVENT_EXIT));
    close();
  };

  return (
    <Transition appear show={data.open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={rejectOnClose}>
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {data.title}
                </Dialog.Title>
                <div className="mb-4 mt-2">
                  <p className="text-sm text-gray-500">{data.message}</p>
                </div>
                <form
                  onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    if (!data.reasonInput) return close();

                    const content = new FormData(e.target as HTMLFormElement);
                    if (!(e.target as HTMLFormElement).checkValidity()) return;
                    window.dispatchEvent(
                      new CustomEvent(REPORT_EVENT_REASON, {
                        detail: content.get("reason"),
                      }),
                    );
                    close();
                  }}
                >
                  {data.reasonInput ? (
                    <div className="mb-4 flex flex-col">
                      <label htmlFor="reasonInput">Reason</label>
                      <textarea
                        placeholder="Reason..."
                        id="reasonInput"
                        name="reason"
                        minLength={3}
                      />
                    </div>
                  ) : null}

                  <div className="flex justify-end">
                    {data.reasonInput ? (
                      <button
                        onClick={rejectOnClose}
                        type="button"
                        className="mr-auto inline-block rounded-sm bg-red-600 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#dc4c64] transition duration-150 ease-in-out hover:bg-danger-600 hover:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] focus:bg-danger-600 focus:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] focus:outline-none focus:ring-0 active:bg-danger-700 active:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(220,76,100,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.2),0_4px_18px_0_rgba(220,76,100,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.2),0_4px_18px_0_rgba(220,76,100,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.2),0_4px_18px_0_rgba(220,76,100,0.1)]"
                      >
                        Cancel
                      </button>
                    ) : null}
                    <button
                      type="submit"
                      className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                    >
                      Ok
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

/**
 * A conslidated place for handling actions/dialogs for reporting, liking, deleting, and other actions
 * that can be shared between posts and comments
 */
export const PostProvider: React.FC<
  React.PropsWithChildren<{ postId: string }>
> = ({ children, postId }) => {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const {
    data: likes,
    isLoading: likesIsLoading,
    error: likesError,
    mutate: likesMutate,
  } = useSWR<PostLikes, Response>(
    postId ? `/api/community/posts?post=${postId}` : null,
    singleFetch as () => Promise<PostLikes>,
    {
      revalidateOnFocus: false,
    },
  );
  const { data, isLoading, error, mutate } = useSWR<
    Paginate<TComment>,
    Response
  >(
    postId ? `/api/community/comments?post=${postId}&page=${page}` : null,
    singleFetch as () => Promise<Paginate<TComment>>,
    {
      revalidateOnFocus: false,
    },
  );
  const [dialog, setDialog] = useState<DialogData>({
    title: "",
    reasonInput: false,
    message: "",
    open: false,
  });

  const closeDialog = () =>
    setDialog((current) => ({ ...current, open: false }));

  return (
    <PostContext.Provider
      value={{
        comments: data,
        isLoading,
        postId,
        error,
        page,
        setPage,
        likesError,
        likes,
        likesIsLoading,
        async report(type, id) {
          try {
            const reason = await new Promise<string | null>((ok) => {
              let cleanup: (() => void) | undefined = undefined;
              const reasonHandle = (e: Event) => {
                if (cleanup) cleanup();
                ok((e as CustomEvent<string>).detail);
              };
              const exitHandle = () => {
                if (cleanup) cleanup();
                ok(null);
              };

              cleanup = () => {
                window.removeEventListener(REPORT_EVENT_REASON, reasonHandle);
                window.removeEventListener(REPORT_EVENT_EXIT, exitHandle);
              };

              window.addEventListener(REPORT_EVENT_REASON, reasonHandle, false);
              window.addEventListener(REPORT_EVENT_EXIT, exitHandle, false);

              setDialog({
                reasonInput: true,
                title: "Reason for report",
                message: `Please enter a reason for reporting this ${
                  type === "comment" ? "comment" : "post"
                }.`,
                open: true,
              });
            });

            if (!reason) return;

            const response = await fetch(
              `/api/community/${type === "comment" ? "comments" : "posts"}`,
              {
                method: "POST",
                body: JSON.stringify({
                  type: "report",
                  id,
                  reason,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );

            if (!response.ok) throw response;

            setDialog({
              message: "Your report has been documented",
              title: "Success",
              open: true,
              reasonInput: false,
            });
          } catch (error) {
            setDialog({
              message:
                "There was a problem in submitting your report! Please try again.",
              title: "Error",
              open: true,
              reasonInput: false,
            });
            console.error(error);
          }
        },
        async unlike(type, id) {
          try {
            if (type === "post") {
              await likesMutate(
                async () => {
                  const response = await fetch(
                    `/api/community/posts?type=like&id=${id}`,
                    {
                      method: "DELETE",
                    },
                  );

                  if (!response.ok) throw response;
                  const data = (await response.json()) as PostLikes;
                  return data;
                },
                {
                  optimisticData(currentData) {
                    if (!currentData) throw new Error("No Data to populate");
                    return {
                      likedByMe: false,
                      likesCount: currentData.likesCount - 1,
                    };
                  },
                  revalidate: false,
                  rollbackOnError: true,
                },
              );

              return;
            }

            await mutate(
              async (currentData) => {
                if (!currentData) throw new Error("No data to populate.");

                const idx = currentData.result.findIndex(
                  (value) => value.id === id,
                );
                if (idx === -1) throw new Error("Failed to find comment");

                const response = await fetch(
                  `/api/community/comments?type=like&id=${id}`,
                  {
                    method: "DELETE",
                  },
                );

                if (!response.ok) throw response;

                const comments = currentData.result;

                const comment = (await response.json()) as TComment;
                comments[idx] = comment;

                return { ...currentData, result: [...comments] };
              },
              {
                optimisticData(currentData) {
                  if (!currentData) throw new Error("No data to populate.");

                  const idx = currentData.result.findIndex(
                    (value) => value.id === id,
                  );
                  if (idx === -1) throw new Error("Failed to find comment");

                  const comments = currentData.result;
                  const comment = comments[idx];
                  if (!comment) throw new Error("Failed to get comment");
                  comment.likedByMe = false;
                  comment.likeCount--;

                  return { ...currentData, result: [...comments] };
                },
                revalidate: false,
                rollbackOnError: true,
              },
            );
          } catch (error) {
            console.error(error);
          }
        },
        async like(type, id) {
          try {
            if (type === "post") {
              await likesMutate(
                async () => {
                  const response = await fetch("/api/community/posts", {
                    method: "POST",
                    body: JSON.stringify({
                      id,
                      type: "like",
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });

                  if (!response.ok) throw response;
                  const data = (await response.json()) as PostLikes;

                  return data;
                },
                {
                  revalidate: false,
                  rollbackOnError: true,
                  optimisticData(currentData) {
                    if (!currentData) throw new Error("No Data to populate");
                    return {
                      likedByMe: true,
                      likesCount: currentData?.likesCount + 1,
                    };
                  },
                },
              );
              return;
            }

            await mutate(
              async (currentData) => {
                if (!currentData) throw new Error("No data to populate.");

                const idx = currentData.result.findIndex(
                  (value) => value.id === id,
                );
                if (idx === -1) throw new Error("Failed to find comment");

                const response = await fetch(`/api/community/comments`, {
                  method: "POST",
                  body: JSON.stringify({
                    type: "like",
                    id,
                  }),
                  headers: {
                    "Content-Type": "application/json",
                  },
                });

                if (!response.ok) throw response;

                const comments = currentData.result;

                const comment = (await response.json()) as TComment;
                comments[idx] = comment;

                return { ...currentData, result: [...comments] };
              },
              {
                optimisticData(current) {
                  if (!current) throw new Error("No data to populate.");

                  const idx = current.result.findIndex(
                    (value) => value.id === id,
                  );
                  if (idx === -1) throw new Error("Failed to find comment");

                  const comments = current.result;
                  const comment = comments[idx];
                  if (!comment) throw new Error("Failed to get comment");
                  comment.likedByMe = true;
                  comment.likeCount++;
                  return { ...current, id: "2", result: [...comments] };
                },
                revalidate: false,
                rollbackOnError: true,
              },
            );
          } catch (error) {
            console.error(error);
          }
        },
        async delete(type, id) {
          try {
            if (type === "post") {
              const response = await fetch(
                `/api/community/posts?type=post&id=${id}`,
                {
                  method: "DELETE",
                },
              );

              if (!response.ok) throw response;

              router.replace("/community").catch((e) => console.error(e));

              return;
            }

            await mutate(
              async (current) => {
                if (!current) throw new Error("No data to populate.");

                const response = await fetch(
                  `/api/community/comments?type=comment&id=${id}`,
                  {
                    method: "DELETE",
                  },
                );

                if (!response.ok) throw response;

                return {
                  ...current,
                  result: current.result.filter((value) => value.id !== id),
                };
              },
              {
                rollbackOnError: true,
                revalidate: false,
              },
            );
          } catch (error) {
            console.error(error);
            setDialog({
              message:
                "There was a problem in submitting your request. Please try again.",
              title: "Error",
              open: true,
              reasonInput: false,
            });
          }
        },
        async create(content, settings?: { mode: "update"; id: string }) {
          try {
            await mutate(
              async (current) => {
                if (!current || !postId)
                  throw new Error("Unable to create comment.", {
                    cause: !postId ? "NO_POST_ID" : undefined,
                  });
                const formData = new FormData();

                formData.append("postId", postId);

                if (settings?.mode === "update") {
                  formData.set("editId", settings.id);
                }

                if (content.deletedImages) {
                  content.deletedImages.forEach((item) =>
                    formData.append("deletedImages[]", item),
                  );
                }

                if (content.parentCommentId)
                  formData.append("parentId", content.parentCommentId);

                const images = extractSlateImages(
                  content.message as NonTextNode[],
                );

                if (images.length > 5) {
                  throw new Error(
                    "There can be no more then 5 images uploaded at a time.",
                    { cause: "MAX_IMAGES" },
                  );
                }

                formData.append("message", JSON.stringify(content.message));

                for (const imageData of images)
                  formData.append(
                    "imageData[]",
                    JSON.stringify({
                      id: imageData.id,
                      width: imageData.width,
                      height: imageData.height,
                    }),
                  );

                for (const image of images)
                  formData.append(`image[${image.id}]`, image.file, image.id);

                const request = await fetch("/api/community/create", {
                  method: settings?.mode === "update" ? "PATCH" : "POST",
                  body: formData,
                  headers: {
                    "X-Type-Create": "comment",
                  },
                });

                if (!request.ok) throw request;

                if (content.parentCommentId) {
                  return current;
                }

                const comment = (await request.json()) as TComment;

                if (settings?.mode === "update") {
                  return {
                    ...current,
                    result: [
                      comment,
                      ...current.result.filter(
                        (value) => value.id !== settings?.id,
                      ),
                    ],
                  };
                }

                return { ...current, result: [comment, ...current.result] };
              },
              {
                revalidate: false,
                rollbackOnError: true,
              },
            );

            return true;
          } catch (error) {
            console.error(error);

            let message =
              "There was a problem in submitting your request. Please try again.";

            if (error instanceof Error && error?.cause === "MAX_IMAGES") {
              message = error.message;
            }

            setDialog({
              message: message,
              title: "Error",
              open: true,
              reasonInput: false,
            });
            return false;
          }
        },
      }}
    >
      {children}
      <ReportDialog close={closeDialog} data={dialog} />
    </PostContext.Provider>
  );
};

const usePost = () => {
  const ctx = useContext(PostContext);
  if (!ctx)
    throw new Error("usePostActions requires to be wrapped in a PostProvider");
  return ctx;
};

export default usePost;
