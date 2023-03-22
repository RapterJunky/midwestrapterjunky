import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Button, Spinner } from "datocms-react-ui";
import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { FaPlus } from "react-icons/fa";
import type { Paginate } from "types/page";
import type { Authors } from "@api/prisma";
import { AuthFetch } from "@lib/utils/plugin/auth_fetch";

const Select = ({ ctx }: { ctx: RenderModalCtx }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useSWR([page], async ([index]) => {
    const result = await AuthFetch(`/api/plugin/authors?page=${index}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return result.json() as Promise<Paginate<Authors>>;
  });

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center p-5">
        <Spinner size={50} />
      </div>
    );
  }

  if ((!data && !isLoading) || error) {
    return (
      <div className="flex w-full flex-col items-center justify-center p-5">
        <span>There was an error, when trying to fetch authors.</span>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex h-full flex-wrap items-start justify-start gap-2">
        {data?.result.map((value) => (
          <div
            className="group relative rounded-sm p-2 outline outline-1 outline-gray-200"
            key={value.id}
          >
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
            <button
              className="absolute right-0 top-0 hidden h-full w-full items-center justify-center gap-1 rounded bg-gray-200 bg-opacity-90 group-hover:flex"
              onClick={() => ctx.resolve(value)}
            >
              <FaPlus className="h-8 w-8" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Button
          disabled={data?.isFirstPage}
          onClick={() => setPage(data?.previousPage ?? 1)}
        >
          Prev
        </Button>
        <span style={{ color: "var(--primary-color)" }}>
          {data?.currentPage} of {(data?.pageCount ?? 0) + 1}
        </span>
        <Button
          disabled={data?.isLastPage}
          onClick={() => setPage(data?.nextPage ?? 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Select;
