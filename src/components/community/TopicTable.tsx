const TopicTable: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <table className="mt-4 w-full divide-y-2">
      <thead>
        <tr className="text-neutral-600">
          <th className="w-3/4 py-2 pl-2 text-left font-medium">Topic</th>
          <th className="py-2 font-medium">Replies</th>
          <th className="py-2 font-medium">Activity</th>
        </tr>
      </thead>
      {children}
    </table>
  );
};

export default TopicTable;
