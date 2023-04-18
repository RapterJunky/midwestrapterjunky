import { useContext, createContext, useState, Fragment } from 'react';
import type { TComment } from '@components/thread/Comment';
import { Dialog, Transition } from '@headlessui/react';

type PostCtx = {
    report: (type: "post" | "comment", id: string) => Promise<void>;
    like: () => Promise<void>;
    delete: (type: "post" | "comment", id: string) => Promise<void>;
    create<T>(type: "post", schema: { data: T, id: string; }): Promise<TComment | null>;
    create<T>(type: "comment", schema: { data: T, id: string; }): Promise<TComment | null>;
}

const REPORT_EVENT_REASON = "mrj__report::reason";
const REPORT_EVENT_EXIT = "mrh_report:exit";

const PostContext = createContext<PostCtx | undefined>(undefined);

/**
 * A conslidated place for handling actions/dialogs for reporting, liking, deleting, and other actions
 * that can be shared between posts and comments
 */
export const PostProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [dialog, setDialog] = useState<{ reasonInput: boolean, title: string; message: string; open: boolean; }>({
        title: "Error",
        reasonInput: false,
        message: "There was an error when processing your request.",
        open: false
    });

    const close = (reasonReject = true) => {
        setDialog((current) => ({ ...current, open: false }));
        if (reasonReject) window.dispatchEvent(new CustomEvent(REPORT_EVENT_EXIT));
    }

    return (
        <PostContext.Provider value={{
            async report(type, id) {
                try {
                    if (type === "comment") {
                        const reason = await new Promise<string | null>((ok, reject) => {
                            let exitHandle: () => void;
                            const reasonHandle = (e: Event) => {
                                window.removeEventListener(REPORT_EVENT_REASON, reasonHandle);
                                if (exitHandle) window.removeEventListener(REPORT_EVENT_EXIT, exitHandle);
                                ok((e as CustomEvent<string>).detail);
                            }
                            exitHandle = () => {
                                window.removeEventListener(REPORT_EVENT_REASON, reasonHandle);
                                window.removeEventListener(REPORT_EVENT_EXIT, exitHandle);
                                ok(null);
                            }

                            window.addEventListener(REPORT_EVENT_REASON, reasonHandle, false);
                            window.addEventListener(REPORT_EVENT_EXIT, () => reject("No reason was given"));

                            setDialog({
                                reasonInput: true,
                                title: "Reason for report",
                                message: "Please enter a reason for reporting this comment.",
                                open: true
                            });
                        });

                        if (!reason) return;

                        const request = await fetch("/api/community/comments", {
                            method: "POST",
                            body: JSON.stringify({
                                id,
                                reason
                            }),
                            headers: {
                                "Content-Type": "application/json",
                                "x-type-report": "true"
                            }
                        });

                        if (!request.ok) {
                            throw request;
                        }

                        return;
                    }
                } catch (error) {
                    setDialog({
                        title: "Error",
                        message: "Failed to report",
                        open: true,
                        reasonInput: false
                    });
                    console.error(error);
                }
            },
            async like() { },
            async delete(type, id) {
                if (type === "comment") {
                    const request = await fetch("/api/community/comments", {
                        method: "DELETE",
                        body: JSON.stringify({
                            id
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    if (!request.ok) {
                        setDialog({
                            reasonInput: false,
                            open: true,
                            title: "Error",
                            message: "Failed to delete your comment. Try again!"
                        })
                        throw request;
                    }
                }
            },
            async create(type, schema) {
                if (type === "comment") {
                    const request = await fetch("/api/community/comments", {
                        method: "POST",
                        body: JSON.stringify({
                            postId: schema.id,
                            parentCommentId: undefined,
                            data: schema.data
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    if (!request.ok) {
                        // open dialog
                        setDialog({
                            reasonInput: false,
                            open: true,
                            title: "Error",
                            message: "Failed to create your comment. Try again!"
                        });
                        throw request;
                    }
                    const comment = await request.json() as TComment;
                    return comment;
                }
                return null;
            }
        }}>
            {children}
            <Transition appear show={dialog.open} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => close()}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-sm bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {dialog.title}
                                    </Dialog.Title>
                                    <div className="mt-2 mb-4">
                                        <p className="text-sm text-gray-500">
                                            {dialog.message}
                                        </p>
                                    </div>
                                    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                                        e.preventDefault();
                                        if (!dialog.reasonInput) return close(false);

                                        const data = new FormData(e.target as HTMLFormElement);
                                        if (!(e.target as HTMLFormElement).checkValidity()) return;
                                        window.dispatchEvent(new CustomEvent(REPORT_EVENT_REASON, { detail: data.get("reason") }));
                                        close(false);
                                    }}>
                                        {dialog.reasonInput ? (
                                            <div className="flex flex-col mb-4">
                                                <label htmlFor="reasonInput">Reason</label>
                                                <textarea placeholder='Reason...' id="reasonInput" name="reason" minLength={3} />
                                            </div>
                                        ) : null}

                                        <div className="flex justify-end">
                                            {dialog.reasonInput ? (<button onClick={() => close()}
                                                type="button"
                                                className="inline-block mr-auto rounded-sm bg-red-600 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#dc4c64] transition duration-150 ease-in-out hover:bg-danger-600 hover:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] focus:bg-danger-600 focus:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] focus:outline-none focus:ring-0 active:bg-danger-700 active:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(220,76,100,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.2),0_4px_18px_0_rgba(220,76,100,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.2),0_4px_18px_0_rgba(220,76,100,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.2),0_4px_18px_0_rgba(220,76,100,0.1)]"
                                            >
                                                Cancel
                                            </button>) : null}
                                            <button
                                                type="submit"
                                                className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                                            >
                                                Ok
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </PostContext.Provider>
    );
}

const usePostActions = () => {
    const ctx = useContext(PostContext);
    if (!ctx) throw new Error("usePostActions requires to be wrapped in a PostProvider");
    return ctx;
}

export default usePostActions;