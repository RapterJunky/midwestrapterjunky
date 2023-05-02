import type { RenderPageCtx } from "datocms-plugin-sdk";
import { Button } from "datocms-react-ui";
import { useState } from 'react';
import useSWR from 'swr';

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import DisplayDataStates from "./DisplayDataStates";
import DatoCmsPagination from "./Pagination";
import type { Paginate } from "@type/page";
import { Panel } from "./Panel";

export const MailingList: React.FC<{
    ctx: RenderPageCtx;
    mini: boolean;
    setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
    const [page, setPage] = useState<number>(1);
    const { data, isLoading, error } = useSWR<Paginate<{ id: number; email: string; }>, Response>(`/api/plugin/mail?page=${page}`, (url) => AuthFetch(url).then(e => e.json()) as Promise<Paginate<{ id: number; email: string }>>)


    return (
        <Panel title="Mailing List"
            mini={mini}
            setMini={() => setMini((state) => !state)}>
            <DisplayDataStates data={data} error={error} isLoading={isLoading} message={{
                error: "There was an error loading the mailing list.",
                empty: "There&apos;s no emails yet!"
            }} />
            {data && data.result.length ? (
                <>
                    <ul className="grid grid-cols-3">
                        {
                            data.result.map((value) => (
                                <li className="p-1 odd:bg-neutral-200" key={value.id}>
                                    <a className="underline text-primary" href={`mailto:${value.email}`}>{value.email}</a>
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