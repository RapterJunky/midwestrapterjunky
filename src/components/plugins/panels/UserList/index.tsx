import {
  type PaginationState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { TextInput, SelectInput, Spinner } from "datocms-react-ui";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import { useState, useMemo } from "react";
import useSWR from "swr";

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import type { Paginate } from "@type/page";
import Pagination from "./Pagination";
import { Panel } from "../Panel";
import UserItem from "./UserItem";

export type User = {
  email: string | null;
  name: string | null;
  id: string;
  banned: 0 | 1 | 2;
};

const banTypes = [
  { label: "All", value: -1 },
  { label: "Non Banned", value: 0 },
  { label: "Soft Banned", value: 1 },
  { label: "Hard Banned", value: 2 },
];

type BanType = (typeof banTypes)[0];

const UserList: React.FC<{
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
                    <UserItem
                      ctx={ctx}
                      mutate={mutate}
                      rowName={rowName}
                      rowId={rowId}
                      rowBanned={rowBanned}
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination table={table} />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner size={54} />
        </div>
      )}
    </Panel>
  );
};

export default UserList;
