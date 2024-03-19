import { Plus } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import PaginateCategoryPosts from "@/components/pages/community/PaginateCategoryPosts";
import { Button } from "@/components/ui/button";
import getSeoTags from "@/lib/helpers/getSeoTags";
import getCategory from "@/lib/services/community/getCategory";

type PageParams = {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { id: string };
};

export async function generateMetadata(
  { params }: PageParams,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const result = idSchema.safeParse(params.id);
  if (!result.success)
    return getSeoTags({
      parent,
      seo: {
        title: "Not Found",
        robots: false,
        description: "Given id is invaild",
      },
    });
  const category = await getCategory(result.data);
  if (!category)
    return getSeoTags({
      parent,
      seo: {
        title: "Not Found",
        robots: false,
        description:
          "Midwest Raptor Junkies does not have a category with given id",
      },
    });

  return getSeoTags({
    parent,
    seo: {
      title: category.name,
      robots: true,
      description: "Midwest Raptor Junkies community page",
      slug: `/community/category/${params.id}`,
    },
  });
}

const pageSchema = z.coerce.number().min(1).default(1);
const idSchema = z.coerce.number().min(1);

const CategoryPage: React.FC<PageParams> = async ({ searchParams, params }) => {
  const result = idSchema.safeParse(params.id);

  if (!result.success) notFound();

  const category = await getCategory(result.data);
  if (!category) notFound();

  const page = pageSchema.safeParse(searchParams["page"]);

  return (
    <div className="mt-28 flex flex-1 flex-col items-center">
      <div className="container mb-4 flex max-w-6xl flex-col justify-center px-2">
        <div className="mb-4 flex justify-between border-b pb-2">
          <h1 className="text-4xl font-bold">{category.name}</h1>
          <Button asChild>
            <Link href={`/community/topic?category=${params.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              New Topic
            </Link>
          </Button>
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
        <PaginateCategoryPosts
          category={result.data}
          page={page.success ? page.data : 1}
        />
      </div>
    </div>
  );
};

export default CategoryPage;
