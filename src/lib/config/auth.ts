import { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@api/prisma';
import { logger } from '@lib/logger';

export const authConfig = {
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
        session: async ({ session, user }) => {
            if (session?.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        })
    ]
} satisfies NextAuthOptions;