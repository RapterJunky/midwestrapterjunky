import { Skeleton } from "@/components/ui/skeleton";

const ShoppingCartItemSkeleton: React.FC = () => {
  return (
    <li className="flex flex-col pb-2">
      <div className="flex space-x-4 py-4">
        <Skeleton className="h-16 w-16" />
        <div className="flex w-full flex-col">
          <Skeleton className="mb-1 h-6 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="flex h-10 gap-1">
        <Skeleton className="w-16" />
        <Skeleton className="w-full" />
        <Skeleton className="w-16" />
        <Skeleton className="w-16" />
      </div>
    </li>
  );
};

export default ShoppingCartItemSkeleton;
