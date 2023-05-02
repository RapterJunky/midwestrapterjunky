import type { RenderPageCtx } from "datocms-plugin-sdk";
import { useState } from "react";
import useSWR from "swr";

import { Panel } from "./Panel";
import { AuthFetch } from "@/lib/utils/plugin/auth_fetch";
import { Paginate } from "@/types/page";
import DisplayDataStates from "./DisplayDataStates";
import DatoCmsPagination from "./Pagination";
import { Button, Dropdown, DropdownMenu, DropdownOption, TextField } from "datocms-react-ui";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Image from "next/image";

type Topic = {
    name: string;
    locked: boolean;
    pinned: boolean;
    id: string;
    tags: PrismaJson.Tags | null;
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
        <Panel title="Topics"
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
                    <div className="flex flex-col gap-2">
                        {data.result.map(topic => (
                            <div key={topic.id} className="flex justify-between p-4 bg-white gap-2 shadow">
                                <div className="flex gap-2">
                                    <div>
                                        <Image className="rounded-full" width={40} height={40} src={topic.owner.image ?? ""} alt="avatar" />
                                        <div className="mt-2">{topic.owner.name}</div>
                                    </div>
                                    <div>
                                        <h2 className="font-bold">{topic.name}</h2>
                                        <div className="flex gap-2 flex-wrap">{topic.tags ? (topic.tags.map((value, i) => (<span className="text-dato-xs bg-green-500 text-white rounded-sm px-1" key={i}>{value}</span>))) : null}</div>
                                    </div>
                                </div>

                                <Dropdown renderTrigger={({ open, onClick }) => (
                                    <Button buttonSize="xxs" buttonType="primary" onClick={onClick}>
                                        <span className="flex items-center gap-2">Actions {open ? (<FaChevronDown />) : (<FaChevronUp />)}</span>
                                    </Button>
                                )}>
                                    <DropdownMenu alignment="right">
                                        <DropdownOption>
                                            {topic.pinned ? "Unpin Topic" : "Pin Topic"}
                                        </DropdownOption>
                                        <DropdownOption>
                                            {topic.locked ? "Unlock Topic" : "Lock Topic"}
                                        </DropdownOption>
                                        <DropdownOption red>
                                            Delete Topic
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