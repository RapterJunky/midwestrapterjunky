import {
  type PaginationState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Button,
  TextInput,
  SelectInput,
  Dropdown,
  DropdownMenu,
  DropdownOption,
  DropdownSeparator,
  Spinner,
} from "datocms-react-ui";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
} from "react-icons/fa";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import update from "immutability-helper";
import { useState, useMemo } from "react";
import useSWR from "swr";

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import type { Paginate } from "@type/page";
import { Panel } from "./Panel";

type User = {
  email: string | null;
  name: string | null;
  id: string;
  banned: 0 | 1 | 2;
};

const pageSizes = [
  { label: "Show 10", value: 10 },
  { label: "Show 20", value: 20 },
  { label: "Show 30", value: 30 },
  { label: "Show 40", value: 40 },
  { label: "Show 50", value: 50 },
];

const banTypes = [
  { label: "All", value: -1 },
  { label: "Non Banned", value: 0 },
  { label: "Soft Banned", value: 1 },
  { label: "Hard Banned", value: 2 },
];

type BanType = (typeof banTypes)[0];

export const UserList: React.FC<{
  ctx: RenderPageCtx;
  mini: boolean;
  setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const { data, mutate, isLoading } = useSWR<Paginate<User>, Response, string>(
    `/api/plugin/users?page=${pageIndex}&limit=${pageSize}`,
    (url) => AuthFetch(url).then((e) => e.json()) as Promise<Paginate<User>>,
    { keepPreviousData: true },
  );

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "User accounts",
        columns: [
          {
            accessorKey: "banned",
            filterFn: (row, _columnId, value) => {
              console.log(value);
              if ((value as BanType).value === -1) return true;
              return row.original.banned === (value as BanType).value;
            },
            cell: (info) => {
              const value = info.getValue<0 | 1 | 2>();
              if (value === 0) return "No";
              if (value === 1) return "Soft Ban";
              return "Hard Ban";
            },
            header: () => <span>Banned</span>,
            footer: (props) => props.column.id,
          },
          {
            accessorKey: "name",
            cell: (info) => info.getValue<string>(),
            header: () => <span>Name</span>,
            footer: (props) => props.column.id,
          },
          {
            accessorKey: "email",
            cell: (info) => info.getValue<string>(),
            header: () => <span>Email</span>,
            footer: (props) => props.column.id,
          },
          {
            accessorKey: "id",
            enableColumnFilter: false,
            cell: (info) => info.getValue<string>(),
            header: () => <span>Id</span>,
            footer: (props) => props.column.id,
          },
        ],
      },
    ],
    [],
  );

  const table = useReactTable({
    data: data?.result ?? [],
    columns,
    pageCount: data?.pageCount ?? -1,
    state: {
      columnFilters: [
        {
          id: "banned",
          value: banTypes[0],
        },
      ],
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: true,
    //getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Panel
      title="User List"
      mini={mini}
      value="0"
      setMini={() => setMini((state) => !state)}
    >
      {!isLoading ? (
        <div className="px-4">
          <table className="w-full border-collapse border">
            <thead>
              {table.getHeaderGroups().map((groups) => (
                <tr key={groups.id}>
                  {groups.headers.map((header) => (
                    <th
                      className="border p-2"
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder ? null : (
                        <div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanFilter() ? (
                            <div className="mt-1 border-t pt-1">
                              {typeof table
                                .getPreFilteredRowModel()
                                .flatRows[0]?.getValue(header.column.id) ===
                              "number" ? (
                                <SelectInput
                                  value={header.column.getFilterValue()}
                                  onChange={(e) =>
                                    header.column.setFilterValue(e)
                                  }
                                  options={banTypes}
                                />
                              ) : (
                                <TextInput
                                  type="text"
                                  value={
                                    (header.column.getFilterValue() as string) ??
                                    ""
                                  }
                                  onChange={(e) =>
                                    header.column.setFilterValue(e)
                                  }
                                  placeholder="Search"
                                />
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const rowName = row.getValue<string>("name");
                const rowId = row.getValue<string>("id");
                const rowBanned = row.getValue<0 | 1 | 2>("banned");
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td className="border p-1" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                    <td className="w-28 border p-1">
                      <Dropdown
                        renderTrigger={({ open, onClick }) => (
                          <Button
                            buttonSize="xxs"
                            buttonType="primary"
                            onClick={onClick}
                            rightIcon={
                              open ? (
                                <FaChevronUp
                                  style={{ fill: "var(--light-color)" }}
                                />
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
                          <div className="group group-[>div>button_&]:block">
                            <DropdownOption
                              red={!rowBanned}
                              onClick={async () => {
                                try {
                                  await mutate<Paginate<User>>(
                                    async (current) => {
                                      if (!current)
                                        throw new Error("No data to update.");

                                      const idx = current.result.findIndex(
                                        (item) => item.id === rowId,
                                      );
                                      if (idx === -1)
                                        throw new Error(
                                          "Unable to find user index",
                                        );

                                      const response = await AuthFetch(
                                        "/api/plugin/users",
                                        {
                                          method: "PATCH",
                                          json: {
                                            id: rowId,
                                            ban: !rowBanned ? 1 : 0,
                                          },
                                        },
                                      );

                                      const user =
                                        (await response.json()) as User;

                                      return update(current, {
                                        result: { [idx]: { $set: user } },
                                      });
                                    },
                                    {
                                      revalidate: false,
                                      rollbackOnError: true,
                                    },
                                  );
                                  ctx
                                    .notice(
                                      `Successfully ${
                                        !rowBanned ? "soft banned" : "unbanned"
                                      } user ${rowName}`,
                                    )
                                    .catch((e) => console.error(e));
                                } catch (error) {
                                  ctx
                                    .alert(
                                      `Failed to ${
                                        !rowBanned ? "soft banned" : "unbanned"
                                      } user`,
                                    )
                                    .catch((e) => console.error(e));
                                }
                              }}
                            >
                              <div className="font-semibold">
                                {!rowBanned ? "Soft ban" : "Unban"} account
                              </div>
                              <div className="text-sm tracking-tighter text-neutral-500 group-hover:text-inherit">
                                {!rowBanned
                                  ? "Stop user from posting new topics and comments."
                                  : "Unban user"}
                              </div>
                            </DropdownOption>
                          </div>
                          <div className="group group-[>div>button_&]:block">
                            {!rowBanned ? (
                              <DropdownOption
                                red={!rowBanned}
                                onClick={async () => {
                                  try {
                                    await mutate<Paginate<User>>(
                                      async (current) => {
                                        if (!current)
                                          throw new Error("No data to update.");

                                        const idx = current.result.findIndex(
                                          (item) => item.id === rowId,
                                        );
                                        if (idx === -1)
                                          throw new Error(
                                            "Unable to find user index",
                                          );

                                        const response = await AuthFetch(
                                          "/api/plugin/users",
                                          {
                                            method: "PATCH",
                                            json: {
                                              id: rowId,
                                              ban: !rowBanned ? 2 : 0,
                                            },
                                          },
                                        );

                                        const user =
                                          (await response.json()) as User;

                                        return update(current, {
                                          result: { [idx]: { $set: user } },
                                        });
                                      },
                                      {
                                        revalidate: false,
                                        rollbackOnError: true,
                                      },
                                    );
                                    ctx
                                      .notice(
                                        `Successfully hard banned
                                } user ${rowName}`,
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
                                  {!rowBanned ? "Hard ban" : "Unban"} account
                                </div>
                                <div className="text-sm tracking-tighter text-neutral-500 group-hover:text-inherit">
                                  {!rowBanned
                                    ? "Stop user from login."
                                    : "Unban user"}
                                </div>
                              </DropdownOption>
                            ) : null}
                          </div>
                          <DropdownSeparator />
                          <DropdownOption
                            red
                            onClick={async () => {
                              try {
                                const sure = await ctx.openConfirm({
                                  title: "Confirm Deletion",
                                  content: `Are you sure you want to delete ${rowName}'s account. Deleting this account will remove all topics and comments that ${rowName} has created.`,
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

                                await mutate<Paginate<User>>(
                                  async (current) => {
                                    if (!current)
                                      throw new Error("No data to update.");

                                    const user = current.result.findIndex(
                                      (item) => item.id === rowId,
                                    );
                                    if (user !== -1)
                                      throw new Error(
                                        "Unable to find user index.",
                                      );

                                    await AuthFetch(
                                      `/api/plugin/users?id=${rowId}`,
                                      { method: "DELETE" },
                                    );

                                    return update(current, {
                                      result: { $splice: [[user, 1]] },
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
                            <div className="font-semibold">Delete account</div>
                          </DropdownOption>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex gap-2">
              <Button
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                buttonSize="xxs"
                buttonType="primary"
              >
                <FaChevronLeft />
              </Button>
              <Button
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                buttonSize="xxs"
                buttonType="primary"
              >
                <FaChevronRight />
              </Button>
            </div>
            <div className="flex gap-1">
              <span>Page</span>
              <strong>{table.getState().pagination.pageIndex + 1}</strong>
              <span>of</span>
              <strong>{table.getPageCount()}</strong>
            </div>
            <SelectInput
              onChange={(e) => table.setPageSize(e?.value ?? 50)}
              value={
                pageSizes.find(
                  (item) => item.value === table.getState().pagination.pageSize,
                ) ?? pageSizes[0]
              }
              options={pageSizes}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner size={54} />
        </div>
      )}
    </Panel>
  );
};
