import useSWR from "swr";
import { Facebook, Chrome, AlertCircle } from 'lucide-react';
import { singleFetch } from "@/lib/api/fetch";
import { capitlize } from "@/lib/utils/capitlize";
import { Skeleton } from "@/components/ui/skeleton";

type User = {
    id: string;
    name?: string;
    email?: string;
    emailVerified: null | boolean;
    image: string;
    sqaureId: string;
    banned: number;
    accounts: { type: string; provider: string; providerAccountId: string }[];
};

const SocialAccounts: React.FC = () => {
    const {
        data: user,
        error,
        isLoading
    } = useSWR<User, Response>("/api/account", singleFetch);

    if (isLoading) {
        return (<>
            <Skeleton className="-mx-2 p-2 h-14" />
        </>);
    }

    if (error) {
        return (
            <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground">
                <AlertCircle className="mt-px h-5 w-5" />
                <div className="space-y-1">
                    <p className="text-sm leading-none font-bold">Error</p>
                    <p className="text-sm text-muted-foreground">
                        Failed to load connect social accounts.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {user?.accounts.map((value, i) => (
                <div className="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground" key={i}>
                    {value.provider === "facebook" ? (<Facebook className="mt-px h-5 w-5" />) : (<Chrome className="mt-px h-5 w-5" />)}
                    <div className="space-y-1">
                        <p className="text-sm leading-none font-bold">{capitlize(value.provider)}</p>
                        <p className="text-sm text-muted-foreground">
                            Connected
                        </p>
                    </div>
                </div>
            ))}
        </>
    );
}

export default SocialAccounts;