const TopicCardSkeletion: React.FC = () => {
    return (
        <tr className="animate-pulse">
            <td>
                <div className="p-2">
                    <div>
                        <h3 className="mb-2 flex items-center gap-1">
                            <span className="inline-block min-h-[1.5em] w-1/3 cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
                        </h3>
                    </div>
                    <div className="flex gap-2 mb-2">
                        <span className="inline-block rounded-sm min-h-[1.4em] w-9 cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
                        <span className="inline-block rounded-sm min-h-[1.4em] w-9 cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
                    </div>
                    <p className="overflow-hidden">
                        <span className="inline-block min-h-[2.5em] w-3/4 cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
                    </p>
                </div>
            </td>
            <td className="text-center">
                <span className="inline-block min-h-[1em] w-1/2 cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
            </td>
            <td className="text-center">
                <span className="inline-block min-h-[1em] w-2/4 cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
            </td>
        </tr>
    )
}

export default TopicCardSkeletion;