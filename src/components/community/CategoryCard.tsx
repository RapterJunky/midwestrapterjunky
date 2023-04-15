import { HiLockClosed } from 'react-icons/hi';
import { FaThumbtack } from 'react-icons/fa';
import Image from 'next/image';
import Link from "next/link";
import TagList from './TagList';

type Props = {
    title: string;
    slug: string;
    desciption: string;
    image: {
        alt: string;
        src: string;
    }
    tags: PrismaJson.Tags | null;
    topics: number;
    latestTopics: {
        name: string;
        id: string;
        pinned: boolean;
        locked: boolean;
        created: Date;
    }[]
}

const CategoryCard: React.FC<Props> = ({ slug, desciption, title, image, tags, topics, latestTopics }) => {
    return (
        <tr className="flex flex-col w-full md:table-row">
            <td className="py-3 px-2">
                <h3>
                    <Link href={slug}>
                        <div className="font-bold text-xl mb-4">{title}</div>
                        <div className="float-none flex justify-center sm:float-left sm:aspect-square mt-1 mr-8 mb-8">
                            <Image className="rounded-full object-center object-cover" height={120} width={120} src={image.src} alt={image.alt} />
                        </div>
                    </Link>
                </h3>
                <p className="flex-shrink overflow-hidden mt-2 text-neutral-600 line-clamp-5">
                    {desciption}
                </p>
                {tags ? (
                    <div className="clear-both w-full mt-1">
                        <TagList tags={tags} />
                    </div>
                ) : null}
            </td>
            <td className="md:text-right py-3 px-2 text-neutral-600 font-bold text-xl align-top">
                <div className="h-full">
                    <span className="mr-2 md:mr-0">{topics}</span>
                    <span className="md:hidden">Topics</span>
                </div>
            </td>
            <td className="py-3 px-2 flex flex-col">
                <div className="md:hidden text-lg font-bold mb-2">Latest</div>
                <ul>
                    {!latestTopics.length ? (
                        <span className="text-primary">No Topics Yet!</span>
                    ) : latestTopics.map((topic, i) => (
                        <li key={i}>
                            <Link className="flex gap-1 items-center text-neutral-500" href={`/community/p/${topic.id}`}>
                                {topic.locked ? <HiLockClosed className="h-4 w-4" /> : null}
                                {topic.pinned ? <FaThumbtack className="h-4 w-4" /> : null}
                                <span className="text-primary overflow-hidden line-clamp-1">{topic.name}</span>
                                <span className="text-neutral-400 text-sm">{new Date(topic.created).toLocaleDateString("en-us", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </td>
        </tr>
    );
}

export default CategoryCard;