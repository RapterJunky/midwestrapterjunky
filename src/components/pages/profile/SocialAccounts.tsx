import { Facebook, Chrome, AlertCircle } from "lucide-react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { capitlize } from "@/lib/utils/capitlize";
import { fetcher } from "@/lib/api/fetcher";

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
    isLoading,
  } = useSWR<User, Response>("/api/account", fetcher);

  if (isLoading) {
    return (
      <>
        <Skeleton className="-mx-2 h-14 p-2" />
      </>
    );
  }

  if (error) {
    return (
      <div className="hover:bg-accent hover:text-accent-foreground -mx-2 flex items-start space-x-4 rounded-md p-2 transition-all">
        <AlertCircle className="mt-px h-5 w-5" />
        <div className="space-y-1">
          <p className="text-sm font-bold leading-none">Error</p>
          <p className="text-muted-foreground text-sm">
            Failed to load connect social accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user?.accounts.map((value, i) => (
        <div
          className="hover:bg-accent hover:text-accent-foreground -mx-2 flex items-start space-x-4 rounded-md p-2 transition-all"
          key={i}
        >
          {value.provider === "facebook" ? (
            <Facebook className="mt-px h-5 w-5" />
          ) : (
            <Chrome className="mt-px h-5 w-5" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-bold leading-none">
              {capitlize(value.provider)}
            </p>
            <p className="text-muted-foreground text-sm">Connected</p>
          </div>
        </div>
      ))}
    </>
  );
};

export default SocialAccounts;
