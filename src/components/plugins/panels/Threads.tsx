import type { RenderPageCtx } from "datocms-plugin-sdk";
import {
  Button,
  Dropdown,
  DropdownMenu,
  DropdownOption,
  DropdownSeparator,
} from "datocms-react-ui";
import { FaChevronDown, FaChevronUp, FaEdit, FaTrash } from "react-icons/fa";
import update from 'immutability-helper';
import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import type { Thread } from "@prisma/client";
import DatoCmsPagination from "./Pagination";
import type { Paginate } from "@type/page";
import { Panel } from "./Panel";
import DisplayDataStates from "./DisplayDataStates";

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
      const result = (await ctx.openModal({
        id: "thread-model",
        parameters: {
          type: "create",
        },
        title: "Create Category",
      })) as Thread | undefined;
      if (!result) return;

      await mutate(
        async (current) => {
          if (!current) throw new Error("Missing Source Data");
          const response = await AuthFetch("/api/plugin/category", {
            method: "POST",
            json: result,
          });

          const category = await response.json() as Thread;

          return update(current, {
            result: { $push: [category] }
          })
        },
        {
          revalidate: false,
          rollbackOnError: true,
        }
      );
      ctx.notice("Successfully created category.").catch(e => console.error(e));
    } catch (error) {
      console.error(error);
      ctx.alert("Was unable to edit thread.").catch((e) => console.error(e));
    }
  };
  const editModel = async (thread: Thread) => {
    try {
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
        async (current) => {
          if (!current) throw new Error("Missing Source Data");

          const idx = current.result.findIndex(item => item.id === thread.id);
          if (idx === -1) throw new Error("Failed to find topic.");

          const response = await AuthFetch("/api/plugin/category", {
            method: "PATCH",
            json: result,
          });

          const category = await response.json() as Thread;

          return update(current, {
            result: { [idx]: { $set: category } }
          })
        },
        {
          revalidate: false,
          rollbackOnError: true,
        }
      );
      ctx.notice("Successfully updated category.").catch(e => console.error(e));
    } catch (error) {
      console.error(error);
      ctx.alert("Was unable to create thread.").catch((e) => console.error(e));
    }
  };
  const deleteModel = async (id: number) => {
    try {
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
        async (current) => {
          if (!current) throw new Error("Unable to process.");

          const idx = current.result.findIndex(item => item.id === id);
          if (idx === -1) throw new Error("Failed to find topic.");

          await AuthFetch(`/api/plugin/category?id=${id}`, {
            method: "DELETE",
          });

          return update(current, {
            result: { $splice: [[idx, 1]] }
          })
        },
        {
          revalidate: false,
          rollbackOnError: true,
        }
      );
      ctx.notice("Successfully deleted category.").catch(e => console.error(e));
    } catch (error) {
      console.error(error);
      ctx.alert("Was unable to delete category.").catch((e) => console.error(e));
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
      <DisplayDataStates
        data={data as Paginate<object>}
        error={error}
        isLoading={isLoading}
        message={{
          error: "There was an error loading categories!",
          empty: "There&apos;s no categories! Try creating one.",
        }}
      />
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
                  <Dropdown
                    renderTrigger={({ open, onClick }) => (
                      <Button
                        buttonSize="xxs"
                        buttonType="primary"
                        onClick={onClick}
                      >
                        <span className="flex items-center gap-2">
                          Actions {open ? <FaChevronDown /> : <FaChevronUp />}
                        </span>
                      </Button>
                    )}
                  >
                    <DropdownMenu alignment="right">
                      <DropdownOption onClick={() => editModel(value)}>
                        <div className="flex items-center gap-1">
                          <FaEdit className="h-4 w-4" />
                          Edit
                        </div>
                      </DropdownOption>
                      <DropdownSeparator />
                      <DropdownOption
                        red
                        onClick={() => deleteModel(value.id)}
                      >
                        <div className="flex items-center gap-1">
                          <FaTrash className="h-4 w-4" />
                          Delete
                        </div>
                      </DropdownOption>
                    </DropdownMenu>
                  </Dropdown>
                </li>
              ))
              : null}
          </ul>
          <hr className="mt-dato-m" />
          <DatoCmsPagination setPage={setPage} data={data} />
        </>
      ) : null}
    </Panel>
  );
};
