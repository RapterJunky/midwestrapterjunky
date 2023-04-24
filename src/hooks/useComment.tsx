import { createContext, useContext } from 'react';
import type { CreateCommentBody } from '@hook/usePost';

type Ctx = {
    postId: string;
    parentId: string;
    create: (content: CreateCommentBody) => Promise<void>
}

export const CommentCtx = createContext<Ctx | undefined>(undefined);

const useComment = () => {
    const ctx = useContext(CommentCtx);
    return ctx;
}

export default useComment;

