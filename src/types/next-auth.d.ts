import type { DefaultSession } from "next-auth";

declare module "next-auth" {

  interface AdapterUser {
    banned: boolean;
  }

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
