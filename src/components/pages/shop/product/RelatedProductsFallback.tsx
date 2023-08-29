import { Skeleton } from "@/components/ui/skeleton";

const RelatedProductsFallback: React.FC = () => {
    return (
        <>
            <div className="border border-zinc-200 bg-zinc-100 shadow">
                <div className="relative box-border inline-block h-full max-h-full w-full cursor-pointer overflow-hidden bg-gray-100 transition-transform animate-in fade-in">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden">
                        <Skeleton className="h-[540px] w-[540px]" />
                    </div>
                </div>
                <div className="flex w-full justify-between">
                    <Skeleton />
                    <Skeleton />
                </div>
            </div>
            <div className="border border-zinc-200 bg-zinc-100 shadow">
                <div className="relative box-border inline-block h-full max-h-full w-full cursor-pointer overflow-hidden bg-gray-100 transition-transform animate-in fade-in">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden">
                        <Skeleton className="h-[540px] w-[540px]" />
                    </div>
                </div>
                <div className="flex w-full justify-between">
                    <Skeleton />
                    <Skeleton />
                </div>
            </div>
            <div className="border border-zinc-200 bg-zinc-100 shadow">
                <div className="relative box-border inline-block h-full max-h-full w-full cursor-pointer overflow-hidden bg-gray-100 transition-transform animate-in fade-in">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden">
                        <Skeleton className="h-[540px] w-[540px]" />
                    </div>
                </div>
                <div className="flex w-full justify-between">
                    <Skeleton />
                    <Skeleton />
                </div>
            </div>
            <div className="border border-zinc-200 bg-zinc-100 shadow">
                <div className="relative box-border inline-block h-full max-h-full w-full cursor-pointer overflow-hidden bg-gray-100 transition-transform animate-in fade-in">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden">
                        <Skeleton className="h-[540px] w-[540px]" />
                    </div>
                </div>
                <div className="flex w-full justify-between">
                    <Skeleton />
                    <Skeleton />
                </div>
            </div>
        </>
    );
}
export default RelatedProductsFallback;