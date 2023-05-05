import type { RenderPageCtx } from "datocms-plugin-sdk";
import { useState } from "react";
import useSWR from "swr";

import { Panel } from "./Panel";
import { AuthFetch } from "@/lib/utils/plugin/auth_fetch";
import { Paginate } from "@/types/page";
import DisplayDataStates from "./DisplayDataStates";
import DatoCmsPagination from "./Pagination";
import { Button, Dropdown, DropdownMenu, DropdownOption, DropdownSeparator, TextField } from "datocms-react-ui";
import { FaChevronDown, FaChevronUp, FaLock, FaThumbtack } from "react-icons/fa";
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


export const Topics: React.FC<{
    ctx: RenderPageCtx;
    mini: boolean;
    setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
    const [page, setPage] = useState<number>(1);
    const { data, error, isLoading, mutate } = useSWR<Paginate<Topic>, Response>(`/api/plugin/tac?page=${page}`, (url) => AuthFetch(url).then(value => value.json()) as Promise<Paginate<Topic>>);


    return (
        <Panel title="Topics List"
            mini={mini}
            setMini={() => setMini((state) => !state)}
            actions={<>
                <TextField placeholder="Search" id="search" name="search" onChange={() => { }} value="" label="" />

            </>}>
            <DisplayDataStates data={data} error={error} isLoading={isLoading} message={{
                error: "Failed to load topics.",
                empty: "There's no topics yet!"
            }} />
            {data && data.result.length ? (
                <>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {data.result.map(topic => (
                            <div key={topic.id} className="flex justify-between p-4 bg-white gap-2 shadow items-center">
                                <div className="flex gap-2">
                                    <div className="flex flex-col items-center">
                                        <Image className="rounded-full" width={40} height={40} src={topic.owner.image ?? ""} alt="avatar" />
                                        <div className="mt-2">{topic.owner.name}</div>
                                    </div>
                                    <div>
                                        <h1 className="font-bold text-lg line-clamp-1 underline flex items-center">
                                            {topic.locked ? <FaLock /> : null}
                                            {topic.pinned ? (<FaThumbtack />) : null}
                                            <Link href={`/community/p/${topic.id}`} prefetch={false}>{topic.name}</Link>
                                        </h1>
                                        <div className="text-sm tracking-tighter mb-1">Category: {topic.thread.name}</div>
                                        <div className="flex gap-2 flex-wrap">{topic.tags ? (topic.tags.map((value, i) => (<span className="text-dato-xs bg-green-500 text-white rounded-sm px-1" key={i}>{value}</span>))) : null}</div>
                                    </div>
                                </div>

                                <Dropdown renderTrigger={({ open, onClick }) => (
                                    <Button buttonSize="xxs" buttonType="primary" onClick={onClick}>
                                        <span className="flex items-center gap-2">Actions {open ? (<FaChevronDown />) : (<FaChevronUp />)}</span>
                                    </Button>
                                )}>
                                    <DropdownMenu alignment="right">
                                        <DropdownOption onClick={async () => {
                                            try {
                                                await mutate(async (current) => {
                                                    return current;
                                                }, { revalidate: false, rollbackOnError: true });
                                            } catch (error) {
                                                ctx.alert("Failed to delete account.").catch(e => console.error(e));
                                            }
                                        }}>
                                            <div className="font-semibold">{topic.pinned ? "Unpin Topic" : "Pin Topic"}</div>
                                            <div className="text-sm tracking-tighter text-neutral-500">{topic.pinned ? "Unpin this topic from its category." : "Pin this topic to its category."}</div>
                                        </DropdownOption>
                                        <DropdownOption onClick={async () => {
                                            try {
                                                await mutate(async (current) => {
                                                    return current;
                                                }, { revalidate: false, rollbackOnError: true });
                                            } catch (error) {
                                                ctx.alert("Failed to delete account.").catch(e => console.error(e));
                                            }
                                        }}>
                                            <div className="font-semibold">{topic.locked ? "Unlock Topic" : "Lock Topic"}</div>
                                            <div className="text-sm tracking-tighter text-neutral-500">{topic.locked ? "Unlocking will allow new comments to be posted on this topic." : "Locking will stop new comments from being posted to this topic."}</div>
                                        </DropdownOption>
                                        <DropdownSeparator />
                                        <DropdownOption red onClick={async () => {
                                            try {
                                                const sure = await ctx.openConfirm({
                                                    title: 'Confirm Deletion',
                                                    content:
                                                        `Are you sure you want to delete topic "${topic.name}"`,
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
}