import { useContext, createContext } from 'react';

type PostCtx = {
    report: (type: "post" | "comment", id: string) => Promise<void>;
    like: () => Promise<void>;
    delete: () => Promise<void>;
}

const PostContext = createContext<PostCtx | undefined>(undefined);

/**
 * A conslidated place for handling actions/dialogs for reporting, liking, deleting, and other actions
 * that can be shared between posts and comments
 */
export const PostProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <PostContext.Provider value={{
            async report(type: "post" | "comment", id: string) {

            },
            async like() {

            },
            async delete() {

            },
        }}>
            {children}
        </PostContext.Provider>
    );
}

const usePostActions = () => {
    const ctx = useContext(PostContext);
    if (!ctx) throw new Error("usePostActions requires to be wrapped in a PostProvider");
    return ctx;
}

export default usePostActions;