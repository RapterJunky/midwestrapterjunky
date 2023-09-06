"use client";
import { Facebook, Chrome } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

const SignInList: React.FC = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? undefined;
  return (
    <div className="flex flex-col gap-4">
      <Button
        data-cy="google-login-btn"
        onClick={() =>
          signIn("google", { callbackUrl }).catch((e) => console.error(e))
        }
      >
        <Chrome className="mr-1" /> Continue with Google
      </Button>
      <Button
        data-cy="facebook-login-btn"
        onClick={() =>
          signIn("facebook", { callbackUrl }).catch((e) => console.error(e))
        }
      >
        <Facebook /> Continue with Facebook
      </Button>
    </div>
  );
};

export default SignInList;
