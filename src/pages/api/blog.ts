import type { SeoOrFaviconTag, RegularMetaAttributes } from "react-datocms/seo";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { PUBLIC_CACHE_FOR_2H } from "@lib/revaildateTimings";
import PagedArticles from "@query/queries/pagedArticles";
import { handleError } from "@api/errorHandler";
import { DatoCMS } from "@api/gql";

interface DataResponse {
  totalArticles: {
    count: number;
  };
  posts: {
    slug: string;
    title: string;
    id: string;
    tags: string[];
    seo: SeoOrFaviconTag[];
  }[];
}

interface ErrorResponse {
  message: string;
  details?: any;
}

const MAX_ITEMS = 5;
const schema = z.coerce.number().positive().min(1).optional().default(1);

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<DataResponse | ErrorResponse>
) {
  try {
    const page = schema.parse(req.query?.page ?? "0");

    const current = page * MAX_ITEMS;

    const data = await DatoCMS<DataResponse>(PagedArticles, {
      preview: req.preview,
      variables: {
        first: 5,
        skip: current,
      },
    });

    const posts = data.posts.map((item) => ({
      ...item,
      seo: item.seo.filter(
        (seo) =>
          seo.tag === "meta" &&
          (seo.attributes as RegularMetaAttributes)?.name === "description"
      ),
    }));

    // Two Hour wait
    if (!req.preview || process.env.VERCEL_ENV !== "development")
      res.setHeader("Cache-Control", PUBLIC_CACHE_FOR_2H);
    return res.status(200).json({ posts, totalArticles: data.totalArticles });
  } catch (error) {
    return handleError(error, res);
  }
}
