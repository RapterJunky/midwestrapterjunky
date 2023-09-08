import { Skeleton } from "../ui/skeleton";

const TopicCardSkeletion: React.FC = () => {
  return (
    <tr className="animate-pulse">
      <td>
        <div className="p-2">
          <div>
            <h3 className="mb-2 flex items-center gap-1">
              <Skeleton className="min-h-[1.5em] w-1/3" />
            </h3>
          </div>
          <div className="mb-2 flex gap-2">
            <Skeleton className="min-h-[1.4em] w-9" />
            <Skeleton className="min-h-[1.4em] w-9" />
          </div>
          <p className="overflow-hidden">
            <Skeleton className="min-h-[2.5em] w-3/4" />
          </p>
        </div>
      </td>
      <td className="text-center">
        <Skeleton className="min-h-[1em] w-1/2" />
      </td>
      <td className="text-center">
        <Skeleton className="min-h-[1em] w-2/4" />
      </td>
    </tr>
  );
};

export default TopicCardSkeletion;
