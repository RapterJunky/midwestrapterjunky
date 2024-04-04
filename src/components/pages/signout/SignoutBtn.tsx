"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const SignoutBtn: React.FC = () => {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
      className="w-full"
    >
      Sign out
    </Button>
  );
};

export default SignoutBtn;
