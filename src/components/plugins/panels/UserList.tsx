import { Button, Dropdown, DropdownMenu, DropdownOption } from "datocms-react-ui";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import { useState } from 'react';
import useSWR from 'swr';

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import DisplayDataStates from "./DisplayDataStates";
import DatoCmsPagination from "./Pagination";
import type { Paginate } from "@type/page";
import { Panel } from "./Panel";

type User = {
    email: string | null;
    name: string | null;
    id: string;
    banned: boolean;
}

export const UserList: React.FC<{
    ctx: RenderPageCtx;
    mini: boolean;
    setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
    const [page, setPage] = useState<number>(1);
    const { data, isLoading, error, mutate } = useSWR<Paginate<User>, Response>(`/api/plugin/users?page=${page}`, (url) => AuthFetch(url).then(e => e.json()) as Promise<Paginate<User>>)


    return (
        <Panel title="User List"
            mini={mini}
            setMini={() => setMini((state) => !state)}>
            <DisplayDataStates data={data} error={error} isLoading={isLoading} message={{
                error: "There was an error loading the users list.",
                empty: "There&apos;s no users yet!"
            }} />
            {data && data.result.length ? (
                <>
                    <ul className="grid grid-cols-4 gap-2 mt-2">
                        {
                            data.result.map((value) => (
                                <li className="p-1 odd:bg-neutral-200 flex justify-between items-center shadow rounded-sm" key={value.id}>
                                    <div className="ml-2">
                                        <h3 className="font-bold flex gap-1 items-center line-clamp-1">{value.banned ? (<span className="[word-wrap: break-word] w-fit flex h-4 cursor-pointer items-center justify-between rounded-sm bg-red-600 px-3 py-0.5 text-xs font-normal normal-case leading-loose text-neutral-100 shadow-none transition-[opacity] duration-300 ease-linear hover:!shadow-none">Banned</span>) : null} {value.name}</h3>
                                        <div className="tracking-tight line-clamp-2">{value.email}</div>
                                    </div>

                                    <Dropdown
                                        renderTrigger={({ open, onClick }) => (
                                            <Button
                                                buttonSize="xxs"
                                                buttonType="primary"
                                                onClick={onClick}
                                                rightIcon={open ? <FaChevronUp style={{ fill: "var(--light-color)" }} /> : <FaChevronDown style={{ fill: "var(--light-color)" }} />}
                                            >
                                                Actions
                                            </Button>
                                        )}
                                    >
                                        <DropdownMenu alignment="right">
                                            <DropdownOption red onClick={async () => {
                                                try {
                                                    await mutate(async (current) => {
                                                        return current;
                                                    }, { revalidate: false, rollbackOnError: true });
                                                } catch (error) {

                                                }
                                            }}>
                                                Ban Account
                                            </DropdownOption>
                                            <DropdownOption red onClick={async () => {
                                                try {
                                                    const sure = await ctx.openConfirm({
                                                        title: 'Confirm Deletion',
                                                        content:
                                                            `Are you sure you want to delete ${value.name}'s account. Deleting this account will remove all topics and comments that ${value.name} has created.`,
                                                        choices: [
                                                            {
                                                                label: 'Yes',
                                                                value: true,
                                                                intent: 'negative',
                                                            },
                                                        ],
                                                        cancel: {
                                                            label: 'Cancel',
                                                            value: false,
                                                        },
                                                    });

                                                    if (!sure) return;

                                                    await mutate(async (current) => {
                                                        return current;
                                                    }, { revalidate: false, rollbackOnError: true });
                                                } catch (error) {
                                                    ctx.alert("Failed to delete account.").catch(e => console.error(e));
                                                }
                                            }}>
                                                Delete Account
                                            </DropdownOption>
                                        </DropdownMenu>
                                    </Dropdown>
                                </li>
                            ))
                        }
                    </ul>
                    <DatoCmsPagination setPage={setPage} data={data} />
                </>
            ) : null}
        </Panel>
    );
}