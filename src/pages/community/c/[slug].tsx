import type {
  NextPage,
  GetStaticPropsContext,
  GetStaticPathsResult,
  GetStaticPropsResult,
} from "next";
import type { SeoOrFaviconTag } from "react-datocms/seo";
import type { Thread } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";

import TopicsList from "@components/community/TopicsList";
import genericSeoTags from "@lib/utils/genericSeoTags";
import GenericPageQuery from "@/gql/queries/generic";
import type { FullPageProps } from "@type/page";
import Footer from "@components/layout/Footer";
import Navbar from "@/components/layout/OldNavbar";
import HiPlus from "@components/icons/HiPlus";
import { fetchCachedQuery } from "@lib/cache";
import SiteTags from "@components/SiteTags";
import prisma from "@api/prisma";

interface Props extends FullPageProps {
  seo: SeoOrFaviconTag[];
  category: Thread;
}

export const getStaticPaths = (): GetStaticPathsResult => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async (
  ctx: GetStaticPropsContext,
): Promise<GetStaticPropsResult<Props>> => {
  const result = z.coerce
    .number()
    .min(1)
    .safeParse(ctx.params?.slug);
  if (!result.success)
    return {
      notFound: true,
    };

  const category = await prisma.thread.findUnique({
    where: {
      id: result.data,
    },
  });

  if (!category)
    return {
      notFound: true,
    };

  const props = await fetchCachedQuery<FullPageProps>(
    "GenericPage",
    GenericPageQuery,
  );

  return {
    props: {
      ...props,
      category,
      preview: (ctx.draftMode || ctx.preview) ?? false,
      seo: genericSeoTags({
        title: category.name,
        description: category.description,
        url: `https://midwestraptorjunkies.com/community/c/${category.id}`,
      }),
    },
  };
};

const CategoryPage: NextPage<Props> = ({ _site, navbar, seo, category }) => {
  return (
    <div className="flex h-full flex-col">
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <Navbar {...navbar} mode="only-scroll" />
      <main className="mt-28 flex flex-1 flex-col items-center">
        <div className="container mb-4 flex max-w-6xl flex-col justify-center px-2">
          <div className="mb-4 flex justify-between border-b pb-2">
            <h1 className="text-4xl font-bold">{category.name}</h1>
            <Link
              href="/community/create-topic"
              className="inline-flex w-full items-center justify-center gap-1 rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 ui-active:bg-primary-700 ui-active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] ui-disabled:pointer-events-none ui-disabled:opacity-70 md:w-auto"
            >
              <HiPlus className="h-4 w-4" />
              <span>New Topic</span>
            </Link>
          </div>
          <section className="flex flex-col items-center gap-4 md:flex-row">
            <div>
              <Image
                className="rounded-full"
                src={category.image}
                alt="category"
                height={150}
                width={150}
              />
            </div>
            <p className="text-xl">{category.description}</p>
          </section>
          <TopicsList
            sort="top"
            mode="category"
            categoryId={category.id.toString()}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
