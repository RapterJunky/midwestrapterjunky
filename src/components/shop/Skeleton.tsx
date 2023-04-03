const Skeleton: React.FC = () => {
    return (
        <div className="animate-in fade-in shadow">
            <div className="relative w-full h-56 animate-pulse">
                <span className="inline-block h-full min-h-[1em] w-full flex-auto cursor-wait bg-gray-700 align-middle text-base opacity-50 text-neutral-50"></span>
            </div>
            <div className="p-2">
                <h1 className="font-bold">
                    <span className="inline-block min-h-[1em] w-full flex-auto cursor-wait bg-gray-700 align-middle text-base opacity-50 text-neutral-50"></span>
                </h1>
                <span className="text-xs text-gray-800">
                    <span className="inline-block min-h-[1em] w-full flex-auto cursor-wait bg-gray-700 align-middle text-base opacity-50 text-neutral-50"></span>
                </span>
                <div className='w-full flex justify-between mt-4'>
                    <div className="hover:text-gray-600 text-gray-700">
                        <span className="inline-block min-h-[1em] w-full flex-auto cursor-wait bg-gray-700 align-middle text-base opacity-50 text-neutral-50"></span>
                    </div>
                    <span className="inline-block min-h-[1em] w-full flex-auto cursor-wait bg-gray-700 align-middle text-base opacity-50 text-neutral-50"></span>
                </div>
            </div>
        </div>
    );
}

export default Skeleton;