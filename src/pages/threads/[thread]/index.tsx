import type {
  GetStaticPropsResult,
  GetStaticPropsContext,
  NextPage,
  GetStaticPathsResult,
} from "next";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { z } from "zod";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import type { FullPageProps, Paginate } from "types/page";

import SiteTags from "@components/SiteTags";
import Navbar from "@components/layout/Navbar";
import ExitPreview from "@components/ExitPreview";
import Footer from "@components/layout/Footer";

import prisma, { type ThreadPost, type Thread, type User } from "@api/prisma";
import GenericPageQuery from "@query/queries/generic";
import { fetchCachedQuery } from "@lib/cache";
import { logger } from "@lib/logger";

interface Props extends FullPageProps {
  thread: Thread;
}

export const getStaticPaths = (): GetStaticPathsResult => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
  try {
    const id = z.coerce.number().positive().min(1).parse(ctx.params?.thread);
    const [thread, props] = await Promise.all([
      prisma.thread.findUniqueOrThrow({
        where: {
          id,
        },
      }),
      fetchCachedQuery<Props>("GenericPage", GenericPageQuery),
    ]);

    return {
      props: {
        ...props,
        thread,
        preview: ctx?.preview ?? false,
      },
    };
  } catch (error) {
    logger.error(error, "Failed to get posts page");
    return {
      notFound: true,
    };
  }
};

const Thread: NextPage<Props> = ({ _site, navbar, preview, thread }) => {
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [debouncedQuery] = useDebounce(query, 1000);
  const { data, isLoading, error } = useSWR<
    Paginate<ThreadPost & { owner: User }>,
    Response,
    string
  >(
    `/api/threads/post?thread=${
      thread.id
    }&page=${page}&search=${encodeURIComponent(debouncedQuery)}`,
    (url) => fetch(url).then((value) => value.json())
  );

  return (
    <div className="flex h-full flex-col">
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          [
            {
              tag: "title",
              content: `Thread ${thread.name} - Midwest Raptor Junkies`,
            },
          ],
        ]}
      />
      <header>
        <Navbar {...navbar} mode="none" />
      </header>
      <main className="flex flex-1 flex-col items-center gap-2">
        <div className="container flex flex-1 flex-col sm:px-6">
          <div className="mt-6 flex w-full justify-start">
            <h1 className="text-4xl font-bold">Thread - {thread.name}</h1>
          </div>
          <div className="mt-4 flex w-full flex-col justify-between gap-2 p-2 sm:flex-row">
            <input
              onChange={(ev) => setQuery(ev.target.value)}
              value={query}
              type="text"
              className="form-input mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Search"
            />
            <Link
              href={{
                pathname: "/threads/[thread]/new",
                query: { thread: thread.id },
              }}
              className="flex items-center justify-center rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
            >
              Create Post
            </Link>
          </div>
          <div className="mt-4 flex flex-1 flex-col gap-4">
            <hr className="w-full" />
            {!isLoading && error ? (
              <div>
                <h2 className="text-md text-center">
                  There was an error loading posts!
                </h2>
              </div>
            ) : null}

            {isLoading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="mx-auto flex w-full rounded-sm border-2 p-4 animate-in fade-in-20"
                  >
                    <div className="flex h-full animate-pulse flex-row items-center justify-center space-x-5">
                      <div className="flex flex-col gap-2">
                        <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                        <span className="h-3 w-12 rounded-md bg-gray-300"></span>
                      </div>
                      <div className="flex flex-col space-y-3">
                        <div className="h-6 w-36 rounded-md bg-gray-300"></div>
                        <div className="h-6 w-24 rounded-md bg-gray-300"></div>
                      </div>
                    </div>
                  </div>
                ))
              : null}

            {!isLoading && data && data?.result.length
              ? data.result.map((value) => (
                  <div
                    key={value.id}
                    className="mx-auto flex w-full flex-col items-center justify-between rounded-sm border-2 p-4 animate-in fade-in-20 sm:flex-row"
                  >
                    <div className="flex h-full flex-row items-center justify-center space-x-5">
                      <div className="flex flex-col items-center gap-1">
                        <Image
                          height={48}
                          width={48}
                          className="h-12 w-12 rounded-full"
                          src={value.owner?.image ?? ""}
                          alt="avatar"
                        />
                        <span className="h-3 rounded-md text-sm">
                          {value.owner.name}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-3">
                        <Link
                          href={{
                            pathname: "/threads/[thread]/post/[id]",
                            query: { thread: thread.id, id: value.id },
                          }}
                          className="h-6 rounded-md text-2xl font-bold underline"
                        >
                          {value.name}
                        </Link>
                        <div className="h-6 rounded-md text-sm text-gray-600">
                          {new Date(value.created).toLocaleDateString("en-us", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : null}

            {!isLoading && data && !data.result.length ? (
              <div className="mx-auto flex w-full flex-col items-center justify-center rounded-md border-2 p-4 animate-in fade-in-20 sm:flex-row">
                <div className="flex h-full flex-row items-center justify-center space-x-5">
                  <h1 className="font-bold">No Posts where found!</h1>
                </div>
              </div>
            ) : null}

            <div className="mt-auto mb-10 flex items-center justify-evenly">
              <button
                onClick={() => setPage(data?.previousPage ?? 1)}
                disabled={isLoading || data?.isFirstPage}
                type="button"
                className="inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
              >
                Prev
              </button>

              <div>
                {data?.currentPage ?? 0} of {data?.currentPage ?? 0}
              </div>

              <button
                onClick={() => setPage(data?.nextPage ?? 1)}
                disabled={isLoading || data?.isLastPage}
                type="button"
                className="inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default Thread;
