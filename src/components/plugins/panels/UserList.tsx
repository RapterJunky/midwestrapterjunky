import {
  Button,
  Dropdown,
  DropdownMenu,
  DropdownOption,
  DropdownSeparator,
} from "datocms-react-ui";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import update from "immutability-helper";
import { useState } from "react";
import useSWR from "swr";

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import DisplayDataStates from "./DisplayDataStates";
import DatoCmsPagination from "./Pagination";
import type { Paginate } from "@type/page";
import { Panel } from "./Panel";

type User = {
  email: string | null;
  name: string | null;
  id: string;
  banned: 0 | 1 | 2;
};

export const UserList: React.FC<{
  ctx: RenderPageCtx;
  mini: boolean;
  setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading, error, mutate } = useSWR<
    Paginate<User>,
    Response,
    string
  >(
    `/api/plugin/users?page=${page}`,
    (url) => AuthFetch(url).then((e) => e.json()) as Promise<Paginate<User>>
  );

  return (
    <Panel
      title="User List"
      mini={mini}
      setMini={() => setMini((state) => !state)}
    >
      <DisplayDataStates
        data={data}
        error={error}
        isLoading={isLoading}
        message={{
          error: "There was an error loading the users list.",
          empty: "There's no users yet!",
        }}
      />
      {data && data.result.length ? (
        <>
          <ul className="mt-2 grid grid-cols-4 gap-2">
            {data.result.map((value) => (
              <li
                className="flex items-center justify-between rounded-sm p-1 shadow odd:bg-neutral-200"
                key={value.id}
              >
                <div className="ml-2">
                  <h3 className="line-clamp-1 flex items-center gap-1 font-bold">
                    {value.banned ? (
                      <span className="[word-wrap: break-word] flex h-4 w-fit cursor-pointer items-center justify-between rounded-sm bg-red-600 px-3 py-0.5 text-xs font-normal normal-case leading-loose text-neutral-100 shadow-none transition-[opacity] duration-300 ease-linear hover:!shadow-none">
                        {value.banned === 1 ? "Soft" : "Hard"} Banned
                      </span>
                    ) : null}{" "}
                    {value.name}
                  </h3>
                  <div className="line-clamp-2 tracking-tight">
                    {value.email}
                  </div>
                </div>

                <Dropdown
                  renderTrigger={({ open, onClick }) => (
                    <Button
                      buttonSize="xxs"
                      buttonType="primary"
                      onClick={onClick}
                      rightIcon={
                        open ? (
                          <FaChevronUp style={{ fill: "var(--light-color)" }} />
                        ) : (
                          <FaChevronDown
                            style={{ fill: "var(--light-color)" }}
                          />
                        )
                      }
                    >
                      Actions
                    </Button>
                  )}
                >
                  <DropdownMenu alignment="right">
                    <DropdownOption
                      red={!value.banned}
                      onClick={async () => {
                        try {
                          await mutate(
                            async (current) => {
                              if (!current)
                                throw new Error("No data to update.");

                              const idx = current.result.findIndex(
                                (item) => item.id === value.id
                              );
                              if (idx === -1)
                                throw new Error("Unable to find user index");

                              const response = await AuthFetch(
                                "/api/plugin/users",
                                {
                                  method: "PATCH",
                                  json: {
                                    id: value.id,
                                    ban: !value.banned ? 1 : 0,
                                  },
                                }
                              );

                              const user = (await response.json()) as User;

                              return update(current, {
                                result: { [idx]: { $set: user } },
                              });
                            },
                            {
                              revalidate: false,
                              rollbackOnError: true,
                            }
                          );
                          ctx
                            .notice(
                              `Successfully ${
                                !value.banned ? "soft banned" : "unbanned"
                              } user ${value.name}`
                            )
                            .catch((e) => console.error(e));
                        } catch (error) {
                          ctx
                            .alert(
                              `Failed to ${
                                !value.banned ? "soft banned" : "unbanned"
                              } user`
                            )
                            .catch((e) => console.error(e));
                        }
                      }}
                    >
                      <div className="font-semibold">
                        {!value.banned ? "Soft ban" : "Unban"} account
                      </div>
                      <div className="text-sm tracking-tighter text-neutral-500 peer-hover:text-inherit">
                        {!value.banned
                          ? "Stop user from posting new topics and comments."
                          : "Unban user"}
                      </div>
                    </DropdownOption>
                    {!value.banned ? (
                      <DropdownOption
                        red={!value.banned}
                        onClick={async () => {
                          try {
                            await mutate(
                              async (current) => {
                                if (!current)
                                  throw new Error("No data to update.");

                                const idx = current.result.findIndex(
                                  (item) => item.id === value.id
                                );
                                if (idx === -1)
                                  throw new Error("Unable to find user index");

                                const response = await AuthFetch(
                                  "/api/plugin/users",
                                  {
                                    method: "PATCH",
                                    json: {
                                      id: value.id,
                                      ban: !value.banned ? 2 : 0,
                                    },
                                  }
                                );

                                const user = (await response.json()) as User;

                                return update(current, {
                                  result: { [idx]: { $set: user } },
                                });
                              },
                              {
                                revalidate: false,
                                rollbackOnError: true,
                              }
                            );
                            ctx
                              .notice(
                                `Successfully hard banned
                                } user ${value.name}`
                              )
                              .catch((e) => console.error(e));
                          } catch (error) {
                            ctx
                              .alert("Failed to hard banned user")
                              .catch((e) => console.error(e));
                          }
                        }}
                      >
                        <div className="font-semibold">
                          {!value.banned ? "Hard ban" : "Unban"} account
                        </div>
                        <div className="text-sm tracking-tighter text-neutral-500 peer-hover:text-inherit">
                          {!value.banned
                            ? "Stop user from login."
                            : "Unban user"}
                        </div>
                      </DropdownOption>
                    ) : null}
                    <DropdownSeparator />
                    <DropdownOption
                      red
                      onClick={async () => {
                        try {
                          const sure = await ctx.openConfirm({
                            title: "Confirm Deletion",
                            content: `Are you sure you want to delete ${value.name}'s account. Deleting this account will remove all topics and comments that ${value.name} has created.`,
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

                          await mutate(
                            async (current) => {
                              if (!current)
                                throw new Error("No data to update.");

                              const user = current.result.findIndex(
                                (item) => item.id === value.id
                              );
                              if (user !== -1)
                                throw new Error("Unable to find user index.");

                              await AuthFetch(
                                `/api/plugin/users?id=${value.id}`,
                                { method: "DELETE" }
                              );

                              return update(current, {
                                result: { $splice: [[user, 1]] },
                              });
                            },
                            { revalidate: false, rollbackOnError: true }
                          );
                        } catch (error) {
                          ctx
                            .alert("Failed to delete account.")
                            .catch((e) => console.error(e));
                        }
                      }}
                    >
                      Delete account
                    </DropdownOption>
                  </DropdownMenu>
                </Dropdown>
              </li>
            ))}
          </ul>
          <DatoCmsPagination setPage={setPage} data={data} />
        </>
      ) : null}
    </Panel>
  );
};
