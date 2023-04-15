import useRelativeTime from "@hook/useRelativeTime";
import Link from "next/link";
import TagList from "./TagList";

type Props = {
    title: string;
    slug: string;
    tags: string[]
    description: string;
    replies: number;
    activity: string | undefined;
}

const TopicCard: React.FC<Props> = ({ activity, title, slug, tags, description, replies }) => {
    const format = useRelativeTime();
    return (
        <tr>
            <td>
                <div className="p-2">
                    <Link href={slug}>
                        <h3 className="font-bold text-lg mb-2">
                            <span>{title}</span>
                        </h3>
                    </Link>
                    <TagList tags={tags} />
                    <p className="text-base text-neutral-500 overflow-hidden line-clamp-4">{description}</p>
                </div>
            </td>
            <td className="text-center">{replies}</td>
            <td className="text-center">{activity ? format(activity) : "No Activity"}</td>
        </tr>
    );
}

export default TopicCard;