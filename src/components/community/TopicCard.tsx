import { HiLockClosed } from "react-icons/hi2";
import { FaThumbtack } from "react-icons/fa";
import Link from "next/link";

import TagList from "@components/community/TagList";
import useRelativeTime from "@hook/useRelativeTime";

type Props = {
  title: string;
  slug: string;
  tags: string[];
  description: string;
  replies: number;
  activity: string | undefined;
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
  const format = useRelativeTime();
  return (
    <tr>
      <td>
        <div className="p-2">
          <Link href={slug}>
            <h3 className="mb-2 flex items-center gap-1 text-base font-bold md:text-lg">
              {locked ? <HiLockClosed className="text-neutral-400" /> : null}
              {pinned ? <FaThumbtack className="text-neutral-400" /> : null}
              <span>{title}</span>
            </h3>
          </Link>
          <TagList tags={tags} />
          <p className="line-clamp-4 overflow-hidden text-base text-neutral-500">
            {description}
          </p>
        </div>
      </td>
      <td className="text-center">{replies}</td>
      <td className="text-center">
        {activity ? format(activity) : "No Activity"}
      </td>
    </tr>
  );
};

export default TopicCard;
