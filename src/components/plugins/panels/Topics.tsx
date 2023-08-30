import {
  Button,
  Dropdown,
  DropdownMenu,
  DropdownOption,
  DropdownSeparator,
  TextInput,
} from "datocms-react-ui";
import {
  FaChevronDown,
  FaChevronUp,
  FaLock,
  FaSearch,
  FaThumbtack,
} from "react-icons/fa";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import update from "immutability-helper";
import { useState } from "react";
import useSWR, { type KeyedMutator } from "swr";

import { Panel } from "./Panel";
import { AuthFetch } from "@/lib/utils/plugin/auth_fetch";
import type { Paginate } from "@type/page";
import DisplayDataStates from "./DisplayDataStates";
import DatoCmsPagination from "./Pagination";

import Image from "next/image";
import Link from "next/link";

type Topic = {
  name: string;
  locked: boolean;
  pinned: boolean;
  id: string;
  tags: PrismaJson.Tags | null;
  notifyOwner: boolean;
  thread: {
    name: string;
  };
  owner: {
    name: string | null;
    image: string | null;
  };
};

type DropdownActionProps = {
  mutate: KeyedMutator<Paginate<Topic>>;
  ctx: RenderPageCtx;
  title: string;
  subtitle: string;
  data: {
    id: string;
    type: string;
    prop: string;
    value: boolean;
  };
  messages: {
    success: string;
    error: string;
  };
};

const DropdownAction: React.FC<DropdownActionProps> = ({
  mutate,
  data,
  ctx,
  messages,
  title,
  subtitle,
}) => {
  return (
    <DropdownOption
      onClick={async () => {
        try {
          await mutate<Paginate<Topic>>(
            async (current) => {
              if (!current) throw new Error("Unable to process.");
              const idx = current.result.findIndex(
                (item) => item.id === data.id,
              );
              if (idx === -1) throw new Error("Failed to find topic");

              const response = await AuthFetch(`/api/plugin/tac`, {
                method: "PATCH",
                json: {
                  id: data.id,
                  type: data.type,
                  prop: data.prop,
                  value: !data.value,
                },
              });

              const body = (await response.json()) as Topic;

              return update(current, {
                result: { [idx]: { $set: body } },
              });
            },
            { revalidate: false, rollbackOnError: true },
          );
          ctx.notice(messages.success).catch((e) => console.error(e));
        } catch (error) {
          ctx.alert(messages.error).catch((e) => console.error(e));
        }
      }}
    >
      <div className="font-semibold">{title}</div>
      <div className="text-sm tracking-tighter text-neutral-500">
        {subtitle}
      </div>
    </DropdownOption>
  );
};

