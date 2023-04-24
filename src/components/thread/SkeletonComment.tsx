const SkeletonComment: React.FC = () => {
    return (
        <li className="animate-pulse flex w-full gap-1 py-2">
            <div>
                <span className="inline-block h-9 w-9 rounded-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2 justify-between mb-1">
                    <span className="inline-block h-4 w-36 cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
                    <span className="inline-block h-4 w-36 cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
                </div>
                <span className="inline-block h-28 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
            </div>
        </li>
    );
}

export default SkeletonComment;