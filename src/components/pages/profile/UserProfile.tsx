"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import SocialAccounts from "./SocialAccounts";
import DeleteAccount from "./DeleteAccount";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User2 } from "lucide-react";

const UserProfile: React.FC = () => {
    const { data: session, status } = useSession({
        required: true
    });

    if (status === "loading" || !session) return null;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {session.user.banned !== 0 ? (
                            <Badge variant="destructive">Banned</Badge>
                        ) : null}
                        {session.user.name}
                    </CardTitle>
                    <CardDescription>{session.user.email}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Avatar className="h-44 w-44">
                        <AvatarFallback>
                            <User2 />
                        </AvatarFallback>
                        <AvatarImage asChild src={session.user.image ?? ""}>
                            <Image
                                src={session.user.image ?? ""}
                                width={255}
                                height={256}
                                alt="avatar"
                            />
                        </AvatarImage>
                    </Avatar>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Social Accounts</CardTitle>
                    <CardDescription>Connected Social accounts</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-1">
                    <SocialAccounts />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Delete account</CardTitle>
                    <CardDescription>
                        No longer want to use our service? You can delete your account
                        here. This action is not reversible. All information related to
                        this account will be deleted permanently.
                    </CardDescription>
                    <CardContent></CardContent>
                    <CardFooter>
                        <DeleteAccount />
                    </CardFooter>
                </CardHeader>
            </Card>
        </>
    );
}

export default UserProfile;