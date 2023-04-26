import { HiLockClosed } from "react-icons/hi";
import { FaThumbtack } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import TagList from "./TagList";

type Props = {
  title: string;
  slug: string;
  desciption: string;
  image: {
    alt: string;
    src: string;
  };
  tags: PrismaJson.Tags | null;
  topics: number;
  latestTopics: {
    name: string;
    id: string;
    pinned: boolean;
    locked: boolean;
    created: Date;
  }[];
};

const CategoryCard: React.FC<Props> = ({
  slug,
  desciption,
  title,
  image,
  tags,
  topics,
  latestTopics,
}) => {
  return (
    <tr className="flex w-full flex-col md:table-row">
      <td className="px-2 py-3">
        <h3>
          <Link href={slug}>
            <div className="mb-4 text-xl font-bold">{title}</div>
            <div className="float-none mb-8 mr-8 mt-1 flex justify-center sm:float-left sm:aspect-square">
              <Image
                className="rounded-full object-cover object-center"
                height={120}
                width={120}
                src={image.src}
                alt={image.alt}
              />
            </div>
          </Link>
        </h3>
        <p className="mt-2 line-clamp-5 flex-shrink overflow-hidden text-neutral-600">
          {desciption}
        </p>
        {tags ? (
          <div className="clear-both mt-1 w-full">
            <TagList tags={tags} />
          </div>
        ) : null}
      </td>
      <td className="px-2 py-3 align-top text-xl font-bold text-neutral-600 md:text-right">
        <div className="h-full">
          <span className="mr-2 md:mr-0">{topics}</span>
          <span className="md:hidden">Topics</span>
        </div>
      </td>
      <td className="flex flex-col px-2 py-3">
        <div className="mb-2 text-lg font-bold md:hidden">Latest</div>
        <ul>
          {!latestTopics.length ? (
            <span className="text-primary">No Topics Yet!</span>
          ) : (
            latestTopics.map((topic, i) => (
              <li key={i}>
                <Link
                  className="flex items-center gap-1 text-neutral-500"
                  href={`/community/p/${topic.id}`}
                >
                  {topic.locked ? <HiLockClosed className="h-4 w-4" /> : null}
                  {topic.pinned ? <FaThumbtack className="h-4 w-4" /> : null}
                  <span className="line-clamp-1 overflow-hidden text-primary">
                    {topic.name}
                  </span>
                  <span className="text-sm text-neutral-400">
                    {new Date(topic.created).toLocaleDateString("en-us", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </td>
    </tr>
  );
};

export default CategoryCard;