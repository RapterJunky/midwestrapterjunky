import useRelativeTime from "@/hooks/useRelativeTime";
import Link from "next/link";

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
                    <div className="flex gap-2 flex-wrap mb-2">
                        {tags.map((tag, i) => (
                            <span key={i} className="p-1 bg-emerald-400 text-white rounded-sm text-xs">{tag}</span>
                        ))}
                    </div>
                    <p className="text-base text-neutral-500 overflow-hidden line-clamp-4">{description}</p>
                </div>
            </td>
            <td className="text-center">{replies}</td>
            <td className="text-center">{activity ? format(activity) : "No Activity"}</td>
        </tr>
    );
}

export default TopicCard;