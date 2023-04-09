import type {
  GetStaticPropsResult,
  GetStaticPropsContext,
  NextPage,
} from "next";
import Link from "next/link";
import type { FullPageProps } from "types/page";

import SiteTags from "@components/SiteTags";
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import ExitPreview from "@components/ExitPreview";

import prisma, { type Thread } from "@api/prisma";

import GenericPageQuery from "@query/queries/generic";
import { fetchCachedQuery } from "@lib/cache";

interface Props extends FullPageProps {
  threads: Thread[];
}

export const getStaticProps = async (
  ctx: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> => {
  const [props, threads] = await Promise.all([
    fetchCachedQuery<Omit<Props, "threads">>("GenericPage", GenericPageQuery),
    prisma.thread.findMany(),
  ]);

  return {
    props: {
      ...props,
      threads,
      preview: ctx?.preview ?? false,
    },
  };
};

const Threads: NextPage<Props> = ({ threads, preview, _site, navbar }) => {
  return (
    <div className="flex h-full flex-col">
      <SiteTags
        tags={[
          _site.faviconMetaTags,
          [{ tag: "title", content: "Forms  - Midwest Raptor Junkies" }],
        ]}
      />
      <header>
        <Navbar {...navbar} mode="none" />
      </header>
      <main className="flex flex-1 flex-col items-center">
        <div className="container sm:px-6">
          <div className="my-6">
            <h1 className="text-4xl font-bold">Threads</h1>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {threads.map((value) => (
              <Link
                key={value.id}
                className="flex h-max justify-between rounded-sm border p-2"
                href={{
                  pathname: "/threads/[thread]",
                  query: { thread: value.id },
                }}
              >
                <div>
                  <h1 className="font-bold text-gray-800">{value.name}</h1>
                  <span className="text-xs text-gray-500">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Consequuntur, sit quo?
                  </span>
                </div>
                <button
                  type="button"
                  className="inline-block rounded bg-primary px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                >
                  View
                </button>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      {preview ? <ExitPreview /> : null}
    </div>
  );
};

export default Threads;
