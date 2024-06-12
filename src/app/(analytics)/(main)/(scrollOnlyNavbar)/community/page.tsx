import type { Metadata, ResolvingMetadata } from "next";
import CategoryCard from "@/components/community/CategoryCard";
import CommunityPosts from "@/components/pages/community/CommunityPosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import getSeoTags from "@/lib/helpers/getSeoTags";
import getCategories from "@/lib/services/community/getCategories";

export async function generateMetadata(
  { },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return getSeoTags({
    parent,
    seo: {
      title: "Community",
      robots: true,
      description: "Midwest Raptor Junkies community page",
      slug: "/community",
    },
  });
}

const Community: React.FC = async () => {
  const categories = await getCategories();

  return (
    <div className="mt-28 flex flex-1 flex-col items-center">
      <div className="container mb-4 flex max-w-6xl flex-col justify-center px-2">
        <Tabs defaultValue="categories">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="top">Top</TabsTrigger>
          </TabsList>
          <TabsContent value="categories">
            <table className="mb-8 w-full divide-y">
              <thead>
                <tr className="text-zinc-600">
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
              <tbody className="divide-y">
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="w-full text-center text-neutral-600"
                    >
                      <div className="mt-4 p-2">Theres nothing here yet.</div>
                    </td>
                  </tr>
                ) : (
                  categories.map((category, i) => (
                    <CategoryCard
                      key={i}
                      title={category.name}
                      desciption={category.description}
                      image={{ src: category.image, alt: "Category Image" }}
                      tags={category.tags as string[]}
                      slug={`/community/category/${category.id}`}
                      topics={category._count.posts}
                      latestTopics={category.posts}
                    />
                  ))
                )}
              </tbody>
            </table>
          </TabsContent>
          <TabsContent value="latest">
            <CommunityPosts type="latest" />
          </TabsContent>
          <TabsContent value="top">
            <CommunityPosts type="top" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
