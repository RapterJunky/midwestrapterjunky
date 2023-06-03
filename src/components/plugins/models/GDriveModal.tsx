import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Button, Canvas, Spinner, TextInput } from "datocms-react-ui";
import { useState } from "react";
import { FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import useSWR from 'swr';

import { AuthFetch } from "@/lib/utils/plugin/auth_fetch";
import type { CursorPaginate } from "@type/page";
import Image from "next/image";

type GoogleImage = {
  id: string;
  name: string;
  appProperties: {
    alt: string;
    blurthumb: string;
  }
}

const GDriveModel: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  const [query, setQuery] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<string>()
  const [cursor, setCursor] = useState<string>();
  const { isLoading, data, error, mutate } = useSWR<CursorPaginate<GoogleImage>, Response | Error, [string, string | undefined, string | undefined]>(["/api/plugin/images", query, cursor], async (args) => {
    const url = args.at(0);
    const search = args[1];
    const pageCursor = args[2];
    if (!url) throw new Error("Failed to get url");

    const params = new URLSearchParams();
    if (search && search.length > 3) params.set("q", search);
    if (pageCursor) params.set("cursor", pageCursor);

    return AuthFetch(`${url}?${params.toString()}`).then(value => value.json()) as Promise<CursorPaginate<GoogleImage>>
  });

  return (
    <Canvas ctx={ctx}>
      <form className="flex mb-4 w-full items-center justify-center" onSubmit={(e) => { e.preventDefault(); setQuery(searchQuery) }}>
        <TextInput
          size={1}
          id="search"
          placeholder="Search"
          name="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e)}
        />
        <Button type="submit">
          <FaSearch />
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          <div className="flex w-full items-center justify-center my-4">
            <Spinner size={54} />
          </div>
        ) : null}
        {data?.result.map((item, i) => (
          <div className="shadow relative group" key={i}>
            <div className="hidden group-hover:flex items-center justify-center gap-2 absolute w-full h-full bg-opacity-60 bg-neutral-400">
              <Button buttonType="primary" buttonSize="xs" onClick={() => ctx.resolve(item)}>
                <FaPlus />
              </Button>
              <Button buttonType="negative" buttonSize="xs" onClick={() => {
                mutate(async (current) => {
                  if (!current) throw new Error("Not Data");
                  await AuthFetch(`/api/plugin/images?id=${item.id}`, { method: "DELETE" })
                  return {
                    ...current,
                    result: current.result.filter((image) => image.id !== item.id)
                  }
                }).catch(e => console.error(e));
              }}>
                <FaTrash />
              </Button>
            </div>
            <Image height={150} width={150} src={`https://drive.google.com/uc?id=${item.id}`} alt={item.name} />
          </div>
        ))}
      </div>
    </Canvas>
  );
};
/*
{data?.result.map((item, i) => (
          <button className="shadow" key={i} onClick={() => {
            mutate(async (current) => {
              if (!current) throw new Error("Not Data");
              await AuthFetch(`/api/plugin/images?id=${item.id}`, { method: "DELETE" })
              return {
                ...current,
                result: current.result.filter((image) => image.id !== item.id)
              }
            }).catch(e => console.error(e));
          }}>
            <Image height={150} width={150} src={`https://drive.google.com/uc?id=${item.id}`} alt={item.name} />
          </button>
        ))}

*/
export default GDriveModel;
