import { Skeleton } from "@/components/ui/skeleton";

const ShoppingCartItemSkeleton: React.FC = () => {
    return (
        <li className="pb-2 flex flex-col">
            <div className="flex space-x-4 py-4">
                <Skeleton className="h-16 w-16" />
                <div className="flex flex-col w-full">
                    <Skeleton className="h-6 w-20 mb-1" />
                    <Skeleton className="h-4 w-14" />
                </div>
                <Skeleton className="h-4 w-14" />
            </div>
            <div className="flex gap-1 h-10">
                <Skeleton className="w-16" />
                <Skeleton className="w-full" />
                <Skeleton className="w-16" />
                <Skeleton className="w-16" />
            </div>
        </li>
    );
}

export default ShoppingCartItemSkeleton;