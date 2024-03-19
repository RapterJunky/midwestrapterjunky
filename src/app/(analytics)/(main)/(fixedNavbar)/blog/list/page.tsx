import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import ListPagination from "@/components/pages/blog/ListPagination";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PagedArticles, {
  type PagedArticlesQueryResult,
} from "@/gql/queries/pagedArticles";
import getSeoTags from "@/lib/helpers/getSeoTags";
import { REVAILDATE_IN_2H } from "@/lib/revaildateTimings";
import getPageQuery from "@/lib/services/GetPageQuery";
import { getDescriptionTag } from "@/lib/utils/description";
import { formatLocalDate } from "@/lib/utils/timeFormat";

type PageParams = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return getSeoTags({
    parent,
    seo: {
      title: "Articles List",
      robots: true,
      description: "Midwest Raptor Junkies articles list page",
      slug: `/blog/list`,
    },
  });
}

const MAX_ITEMS = 5;

const BlogList: React.FC<PageParams> = async ({ searchParams }) => {
  const page = Number(searchParams["page"] ?? "1");

  const skip = (page - 1) * MAX_ITEMS;

  const { totalArticles, posts } = await getPageQuery<PagedArticlesQueryResult>(
    PagedArticles,
    {
      variables: {
        first: MAX_ITEMS,
        skip,
      },
      revalidate: {
        revalidate: REVAILDATE_IN_2H,
      },
    },
  );

  const pageCount = Math.ceil(totalArticles.count / MAX_ITEMS);

  return (
    <>
      <Separator />
      <div className="flex flex-grow flex-col items-center px-4">
        <div className="w-full max-w-3xl flex-1 divide-y divide-zinc-200">
          <div className="space-y-2 pb-4 pt-6 sm:pb-8 md:space-y-5 md:pb-6">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              All Articles
            </h1>
          </div>
          <ul>
            {!posts || !posts.length ? (
              <li>No posts found.</li>
            ) : (
              posts.map((post) => (
                <li key={post.id} className="py-4">
                  <article>
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-xs font-medium leading-6 text-zinc-500">
                        <time dateTime={post.publishedAt ?? ""}>
                          {formatLocalDate(post.publishedAt)}
                        </time>
                      </dd>
                    </dl>
                    <div className="xl:col-span-3">
                      <div>
                        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="text-zinc-900"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        <div className="flex flex-wrap gap-1 py-1">
                          {post.tags.map((tag, i) => (
                            <Badge variant="secondary" key={i}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <summary className="leading-7 text-zinc-500 [&:not(:first-child)]:mt-6">
                        {getDescriptionTag(post.seo)}
                      </summary>
                    </div>
                  </article>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="w-full max-w-3xl space-y-2 pb-8 pt-6 md:space-y-5">
          <nav className="flex justify-between">
            <ListPagination
              pageCount={pageCount}
              hasNextPage={skip + MAX_ITEMS < totalArticles.count}
              hasPrevPage={skip > 0}
            />
          </nav>
        </div>
      </div>
    </>
  );
};

export default BlogList;
