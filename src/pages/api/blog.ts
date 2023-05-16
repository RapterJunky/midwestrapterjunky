import type { SeoOrFaviconTag, RegularMetaAttributes } from "react-datocms/seo";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { handleError, type ApiErrorResponse } from "@api/errorHandler";
import { PUBLIC_CACHE_FOR_2H } from "@lib/revaildateTimings";
import PagedArticles from "@query/queries/pagedArticles";
import type { Paginate } from "@type/page";
import { DatoCMS } from "@api/gql";

type Post = {
  slug: string;
  title: string;
  id: string;
  tags: string[];
  seo: SeoOrFaviconTag[];
};
interface DataResponse {
  totalArticles: {
    count: number;
  };
  posts: Post[];
}

const MAX_ITEMS = 5;
const schema = z.coerce.number().gte(0).optional().default(0);

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<Paginate<Post> | ApiErrorResponse>
) {
  try {
    const page = schema.parse(req.query?.page);

    const skip = page * MAX_ITEMS;

    const data = await DatoCMS<DataResponse>(
      {
        query: PagedArticles,
        variables: {
          first: MAX_ITEMS,
          skip,
        },
      },
      {
        draft: req.draftMode || req.preview,
      }
    );

    const posts = data.posts.map((item) => ({
      ...item,
      seo: item.seo.filter(
        (seo) =>
          seo.tag === "meta" &&
          (seo.attributes as RegularMetaAttributes)?.name === "description"
      ),
    }));

    // Two Hour wait
    if (
      !(req.draftMode || req.preview) &&
      process.env.VERCEL_ENV !== "development"
    )
      res.setHeader("Cache-Control", PUBLIC_CACHE_FOR_2H);

    const pageCount = Math.ceil(data.totalArticles.count / MAX_ITEMS);
    const isFirstPage = page === 0;
    const isLastPage = page >= pageCount - 1;

    let previousPage = 0;
    if (page - 1 >= 0) {
      previousPage = page - 1;
    }

    let nextPage = page;
    if (page + 1 < pageCount) {
      nextPage += 1;
    }

    return res.status(200).json({
      result: posts,
      currentPage: page,
      previousPage,
      nextPage,
      pageCount,
      isFirstPage,
      isLastPage,
    });
  } catch (error) {
    return handleError(error, res);
  }
}
