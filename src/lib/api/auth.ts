import createHttpError from "http-errors";
import { headers } from 'next/headers';

export const auth = (token: string) => {
    const headersList = headers();

    const authorization = headersList.get("authorization");

    if (!authorization || authorization.replace("Bearer ", "") !== token) throw createHttpError.Unauthorized();
}