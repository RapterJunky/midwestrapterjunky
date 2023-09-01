import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import getCategories from "@/lib/services/community/getCategories";
import CategoryCard from "@/components/community/CategoryCard";
import CommunityPosts from "@/components/pages/community/CommunityPosts";

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
                                {categories.map((category, i) => (
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
                                ))}
                                <tr></tr>
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
}

export default Community;