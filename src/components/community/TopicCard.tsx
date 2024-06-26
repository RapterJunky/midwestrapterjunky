import { Badge } from "../ui/badge";
import { Lock, Pin } from "lucide-react";
import Link from "next/link";
import toRelativeTime from "@/lib/utils/toRelativeTime";

type Props = {
  title: string;
  slug: string;
  tags: string[];
  description: string;
  replies: number;
  activity: Date | undefined | string;
  pinned: boolean;
  locked: boolean;
};

const TopicCard: React.FC<Props> = ({
  locked,
  pinned,
  activity,
  title,
  slug,
  tags,
  description,
  replies,
}) => {
  return (
    <tr>
      <td>
        <div className="p-2">
          <Link href={slug}>
            <h3 className="mb-2 flex scroll-m-20 items-center gap-1 text-2xl font-semibold tracking-tight">
              {locked ? <Lock className="text-zinc-400" /> : null}
              {pinned ? <Pin className="text-zinc-400" /> : null}
              <span className="text-blue-500 underline hover:text-blue-400">
                {title}
              </span>
            </h3>
          </Link>
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <Badge key={i}>{tag}</Badge>
            ))}
          </div>
          <p className="line-clamp-4 overflow-hidden text-base text-zinc-500">
            {description}
          </p>
        </div>
      </td>
      <td className="text-center">{replies}</td>
      <td className="text-center">
        {activity ? toRelativeTime(activity) : "No Activity"}
      </td>
    </tr>
  );
};

export default TopicCard;
