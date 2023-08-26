import Spinner from "@/components/ui/Spinner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { singleFetch } from "@/lib/api/fetch";
import { signOut } from "next-auth/react";
import { useState } from "react";


const DeleteAccount: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleDelete = async (ev: React.PointerEvent) => {
        ev.preventDefault();
        try {
            setLoading(true);
            await singleFetch("/api/account", { method: "DELETE" });
            await signOut({ callbackUrl: "" });
        } catch (error) {
            console.error(error);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">Delete my account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle></AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete your account?
                        Deleting account will delete all posts, comments, etc.
                        {error ? (
                            <p className="bg-red-500 text-zinc-50 p-2 mt-2">
                                The server was unable to delete your account at this time,
                                Please try again.
                            </p>
                        ) : null}
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={loading} onClick={handleDelete}>
                            {loading ? (<Spinner className="h-4 w-4 mr-2" />) : null}
                            Yes, delete my account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default DeleteAccount;