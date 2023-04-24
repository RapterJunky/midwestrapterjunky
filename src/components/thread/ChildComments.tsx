import type { useSession } from "next-auth/react";
import { useState } from 'react';
import useSWR from 'swr';

import Comment, { type TComment } from "./Comment";
import { singleFetch } from '@api/fetch';
import { Paginate } from "@type/page";

type Session = ReturnType<typeof useSession>;
type Props = {
    postId: string;
    parentId: string;
    session: Session
}

const ChildComments: React.FC<Props> = ({ postId, parentId, session }) => {
    const [page, setPage] = useState<number>(1);
    const [show, setShow] = useState(false);
    const { data, isLoading, error } = useSWR<Paginate<TComment>, Response>(show ? `/api/community/comments?post=${postId}&page=${page}&parent=${parentId}` : null, singleFetch as () => Promise<Paginate<TComment>>);

    if (!show) {
        return (
            <button onClick={() => setShow(true)}>Show Children</button>
        );
    }

    if (isLoading) {
        return (<div>Loading</div>);
    }

    if (error) {
        return (<div>Failed to load comments</div>);
    }

    if (data && !data.result.length) {
        return (<div>No Children</div>)
    }

    return (
        <div>
            <button onClick={() => setShow(false)}>Close</button>
            <ul>
                {data && data.result.map((comment, i) => (
                    <Comment comment={comment} session={session} key={i} />
                ))}
            </ul>
            <div>

            </div>
        </div>
    );
}

export default ChildComments;