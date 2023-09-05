import { Skeleton } from "@/components/ui/skeleton";

const SkeletionComment: React.FC = () => {
    return (
        <li className="w-full py-2">
            <div className="flex w-full gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col w-full gap-10">
                    <div className="flex justify-between">
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-6 w-44" />
                    </div>
                    <Skeleton />
                    <div className="flex justify-end">
                        <Skeleton className="h-8 w-14" />
                    </div>
                </div>
            </div>
        </li>
    );
}

export default SkeletionComment;