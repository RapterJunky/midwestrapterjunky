import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import type { PrismaClient } from "@prisma/client";
import { logger } from "@lib/logger";
import prisma from "@api/prisma";

export const authConfig = {
  pages: {
    signIn: "/signin",
    signOut: "/signout",
  },
  logger: {
    debug(code, metadata) {
      logger.debug(metadata, code);
    },
    error(code, metadata) {
      logger.error(metadata, code);
    },
    warn(code) {
      logger.warn(code);
    },
  },
  callbacks: {
    session: ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma as never as PrismaClient),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthOptions;
