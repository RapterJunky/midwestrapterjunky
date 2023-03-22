import type { RenderPageCtx } from "datocms-plugin-sdk";
import { Button, Spinner } from "datocms-react-ui";
import useSWR from 'swr';
import { useState } from 'react';
import { FaEdit, FaTrash } from "react-icons/fa";
import { Panel } from './Panel';
import type { Paginate } from "@type/page";
import type { Thread } from "@prisma/client";
import { AuthFetch } from "@lib/utils/plugin/auth_fetch";

export const Threads: React.FC<{ ctx: RenderPageCtx, mini: boolean, setMini: React.Dispatch<React.SetStateAction<boolean>> }> = ({ ctx, mini, setMini }) => {
    const [page, setPage] = useState<number>(1);
    const { data, error, isLoading, mutate } = useSWR<Paginate<Thread>>(`/api/threads?page=${page}`, (url) => fetch(url).then(value => value.json()));

    const createModel = async () => {
        try {
            if (!data) throw new Error("Missing Source Data");
            const result = await ctx.openModal({
                id: "thread-model",
                parameters: {
                    type: "create"
                },
                title: "Create Thread"
            }) as Thread | undefined;
            if (!result) return;

            const request = await AuthFetch("/api/threads", {
                method: "POST",
                json: result
            });

            const body = await request.json();
            await mutate({ ...data, result: [body, data.result] });
        } catch (error) {
            console.error(error);
            ctx.alert("Was unable to edit thread.");
        }
    }

    const editModel = async (thread: Thread) => {
        try {
            if (!data) throw new Error("Missing Source Data");
            const result = await ctx.openModal({
                id: "thread-model",
                parameters: {
                    type: "edit",
                    data: thread
                },
                title: "Edit Thread"
            }) as Thread | undefined;
            if (!result) return;

            await AuthFetch("/api/threads", {
                method: "PATCH",
                json: result
            });

            await mutate({ ...data, result: [result].concat(data.result.filter(value => value.id !== thread.id)) });

        } catch (error) {
            console.error(error);
            ctx.alert("Was unable to create thread.");
        }
    }
    const deleteModel = async (id: number) => {
        try {
            if (!data) throw new Error("Missing Source Data");
            const confirm = await ctx.openConfirm({
                title: 'Delete Thread',
                content:
                    'Deleting this thread will remove all posts and comments connected to this thread.',
                choices: [
                    {
                        label: 'Ok',
                        value: true,
                        intent: "negative",
                    }
                ],
                cancel: {
                    label: 'Cancel',
                    value: false,
                },
            })
            if (!confirm) return;

            await AuthFetch("/api/threads", {
                method: "DELETE",
                json: { id },
            });

            await mutate({ ...data, result: data.result.filter(value => value.id !== id) });
        } catch (error) {
            console.error(error);
            ctx.alert("Was unable to delete thread.");
        }
    }

    return (
        <Panel
            actions={<Button onClick={createModel} buttonType="primary" buttonSize="m">Create Thread</Button>}
            title="Threads"
            mini={mini}
            setMini={() => setMini((state) => !state)}
        >
            {!data && error ? (
                <div className="h-full w-full flex justify-center items-center">
                    <h1 className="text-lg">There was an error loading threads!</h1>
                </div>
            ) : null}
            {!data && isLoading ? (
                <div className="h-full w-full flex justify-center items-center">
                    <Spinner size={56} />
                </div>
            ) : null}
            {data && !data.result.length ? (
                <div className="h-full w-full flex justify-center items-center">
                    <h1 className="text-lg">There&apos;s no threads! Try creating one.</h1>
                </div>
            ) : null}
            {data && data.result.length ? (
                <>
                    <ul className="mt-dato-m space-y-dato-m">
                        {data ? (data.result.map(value => (
                            <li className="flex bg-white shadow p-4" key={value.id}>
                                <div className="mr-auto">
                                    <h1 className="font-bold text-xl">{value.name}</h1>
                                    <span className="text-sm">Description</span>
                                </div>
                                <div className="flex text-white gap-dato-m">
                                    <Button onClick={() => editModel(value)} rightIcon={<FaEdit style={{ fill: "white" }} />} buttonType="primary" />
                                    <Button onClick={() => deleteModel(value.id)} rightIcon={<FaTrash style={{ fill: "white" }} />} buttonType="negative" />
                                </div>
                            </li>
                        ))) : null}
                    </ul>
                    <hr className="mt-dato-m" />
                    <div className="my-dato-l flex items-center justify-evenly">
                        <Button
                            onClick={() => setPage(data?.previousPage ?? 1)}
                            disabled={data?.isFirstPage}
                            type="button"
                            buttonType="primary"
                        >
                            Prev
                        </Button>

                        <div>
                            {data?.currentPage ?? 0} of {data?.currentPage ?? 0}
                        </div>

                        <Button
                            onClick={() => setPage(data?.nextPage ?? 1)}
                            disabled={data?.isLastPage}
                            type="button"
                            buttonType="primary"
                        >
                            Next
                        </Button>
                    </div>
                </>
            ) : null}
        </Panel>
    );
}