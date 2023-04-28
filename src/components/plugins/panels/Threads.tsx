import type { RenderPageCtx } from "datocms-plugin-sdk";
import { Button, Spinner } from "datocms-react-ui";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import type { Thread } from "@prisma/client";
import type { Paginate } from "@type/page";
import { Panel } from "./Panel";

export const Threads: React.FC<{
  ctx: RenderPageCtx;
  mini: boolean;
  setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
  const [page, setPage] = useState<number>(1);
  const { data, error, isLoading, mutate } = useSWR<
    Paginate<Thread>,
    Response,
    string
  >(
    `/api/plugin/category?page=${page}`,
    (url) =>
      fetch(url).then((value) => value.json()) as Promise<Paginate<Thread>>
  );

  const createModel = async () => {
    try {
      if (!data) throw new Error("Missing Source Data");
      const result = (await ctx.openModal({
        id: "thread-model",
        parameters: {
          type: "create",
        },
        title: "Create Category",
      })) as Thread | undefined;
      if (!result) return;

      await mutate(
        async () => {
          const request = await AuthFetch("/api/plugin/category", {
            method: "POST",
            json: result,
          });

          const body = (await request.json()) as Thread;

          return { ...data, result: [body, ...data.result] };
        },
        {
          revalidate: false,
          rollbackOnError: true,
        }
      );
    } catch (error) {
      console.error(error);
      ctx.alert("Was unable to edit thread.").catch((e) => console.error(e));
    }
  };
  const editModel = async (thread: Thread) => {
    try {
      if (!data) throw new Error("Missing Source Data");
      const result = (await ctx.openModal({
        id: "thread-model",
        parameters: {
          type: "edit",
          data: thread,
        },
        title: "Edit Category",
      })) as Thread | undefined;
      if (!result) return;

      await mutate(
        async () => {
          await AuthFetch("/api/plugin/category", {
            method: "PATCH",
            json: result,
          });
          return {
            ...data,
            result: [result].concat(
              data.result.filter((value) => value.id !== thread.id)
            ),
          };
        },
        {
          revalidate: false,
          rollbackOnError: true,
        }
      );
    } catch (error) {
      console.error(error);
      ctx.alert("Was unable to create thread.").catch((e) => console.error(e));
    }
  };
  const deleteModel = async (id: number) => {
    try {
      if (!data) throw new Error("Missing Source Data");
      const confirm = await ctx.openConfirm({
        title: "Delete Category",
        content:
          "Deleting this category will remove all posts and comments connected to this category.",
        choices: [
          {
            label: "Ok",
            value: true,
            intent: "negative",
          },
        ],
        cancel: {
          label: "Cancel",
          value: false,
        },
      });
      if (!confirm) return;

      await mutate(
        async () => {
          await AuthFetch("/api/plugin/category", {
            method: "DELETE",
            json: { id },
          });
          return {
            ...data,
            result: data.result.filter((value) => value.id !== id),
          };
        },
        {
          revalidate: false,
          rollbackOnError: true,
        }
      );
    } catch (error) {
      console.error(error);
      ctx.alert("Was unable to delete thread.").catch((e) => console.error(e));
    }
  };

  return (
    <Panel
      actions={
        <Button onClick={createModel} buttonType="primary" buttonSize="m">
          Create Category
        </Button>
      }
      title="Categories"
      mini={mini}
      setMini={() => setMini((state) => !state)}
    >
      {!data && error ? (
        <div className="flex h-full w-full items-center justify-center">
          <h1 className="text-lg">There was an error loading categories!</h1>
        </div>
      ) : null}
      {!data && isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner size={56} />
        </div>
      ) : null}
      {data && !data.result.length ? (
        <div className="flex h-full w-full items-center justify-center">
          <h1 className="text-lg">
            There&apos;s no categories! Try creating one.
          </h1>
        </div>
      ) : null}
      {data && data.result.length ? (
        <>
          <ul className="mt-dato-m space-y-dato-m">
            {data
              ? data.result.map((value) => (
                <li
                  className="flex items-center gap-2 bg-white p-4 shadow"
                  key={value.id}
                >
                  <div>
                    <Image
                      unoptimized
                      className="rounded-full"
                      src={value.image}
                      alt="Category Image"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="mr-auto">
                    <h1 className="text-xl font-bold">{value.name}</h1>
                    <div className="flex flex-wrap gap-1">
                      {value.tags?.map((tag, i) => (
                        <span
                          className="rounded-md bg-dato-accent px-1 py-0.5 text-dato-light"
                          key={i}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p>{value.description}</p>
                  </div>
                  <div className="flex gap-dato-m text-white">
                    <Button
                      onClick={() => editModel(value)}
                      rightIcon={<FaEdit style={{ fill: "white" }} />}
                      buttonType="primary"
                    />
                    <Button
                      onClick={() => deleteModel(value.id)}
                      rightIcon={<FaTrash style={{ fill: "white" }} />}
                      buttonType="negative"
                    />
                  </div>
                </li>
              ))
              : null}
          </ul>
          <hr className="mt-dato-m" />
          <div className="my-dato-l flex items-center justify-evenly">
            <Button
              onClick={() => setPage(data?.previousPage ?? 1)}
              disabled={data?.isFirstPage}
              type="button"
              buttonType="primary"
            >
              Prev
            </Button>

            <div>
              {data?.currentPage ?? 0} of {data?.currentPage ?? 0}
            </div>

            <Button
              onClick={() => setPage(data?.nextPage ?? 1)}
              disabled={data?.isLastPage}
              type="button"
              buttonType="primary"
            >
              Next
            </Button>
          </div>
        </>
      ) : null}
    </Panel>
  );
};
