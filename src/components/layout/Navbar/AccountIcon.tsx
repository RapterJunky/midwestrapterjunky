"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { User2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const AccountIcon: React.FC = () => {
  const { data: session, status } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full"
          data-cy="account-icons"
        >
          <Avatar className="h-10 w-10 text-black">
            <AvatarFallback>
              <User2 />
            </AvatarFallback>
            <AvatarImage
              asChild
              src={(session?.user.image as string | undefined) ?? ""}
            >
              <Image
                width={40}
                height={40}
                src={session?.user.image ?? ""}
                alt={session?.user.name ?? "No User"}
              />
            </AvatarImage>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {status === "authenticated" ? (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user.name}
                </p>
                <p className="text-muted-foreground text-xs leading-none">
                  {session?.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" data-cy="account-profile-btn">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-cy="account-logout-btn"
              onClick={() => signOut()}
            >
              Log out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              data-cy="account-signin-btn"
              onClick={() => signIn()}
            >
              Login
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountIcon;
