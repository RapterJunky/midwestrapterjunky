import type { SeoOrFaviconTag } from 'react-datocms/seo';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from "next/link";

import getGenericSeoTags from '@/lib/helpers/getGenericSeoTags';
import { getDescriptionTag } from '@/lib/utils/description';
import { REVAILDATE_IN_2H } from '@/lib/revaildateTimings';
import { formatLocalDate } from '@/lib/utils/timeFormat';
import QueryBlogLatest from '@/gql/queries/blogLatest';
import { Separator } from '@/components/ui/separator';
import getPageQuery from '@/lib/cache/GetPageQuery';
import type { FullPageProps } from '@/types/page';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PageProps extends FullPageProps {
    seo: SeoOrFaviconTag[];
    posts: {
        slug: string;
        publishedAt: string | null;
        title: string;
        seo: SeoOrFaviconTag[];
        tags: string[];
    }[];
}

export const metadata: Metadata = getGenericSeoTags({
    title: 'Lastest Articles',
    description: "Midwest Raptor Junkies latest published articles.",
    url: "https://midwestraptorjunkies.com/blog"
});

const MAX_DISPLAY = 5;

const Blog: React.FC = async () => {
    const { posts } = await getPageQuery<PageProps>(QueryBlogLatest, {
        variables: {
            first: MAX_DISPLAY
        },
        revalidate: REVAILDATE_IN_2H
    });

    return (
        <>
            <Separator />
            <div className="mx-auto max-w-3xl flex-1 px-4 sm:px-6 xl:max-w-5xl xl:px-0">
                <div className="divide-y divide-zinc-200">
                    <div className="space-y-2 pb-8 pt-6 md:space-y-5">
                        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                            Latest
                        </h1>
                        <p className="leading-7 [&:not(:first-child)]:mt-6">
                            The lastest articles are here.
                        </p>
                    </div>
                    <ul className="divide-y divide-zinc-200">
                        {!posts.length ? "No posts found." : null}
                        {posts.map((post) => (
                            <li key={post.slug} className="py-12">
                                <article>
                                    <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                                        <dl>
                                            <dt className="sr-only">Published on</dt>
                                            <dd className="text-sm text-zinc-500 leading-6">
                                                <time dateTime={post?.publishedAt ?? ""}>
                                                    {formatLocalDate(post?.publishedAt)}
                                                </time>
                                            </dd>
                                        </dl>
                                        <div className="xl:col-span-3">
                                            <div>
                                                <div>
                                                    <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                                                        <Link
                                                            href={`/blog/${post.slug}`}
                                                            className="text-zinc-900"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                    </h2>
                                                    <div className="flex flex-wrap py-1 gap-1">
                                                        {post.tags.map((tag, i) => (
                                                            <Badge variant="secondary" key={i}>{tag}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <summary className="prose max-w-none text-zinc-500 leading-7 my-4">
                                                    {getDescriptionTag(post.seo)}
                                                </summary>
                                            </div>
                                            <div className="flex justify-end">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link
                                                        href={`/blog/${post.slug}`}

                                                        aria-label={`Read "${post.title}"`}
                                                    >
                                                        Continue reading <ArrowRight className="ml-2" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>
                </div>
                <Separator className="mb-4" />
                <div className="mb-4 flex justify-center text-base font-medium leading-6">
                    <Button asChild size="sm" className="w-1/3">
                        <Link
                            href="/blog/list"
                            aria-label="all posts"
                        >
                            View All Posts
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

export default Blog;