const TopicTable: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <table className="w-full mt-4 divide-y-2">
            <thead>
                <tr className="text-neutral-600">
                    <th className="w-3/4 text-left py-2 pl-2 font-medium">Topic</th>
                    <th className="py-2 font-medium">Replies</th>
                    <th className="py-2 font-medium">Activity</th>
                </tr>
            </thead>
            {children}
        </table>
    );
}

export default TopicTable;