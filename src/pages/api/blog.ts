import type { NextApiRequest, NextApiResponse } from "next";
import type { SeoOrFaviconTag, RegularMetaAttributes } from "react-datocms/seo";
import createHttpError from "http-errors";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { logger } from "@lib/logger";
import { DatoCMS } from "@api/gql";
import PagedArticles from "@query/queries/pagedArticles";
import { PUBLIC_CACHE_FOR_2H } from "@lib/revaildateTimings";

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
const schema = z.string().transform((value, ctx) => {
  const parsed = parseInt(value);
  if (isNaN(parsed)) return z.NEVER;
  return z.number().gte(0).parse(parsed);
});

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
  } catch (error: any) {
    if (error instanceof ZodError) {
      const output = fromZodError(error);
      const br = createHttpError.BadRequest();
      logger.error(output, output.message);
      return res
        .status(br.statusCode)
        .json({ message: br.message, details: output.details });
    }

    logger.error(error, error?.message);
    const ie = createHttpError.InternalServerError();
    return res.status(ie.statusCode).json(ie);
  }
}
