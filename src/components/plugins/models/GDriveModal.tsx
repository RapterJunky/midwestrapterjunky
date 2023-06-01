import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Button, Canvas, TextInput } from "datocms-react-ui";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import useSWR from 'swr';

import { AuthFetch } from "@/lib/utils/plugin/auth_fetch";
import type { CursorPaginate } from "@type/page";
import Image from "next/image";

type GoogleImage = {
  kind: string;
  mimeType: string;
  id: string;
  name: string;
}

const GDriveModel: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  const [query, setQuery] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<string>()
  const [cursor, setCursor] = useState<string>();
  const { isLoading, data, error } = useSWR<CursorPaginate<GoogleImage>, Response | Error, [string, string | undefined, string | undefined]>(["/api/plugin/images", query, cursor], async (args) => {
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
      <form className="flex" onSubmit={(e) => { e.preventDefault(); setQuery(searchQuery) }}>
        Search{" "}
        <TextInput
          size={1}
          id="search"
          name="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e)}
        />
        <Button type="submit">
          <FaSearch />
        </Button>
      </form>
      <div className="flex flex-wrap">

        {data?.result.map((item, i) => (
          <div key={i}>
            <Image height={150} width={150} src={`https://drive.google.com/uc?id=${item.id}`} alt={item.name} />
          </div>
        ))}

      </div>
    </Canvas>
  );
};

export default GDriveModel;
