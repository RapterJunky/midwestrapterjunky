import { Skeleton } from "@/components/ui/skeleton";

const CatalogFallback: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="z-0 shadow animate-in fade-in">
        <div className="relative h-56 w-full">
          <Skeleton className="h-full w-full" />
          <div className="p-2">
            <Skeleton className="mb-2 h-6 w-44" />
            <Skeleton className="h-4 w-20" />
            <div className="mt-4 flex w-full justify-end">
              <Skeleton className="h-6 w-11" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogFallback;