export const Topics: React.FC<{
  ctx: RenderPageCtx;
  mini: boolean;
  setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const { data, error, isLoading, mutate } = useSWR<
    Paginate<Topic>,
    Response,
    string
  >(
    `/api/plugin/tac?page=${page}&search=${encodeURIComponent(search)}`,
    (url) =>
      AuthFetch(url).then((value) => value.json()) as Promise<Paginate<Topic>>,
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.target as HTMLFormElement);
    const search = data.get("search");

    setSearch(search ? search.toString() : "");
  };

  return (
    <Panel
      title="Topics List"
      mini={mini}
      actions={
        <form onSubmit={onSubmit} className="flex gap-2">
          <TextInput name="search" id="search" placeholder="Search" />
          <Button
            buttonType="primary"
            type="submit"
            buttonSize="s"
            className="flex flex-col items-center justify-center p-2"
          >
            <FaSearch />
          </Button>
        </form>
      }
      setMini={() => setMini((state) => !state)}
    >
      <DisplayDataStates
        data={data}
        error={error}
        isLoading={isLoading}
        message={{
          error: "Failed to load topics.",
          empty: "There's no topics yet!",
        }}
      />
      {data && data.result.length ? (
        <>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {data.result.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between gap-2 bg-white p-4 shadow"
              >
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <Image
                      className="rounded-full"
                      width={40}
                      height={40}
                      src={topic.owner.image ?? ""}
                      alt="avatar"
                    />
                    <div className="mt-2">{topic.owner.name}</div>
                  </div>
                  <div>
                    <h1 className="line-clamp-1 flex items-center text-lg font-bold underline">
                      {topic.locked ? <FaLock /> : null}
                      {topic.pinned ? <FaThumbtack /> : null}
                      <Link href={`/community/p/${topic.id}`} prefetch={false}>
                        {topic.name}
                      </Link>
                    </h1>
                    <div className="mb-1 text-sm tracking-tighter">
                      Category: {topic.thread.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {topic.tags
                        ? topic.tags.map((value, i) => (
                            <span
                              className="rounded-sm bg-green-500 px-1 text-dato-xs text-white"
                              key={i}
                            >
                              {value}
                            </span>
                          ))
                        : null}
                    </div>
                  </div>
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
                    <DropdownAction
                      mutate={mutate}
                      ctx={ctx}
                      messages={{
                        success: `Successfully ${
                          topic.pinned ? "unpinned" : "pinned"
                        } topic.`,
                        error: `Failed to ${
                          topic.pinned ? "Unpin Topic" : "Pin Topic"
                        }`,
                      }}
                      data={{
                        id: topic.id,
                        type: "topic",
                        prop: "pinned",
                        value: topic.pinned,
                      }}
                      title={topic.pinned ? "Unpin Topic" : "Pin Topic"}
                      subtitle={
                        topic.pinned
                          ? "Unpin this topic from its category."
                          : "Pin this topic to its category."
                      }
                    />
                    <DropdownAction
                      mutate={mutate}
                      ctx={ctx}
                      messages={{
                        success: `Successfully ${
                          topic.locked ? "unlocked" : "locked"
                        } topic.`,
                        error: `Failed to ${
                          topic.locked ? "unlock" : "lock"
                        } topic.`,
                      }}
                      data={{
                        id: topic.id,
                        type: "topic",
                        prop: "locked",
                        value: topic.locked,
                      }}
                      title={topic.locked ? "Unlock Topic" : "Lock Topic"}
                      subtitle={
                        topic.locked
                          ? "Unlocking will allow new comments to be posted on this topic."
                          : "Locking will stop new comments from being posted to this topic."
                      }
                    />
                    <DropdownAction
                      mutate={mutate}
                      ctx={ctx}
                      messages={{
                        success: "Successfully updated topic.",
                        error: "Failed to update topic",
                      }}
                      data={{
                        id: topic.id,
                        type: "topic",
                        prop: "notifyOwner",
                        value: topic.notifyOwner,
                      }}
                      title={
                        topic.notifyOwner
                          ? "Don't Send Notifications"
                          : "Send Notifications"
                      }
                      subtitle={
                        topic.notifyOwner
                          ? "Disallow sending email notifications to user for new comments."
                          : "Allow sending email notification for new comments."
                      }
                    />
                    <DropdownSeparator />
                    <DropdownOption
                      red
                      onClick={async () => {
                        try {
                          const sure = await ctx.openConfirm({
                            title: "Confirm Deletion",
                            content: `Are you sure you want to delete topic "${topic.name}"`,
                            choices: [
                              {
                                label: "Yes",
                                value: true,
                                intent: "negative",
                              },
                            ],
                            cancel: {
                              label: "Cancel",
                              value: false,
                            },
                          });

                          if (!sure) return;

                          await mutate<Paginate<Topic>>(
                            async (current) => {
                              if (!current)
                                throw new Error("Unable to process.");
                              const idx = current.result.findIndex(
                                (item) => item.id === topic.id,
                              );
                              if (idx === -1)
                                throw new Error("Failed to find topic.");

                              await AuthFetch(
                                `/api/plugin/tac?type=topic&id=${topic.id}`,
                                { method: "DELETE" },
                              );

                              return update(current, {
                                result: { $splice: [[idx, 1]] },
                              });
                            },
                            { revalidate: false, rollbackOnError: true },
                          );
                        } catch (error) {
                          ctx
                            .alert("Failed to delete account.")
                            .catch((e) => console.error(e));
                        }
                      }}
                    >
                      <div className="font-semibold">Delete Topic</div>
                    </DropdownOption>
                  </DropdownMenu>
                </Dropdown>
              </div>
            ))}
          </div>
          <DatoCmsPagination data={data} setPage={setPage} />
        </>
      ) : null}
    </Panel>
  );
};

/*
 <DropdownOption
                      onClick={async () => {
                        try {
                          await mutate(
                            async (current) => {
                              if (!current)
                                throw new Error("Unable to process.");
                              const idx = current.result.findIndex(
                                (item) => item.id === topic.id
                              );
                              if (idx === -1)
                                throw new Error("Failed to find topic");

                              const response = await AuthFetch(
                                `/api/plugin/tac`,
                                {
                                  method: "PATCH",
                                  json: {
                                    id: topic.id,
                                    type: "topic",
                                    prop: "pinned",
                                    value: !topic.pinned,
                                  },
                                }
                              );

                              const data = (await response.json()) as Topic;

                              return update(current, {
                                result: { [idx]: { $set: data } },
                              });
                            },
                            { revalidate: false, rollbackOnError: true }
                          );
                          ctx
                            .notice(
                              `Successfully ${topic.pinned ? "unpinned" : "pinned"} topic.`
                            )
                            .catch((e) => console.error(e));
                        } catch (error) {
                          ctx
                            .alert(
                              `Failed to ${topic.pinned ? "Unpin Topic" : "Pin Topic"
                              }`
                            )
                            .catch((e) => console.error(e));
                        }
                      }}
                    >
                      <div className="font-semibold">
                        {topic.pinned ? "Unpin Topic" : "Pin Topic"}
                      </div>
                      <div className="text-sm tracking-tighter text-neutral-500">
                        {topic.pinned
                          ? "Unpin this topic from its category."
                          : "Pin this topic to its category."}
                      </div>
                    </DropdownOption>
 */
