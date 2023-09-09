"use client";
import { Facebook } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Google } from "@/components/ui/icons";

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
        <Google className="mr-2" /> Continue with Google
      </Button>
      <Button
        data-cy="facebook-login-btn"
        onClick={() =>
          signIn("facebook", { callbackUrl }).catch((e) => console.error(e))
        }
      >
        <Facebook className="mr-1" /> Continue with Facebook
      </Button>
    </div>
  );
};

export default SignInList;
