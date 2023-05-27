"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import HiUser from "@components/icons/HiUser";

const AccountIcon: React.FC = () => {
    const session = useSession();

    if (session.status === "authenticated")
        return (
            <button
                onClick={() => signOut()}
                aria-label="Account signout"
                title="Signout"
                type="button"
                className="ml-2"
            >
                <Image
                    className="rounded-full shadow-lg"
                    width={40}
                    height={40}
                    src={session.data.user.image ?? ""}
                    alt="avatar"
                />
            </button>
        );

    return (
        <div className="ml-2">
            <button
                onClick={() => signIn()}
                title="Signin"
                type="button"
                aria-label="Account signin"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg transition-all duration-700 ease-in-out group-hover:bg-neutral-300"
            >
                <HiUser className="h-6 w-6" />
            </button>
        </div>
    );
}

export default AccountIcon;