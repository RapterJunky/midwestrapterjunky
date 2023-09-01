import "server-only";
import { cache } from "react";
import prisma from "@/lib/api/prisma";

const getCategory = cache(async (id: number) => {

    const category = await prisma.thread.findUnique({
        where: {
            id,
        },
    });

    return category;
});

export default getCategory;