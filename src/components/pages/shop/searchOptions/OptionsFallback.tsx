import { Skeleton } from "@/components/ui/skeleton";

const FallBackOptions: React.FC = () => {
    return (
        <div className="relative inline-block w-full">
            <div className="mt-3 lg:hidden">
                <Skeleton className="w-full h-10 block px-4 py-2 lg:mx-4 lg:my-2 lg:inline-block lg:p-0" />
            </div>
            <div className="absolute left-0 z-10 mb-10 mt-2 hidden w-full origin-top-left rounded-md shadow-lg lg:relative lg:block lg:shadow-none">
                <div className="shadow-xs rounded-sm bg-white lg:bg-none lg:shadow-none">
                    <div>
                        <ul>
                            <li>
                                <Skeleton className="w-full max-w-[116px] h-6 block px-4 py-2 lg:mx-4 lg:my-2 lg:inline-block lg:p-0" />
                            </li>
                            <li>
                                <Skeleton className="w-full max-w-[94px] h-4 block px-4 py-2 lg:mx-4 lg:my-2 lg:inline-block lg:p-0" />
                            </li>
                            <li>
                                <Skeleton className="w-full max-w-[94px] h-4 block px-4 py-2 lg:mx-4 lg:my-2 lg:inline-block lg:p-0" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FallBackOptions;