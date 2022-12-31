import { PrismaClient } from '@prisma/client'

declare global {
    var prisma: PrismaClient;
}

let prisma: PrismaClient;

if(process.env.VERCEL_ENV !== "development") {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

export default prisma;
