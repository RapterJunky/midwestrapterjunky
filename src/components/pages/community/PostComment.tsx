import type { TComment } from "@/components/providers/CommentProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useComments from "@/hooks/community/useComments";
import Image from "next/image";

const PostComment: React.FC<{ data: TComment }> = ({ data }) => {
    const { } = useComments();

    return (
        <li>
            <div>
                <Avatar>
                    <AvatarImage></AvatarImage>
                    <AvatarFallback></AvatarFallback>
                </Avatar>
                <Image
                    width={40}
                    height={40}
                    className="rounded-full"
                    src={data.owner.image ?? ""}
                    alt="avatar"
                />
            </div>
        </li>
    );
}
export default PostComment;