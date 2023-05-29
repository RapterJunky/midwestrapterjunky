import {
  Button,
  Dropdown,
  DropdownMenu,
  DropdownOption,
} from "datocms-react-ui";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import update from "immutability-helper";
import useSWR from "swr";

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import DisplayDataStates from "./DisplayDataStates";
import type { Paginate } from "@type/page";
import { Panel } from "./Panel";

export const MailingList: React.FC<{
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
      >
  );

  return (
    <Panel
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
        <>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {data.result.map((value) => (
              <li
                className="flex items-center justify-between px-1 py-1.5 shadow odd:bg-neutral-200"
                key={value.id}
              >
                <a
                  className="ml-2 text-primary underline"
                  href={`mailto:${value.email}`}
                >
                  {value.email}
                </a>
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
                      red
                      onClick={async () => {
                        try {
                          const sure = await ctx.openConfirm({
                            title: "Confirm Deletion",
                            content: `Are you sure you want to delete this "${value.email}"`,
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
                                throw new Error("Unable to process.");
                              const idx = current?.result.findIndex(
                                (item) => item.id === value.id
                              );
                              if (idx === -1)
                                throw new Error("Unable to find email.");

                              await AuthFetch(
                                `/api/plugin/mail?id=${value.id}`,
                                { method: "DELETE" }
                              );

                              return update(current, {
                                result: { $splice: [[idx, 1]] },
                              });
                            },
                            { revalidate: false, rollbackOnError: true }
                          );
                          ctx
                            .notice(
                              `Successfully removed email "${value.email}"`
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
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Panel>
  );
};
