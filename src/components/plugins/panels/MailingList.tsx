import {
  Button,
  Dropdown,
  DropdownMenu,
  DropdownOption,
} from "datocms-react-ui";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import update from "immutability-helper";
import useSWR, { type KeyedMutator } from "swr";

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import DisplayDataStates from "./DisplayDataStates";
import type { Paginate } from "@type/page";
import { Panel } from "./Panel";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper<{ id: number; email: string }>();

const columns = [
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("id", {
    header: "",
    id: "id",
  }),
];

const RenderTable: React.FC<{
  ctx: RenderPageCtx;
  data: { id: number; email: string }[];
  mutate: KeyedMutator<
    Paginate<{
      id: number;
      email: string;
    }>
  >;
}> = ({ data, mutate, ctx }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full divide-y">
      <thead className="divide-x divide-y">
        {table.getHeaderGroups().map((headerGroups) => (
          <tr key={headerGroups.id} className="divide-x">
            {headerGroups.headers.map((headers) => (
              <th key={headers.id}>
                {headers.isPlaceholder
                  ? null
                  : flexRender(
                    headers.column.columnDef.header,
                    headers.getContext(),
                  )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y">
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="divide-x">
            {row.getVisibleCells().map((cell) => (
              <th key={cell.id}>
                {cell.column.id === "id" ? (
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
                      <DropdownOption
                        red
                        onClick={async () => {
                          try {
                            const sure = await ctx.openConfirm({
                              title: "Confirm Deletion",
                              content: `Are you sure you want to delete this "${row.getValue<string>(
                                "email",
                              )}"`,
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

                            await mutate<
                              Paginate<{ id: number; email: string }>
                            >(
                              async (current) => {
                                if (!current)
                                  throw new Error("Unable to process.");
                                const idx = current?.result.findIndex(
                                  (item) =>
                                    item.id === row.getValue<number>("id"),
                                );
                                if (idx === -1)
                                  throw new Error("Unable to find email.");

                                await AuthFetch(
                                  `/api/plugin/mail?id=${row.getValue<string>(
                                    "id",
                                  )}`,
                                  { method: "DELETE" },
                                );

                                return update(current, {
                                  result: { $splice: [[idx, 1]] },
                                });
                              },
                              { revalidate: false, rollbackOnError: true },
                            );
                            ctx
                              .notice(
                                `Successfully removed email "${row.getValue<string>(
                                  "email",
                                )}"`,
                              )
                              .catch((e) => console.error(e));
                          } catch (error) {
                            ctx
                              .alert("Failed to delete account.")
                              .catch((e) => console.error(e));
                          }
                        }}
                      >
                        Delete
                      </DropdownOption>
                    </DropdownMenu>
                  </Dropdown>
                ) : (
                  <a
                    className="text-primary ml-2 underline"
                    href={`mailto:${cell.getContext().getValue() as string}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </a>
                )}
              </th>
            ))}
            <th></th>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const MailingList: React.FC<{
  ctx: RenderPageCtx;
  mini: boolean;
  setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
  const { data, isLoading, error, mutate } = useSWR<
    Paginate<{ id: number; email: string }>,
    Response,
    string
  >(
    `/api/plugin/mail?type=list`,
    (url) =>
      AuthFetch(url).then((e) => e.json()) as Promise<
        Paginate<{ id: number; email: string }>
      >,
  );

  return (
    <Panel
      value="1"
      actions={
        <div className="flex gap-2">
          <Dropdown
            renderTrigger={({ open, onClick }) => (
              <Button
                buttonSize="s"
                buttonType="primary"
                onClick={onClick}
                rightIcon={
                  open ? (
                    <FaChevronUp style={{ fill: "white" }} />
                  ) : (
                    <FaChevronDown style={{ fill: "white" }} />
                  )
                }
              >
                Options
              </Button>
            )}
          >
            <DropdownMenu alignment="right">
              <DropdownOption
                onClick={() =>
                  ctx.openModal({
                    id: "mrj_mail_settings",
                    title: "Mail Wizard",
                    width: "xl",
                  })
                }
              >
                Email All
              </DropdownOption>
              <DropdownOption
                onClick={() => {
                  window.open("https://mc.sendgrid.com/contacts/all", "_blank");
                }}
              >
                Download List
              </DropdownOption>
            </DropdownMenu>
          </Dropdown>
        </div>
      }
      title="Mailing List"
      mini={mini}
      setMini={() => setMini((state) => !state)}
    >
      <DisplayDataStates
        data={data}
        error={error}
        isLoading={isLoading}
        message={{
          error: "There was an error loading the mailing list.",
          empty: "There's no emails yet!",
        }}
      />
      {data && data.result.length ? (
        <RenderTable data={data.result} mutate={mutate} ctx={ctx} />
      ) : null}
    </Panel>
  );
};

export default MailingList;