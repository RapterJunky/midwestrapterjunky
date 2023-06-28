import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Tab } from "@headlessui/react";
import { serialize } from "superjson";
import Link from "next/link";

import CategoryCard from "@components/community/CategoryCard";
import TopicsList from "@components/community/TopicsList";
import ExitPreview from "@/components/ui/ExitPreview";
import Footer from "@components/layout/Footer";
import Navbar from "@/components/layout/OldNavbar";
import HiPlus from "@components/icons/HiPlus";
import SiteTags from "@components/SiteTags";

import { REVAILDATE_IN_2H } from "@lib/revaildateTimings";
import genericSeoTags from "@lib/utils/genericSeoTags";
import GenericPageQuery from "@query/queries/generic";
import type { FullPageProps } from "@type/page";
import { fetchCachedQuery } from "@lib/cache";
import prisma from "@api/prisma";

interface Props extends FullPageProps {
  seo: SeoOrFaviconTag[];
  categories: {
    description: string;
    id: number;
    image: string;
    name: string;
    tags: PrismaJson.Tags | null;
    _count: {
      posts: number;
    };
    posts: {
      name: string;
      id: string;
      pinned: boolean;
      locked: boolean;
      createdAt: Date;
    }[];
  }[];
}

export const getStaticProps = async ({
  draftMode,
  preview,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> => {
  const props = await fetchCachedQuery<FullPageProps>(
    "GenericPage",
    GenericPageQuery
  );

  const cat = await prisma.thread.findMany({
    select: {
      description: true,
      id: true,
      image: true,
      name: true,
      tags: true,
      _count: {
        select: {
          posts: true,
        },
      },
      posts: {
        take: 5,
        orderBy: {
          pinned: "desc",
        },
        select: {
          name: true,
          id: true,
          pinned: true,
          locked: true,
          createdAt: true,
        },
      },
    },
  });

  const { json } = serialize(cat);

  return {
    revalidate: REVAILDATE_IN_2H,
    props: {
      ...props,
      categories: json as never as Props["categories"],
      preview: (draftMode || preview) ?? false,
      seo: genericSeoTags({
        title: "Community",
        description: "Midwest Raptor Junkies Community Hub",
        url: "https://midwestraptorjunkies.com/community",
      }),
    },
  };
};

const tab = ["categories", "latest", "top"];

const Community: NextPage<Props> = ({
  _site,
  navbar,
  preview,
  categories,
  seo,
}) => {
  const [index, setIndex] = useState(0);
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      switch (router.query?.tab) {
        case "latest":
          setIndex(1);
          break;
        case "top":
          setIndex(2);
          break;
        default:
          break;
      }
    }
  }, [router.isReady, router.query?.tab]);

  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <Navbar {...navbar} mode="only-scroll" />
      <main className="mt-28 flex flex-1 flex-col items-center">
        <div className="container mb-4 flex max-w-6xl flex-col justify-center px-2">
          <Tab.Group
            selectedIndex={index}
            onChange={(e) => {
              setIndex(e);
              router
                .push({ query: { tab: tab[e] } }, undefined, { shallow: true })
                .catch((e) => console.error(e));
            }}
          >
            <div className="mb-4 flex flex-col justify-between md:flex-row">
              <Tab.List className="flex gap-2 font-bold">
                <Tab className="w-full border-blue-500 ui-selected:border-b-2">
                  <span className="px-2 py-1 hover:text-primary">
                    Categories
                  </span>
                </Tab>
                <Tab className="w-full border-blue-500 ui-selected:border-b-2">
                  <span className="px-2 py-1 hover:text-primary">Latest</span>
                </Tab>
                <Tab className="w-full border-blue-500 ui-selected:border-b-2">
                  <span className="px-2 py-1 hover:text-primary">Top</span>
                </Tab>
              </Tab.List>
              <div className="mt-4 md:mt-0">
                {session.status === "authenticated" ? (
                  <Link data-cy="create-topic"
                    href="/community/create-topic"
                    className="inline-flex w-full items-center justify-center gap-1 rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] ui-disabled:pointer-events-none ui-disabled:opacity-70 md:w-auto"
                  >
                    <HiPlus className="h-4 w-4" />
                    <span>New Topic</span>
                  </Link>
                ) : null}
              </div>
            </div>
            <Tab.Panels>
              <Tab.Panel>
                <table className="mb-8 w-full divide-y-4">
                  <thead>
                    <tr className="text-neutral-600">
                      <th className="px-2 py-3 text-left font-medium md:w-[45%]">
                        Category
                      </th>
                      <th className="hidden w-20 px-2 py-3 text-right font-medium md:table-cell">
                        Topics
                      </th>
                      <th className="hidden px-2 py-3 text-left font-medium md:table-cell">
                        Latest
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2">
                    {categories.map((category, i) => (
                      <CategoryCard
                        key={i}
                        title={category.name}
                        desciption={category.description}
                        image={{ src: category.image, alt: "Category Image" }}
                        tags={category.tags}
                        slug={`/community/c/${category.id}`}
                        topics={category._count.posts}
                        latestTopics={category.posts}
                      />
                    ))}
                    <tr></tr>
                  </tbody>
                </table>
              </Tab.Panel>
              <Tab.Panel>
                <TopicsList sort="latest" />
              </Tab.Panel>
              <Tab.Panel>
                <TopicsList sort="top" />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </main>
      {preview ? <ExitPreview /> : null}
      <Footer />
    </div>
  );
};

export default Community;
