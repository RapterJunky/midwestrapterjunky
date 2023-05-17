import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import type { AdapterUser } from 'next-auth/adapters';

import type { PrismaClient } from "@prisma/client";
import { logger } from "@lib/logger";
import prisma from "@api/prisma";

export const authConfig = {
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    error: "/auth/error",
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
    signIn(settings) {
      if ((settings.user as AdapterUser & { banned: 0 | 1 | 2 }).banned === 2) return false;
      return true;
    },
    session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
        session.user.banned = (user as AdapterUser & { banned: 0 | 1 | 2 }).banned;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma as never as PrismaClient),
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthOptions;
