import TopicEditor from "@/components/pages/community/TopicEditor";
import SessionProvider from "@/components/providers/SessionProvider";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import getCategoriesIds from "@/lib/services/community/getCategoriesIds";

const TopicPage: React.FC = async () => {

    const ids = await getCategoriesIds();

    return (
        <>
            <Separator />
            <div className="h-full flex-col md:flex">
                <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
                    <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">Topic Editor</h2>
                </div>
                <div className="flex-1">
                    <div className="container h-full py-6">
                        <SessionProvider>
                            <TopicEditor defaultCategory={ids.at(0)?.id.toString() ?? "1"}>
                                <SelectContent>
                                    {ids.map((value, i) => (
                                        <SelectItem key={i} value={value.id.toString()}>{value.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </TopicEditor>
                        </SessionProvider>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TopicPage;