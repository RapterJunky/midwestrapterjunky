import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { TooManyRequests } from "http-errors";
import type { NextApiRequest, NextApiResponse } from 'next';

const getIP = (request: any) =>
    request.headers['x-forwarded-for'] ||
    request.headers['x-real-ip'] ||
    request.socket.remoteAddress;

export const getRateLimitMiddlewares = ({
    limit = 10,
    windowMs = 60 * 1000,
    delayAfter = Math.round(10 / 2),
    delayMs = 500,
} = {}) => [
    slowDown({ keyGenerator: getIP, windowMs, delayAfter, delayMs }),
    rateLimit({ keyGenerator: getIP, windowMs, max: limit }),
].map((middleware) => (req: any, res: any) => new Promise((ok, rej) => {
    middleware(req, res, result => result instanceof Error ? rej(result) : ok(result));
}));

const middlewares = getRateLimitMiddlewares();

export const applyRateLimit = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        await Promise.all(middlewares.map(middleware => middleware(req, res)));
    } catch (error) {
        throw TooManyRequests();
    }
}