import NextAuth from "next-auth/next";
import { authConfig } from "@lib/config/auth";

const handler = NextAuth(authConfig) as () => Promise<Response>;

export const POST = handler;
export const GET = handler;
