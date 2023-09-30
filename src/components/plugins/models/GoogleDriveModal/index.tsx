import { Button, Canvas, Spinner, SelectInput, TextInput } from "datocms-react-ui";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import { FaFilter, FaSearch } from "react-icons/fa";
import { useState } from "react";
import useSWR from "swr";

import { AuthFetch } from "@/lib/utils/plugin/auth_fetch";
import type { GoogleImage } from "@/lib/api/googleDrive";
import type { CursorPaginate } from "@/types/page";
import ModalImage from "./ModalImage";

import "../../../../styles/override.css";

type RequestParams = [string, string | undefined, string | undefined, string | undefined];

const queryImages = async ([url, query, cursor, sort]: RequestParams): Promise<CursorPaginate<GoogleImage>> => {

    const params = new URLSearchParams();
    params.set("type", "list");

    if (query && query.length > 3) params.set("q", query);
    if (cursor) params.set("cursor", cursor);
    if (sort) params.set("sort", sort);

    const response = await AuthFetch(`${url}?${params.toString()}`);

    return response.json() as Promise<CursorPaginate<GoogleImage>>;
}

const GoogleDriveModal: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
    const [cursorStack, setCursorStack] = useState<string[]>([]);
    const [query, setQuery] = useState<string>();
    const [cursor, setCursor] = useState<string | undefined>();
    const [filter, setFilter] = useState<{ label: string; value: string; }[]>([]);
    const { isLoading, data, error } = useSWR<CursorPaginate<GoogleImage>, Response | Error, RequestParams>(["/api/plugin/images", query, cursor, filter.map(value => value.value).join(",")], queryImages);

    return (
        <Canvas ctx={ctx}>
            <div className="flex flex-col w-full h-full [& > div]:h-full">
                <section className="flex relative justify-between flex-shrink border-b" data-id="toolbar-1">
                    <div className="flex justify-between items-center w-full py-3 px-9">
                        <h1 style={{ fontSize: "var(--font-size-xl)", fontFamily: "colfax-web,Roboto,Helvetica Neue,Helvetica,Roboto,Arial,sans-serif" }} className="font-bold leading-4 mr-4">Chosse from Google Drive</h1>
                        <div className="flex items-center gap-4">
                            <div>
                                {data?.result.length ?? 0} assets
                            </div>
                            <Button buttonSize="s">
                                Upload new asset
                            </Button>
                        </div>
                    </div>
                    <button className="min-w-[49px] w-16 rounded-tr-md hover:bg-[var(--light-bg-color)] flex justify-center items-center border-l" onClick={() => ctx.resolve(null)}>
                        <svg className="text-xl" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="1em" height="1em"><path d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"></path></svg>
                    </button>
                </section>
                <section className="flex relative flex-shrink border-b py-2 px-8" data-id="toolbar-2">
                    <div className="flex justify-center items-center mr-4">Search</div>
                    <form className="flex items-center w-1/4" onSubmit={(ev) => {
                        ev.preventDefault();
                        const data = new FormData(ev.target as HTMLFormElement);
                        const value = data.get("search")?.toString() ?? null;
                        setQuery(value && value.length > 5 ? value : "");
                    }}>
                        <div className="px-2 border h-full flex items-center border-r-transparent border-r-0">
                            <FaSearch className="text-md text-[var(--light-body-color)]" />
                        </div>
                        <TextInput className="!border-l-0 focus:!border-[var(--border-color)] !w-full focus:!shadow-none" placeholder="Type something..." id="search" name="search" />
                    </form>
                    <div className="flex w-3/4">
                        <div className="px-2 border h-full flex items-center border-r-transparent border-r-0 border-l-0">
                            <FaFilter className="text-md text-[var(--light-body-color)]" />
                        </div>
                        <SelectInput value={filter} onChange={(ev) => {
                            setFilter(ev as Array<{ label: string; value: string; }>)
                        }} placeholder="No filters set" className="h-full [&>div]:!border-l-0 [&>div]:h-full w-full [&>div]:hover:shadow-none [&>div]:hover:!border-[var(--border-color)]" isMulti options={[{ label: "User uploaded", value: "user_upload" }, { label: "CMS Uploaded", value: "cms_upload" }]} />
                    </div>
                </section>
                <div className="flex flex-col overflow-y-scroll flex-1 relative px-2 py-2 bg-[var(--light-bg-color)]" style={{ maxHeight: `${(ctx.parameters.height as number ?? 200) - 200}px` }}>
                    <main className="flex-1 grid relative grid-cols-6 flex-grow gap-6">
                        {isLoading ? (
                            <div className="col-span-6 flex justify-center items-center">
                                <Spinner size={45} />
                            </div>
                        ) : error ? (
                            <div className="col-span-6 flex justify-center items-center">
                                Failed to load assets
                            </div>
                        ) : data && data.result.length <= 0 ? (
                            <div className="col-span-6 flex justify-center items-center">
                                Nothing to show.
                            </div>
                        ) : data && data.result.length > 0 ? (
                            <>
                                {data.result.map((value) => (
                                    <ModalImage key={value.id} image={value} />
                                ))}
                            </>
                        ) : null}
                    </main>
                    <div className="flex justify-center p-4 gap-4">
                        <Button onClick={() => {
                            setCursorStack((cursors) => {
                                const data = [...cursors];
                                const item = data.pop();
                                setCursor(item);
                                return data;
                            });
                        }} disabled={!cursorStack.length} buttonType="primary">
                            Prev
                        </Button>
                        <Button onClick={() => {
                            setCursor((current) => {
                                if (current) setCursorStack((items) => [...items, current]);
                                return data?.nextCursor ?? undefined
                            });
                        }} disabled={!data?.hasNextPage} buttonType="primary">
                            Next
                        </Button>
                    </div>
                </div>
                <section className="border-t bg-[var(--accent-color)] flex relative flex-shrink py-3 px-4" data-id="footer">
                    <div className="w-full"></div>
                    <Button buttonSize="s">Select Assets</Button>
                </section>
            </div>
        </Canvas>
    );
}

export default GoogleDriveModal;