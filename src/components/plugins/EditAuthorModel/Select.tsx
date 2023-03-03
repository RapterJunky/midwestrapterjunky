import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Button, Spinner } from 'datocms-react-ui';
import { useState } from 'react';
import useSWR from 'swr';
import Image from "next/image";
import { FaPlus } from 'react-icons/fa';

interface AuthorPagiation {
    limit: number,
    exceedCount: boolean,
    exceedTotalPages: boolean,
    strictLimit: boolean,
    count: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean,
    page: number,
    result: { avatar: string; name: string; social: { user: string; link: string } | null, id: string; }[]
}

const Select = ({ ctx }: { ctx: RenderModalCtx }) => {
    const [page, setPage] = useState(1);
    const { data, isLoading, error } = useSWR<AuthorPagiation, Error, [number]>([page], async ([index]) => {
        const token = new URLSearchParams(window.location.search).get("token");
        if (!token) throw new Error("Failed to fetch data.", { cause: "MISSING_AUTH_TOKEN" });

        const result = await fetch(`/api/plugin/authors?page=${index}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!result.ok) throw new Error("Failed to perform action.", { cause: `FAILED_REQUEST_${result.statusText}` });

        return result.json();
    });

    if (isLoading) {
        return (
            <div className="p-5 w-full flex flex-col items-center justify-center">
                <Spinner size={50} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-5 w-full flex flex-col items-center justify-center">
                <span>There was an error, when trying to fetch authors.</span>
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="h-full flex flex-wrap gap-2 justify-start items-start">
                {data?.result.map(value => (
                    <div className="group relative p-2 outline outline-1 rounded-sm outline-gray-200" key={value.id}>
                        <div className="flex h-full items-center justify-center gap-1">
                            <div className="relative h-12 w-12">
                                <Image
                                    sizes="100vw"
                                    className="rounded-full object-cover object-center"
                                    src={value.avatar}
                                    alt="author image"
                                    fill
                                />
                            </div>
                            <div className="ml-1 flex flex-col">
                                <h4 className="font-sans font-bold">{value.name}</h4>
                                <span className="text-blue-600">{value.social?.user}</span>
                            </div>
                        </div>
                        <button className="absolute right-0 top-0 hidden h-full w-full items-center justify-center gap-1 rounded bg-gray-200 bg-opacity-90 group-hover:flex" onClick={() => ctx.resolve(value)}>
                            <FaPlus className="h-8 w-8" />
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
                <Button disabled={!data?.hasPrevPage} onClick={() => setPage((data?.page ?? 1) - 1)}>Prev</Button>
                <span style={{ color: "var(--primary-color)" }}>{data?.page} of {(data?.totalPages ?? 0) + 1}</span>
                <Button disabled={!data?.hasNextPage} onClick={() => setPage((data?.page ?? 0) + 1)}>Next</Button>
            </div>
        </div>
    );
}

export default Select;