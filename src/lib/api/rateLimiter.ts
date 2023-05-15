import type { NextApiRequest, NextApiResponse } from "next";
import { TooManyRequests } from "http-errors";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

type MiddlewareHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  result: (err?: unknown) => void
) => void;

export const getRateLimitMiddlewares = ({
  limit = 10,
  windowMs = 60 * 1000,
  delayAfter = Math.round(10 / 2),
  delayMs = 500,
} = {}) =>
  [
    slowDown({
      keyGenerator: (request) =>
        (request?.headers["x-forwarded-for"] as string) ??
        (request?.headers["x-real-ip"] as string) ??
        request.socket.remoteAddress,
      windowMs,
      delayAfter,
      delayMs,
    }) as never as MiddlewareHandler,
    rateLimit({
      keyGenerator: (request) =>
        (request?.headers["x-forwarded-for"] as string) ??
        (request?.headers["x-real-ip"] as string) ??
        request.socket.remoteAddress,
      windowMs,
      max: limit,
    }) as never as MiddlewareHandler,
  ].map(
    (middleware) => (req: NextApiRequest, res: NextApiResponse) =>
      new Promise((ok, rej) => {
        middleware(req, res, (result) =>
          result instanceof Error ? rej(result) : ok(result)
        );
      })
  );

const middlewares = getRateLimitMiddlewares();

/**
 * @deprecated
 * @param req 
 * @param res 
 */
export const applyRateLimit = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    await Promise.all(middlewares.map((middleware) => middleware(req, res)));
  } catch (error) {
    throw TooManyRequests();
  }
};
