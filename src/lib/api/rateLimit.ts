import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const cache = new Map();

const rateLimiter = new Ratelimit({
  redis: new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  }),
  ephemeralCache: cache,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: false,
  prefix: "ratelimit",
});

export class RateLimitError extends Error {
  constructor(public limit: number, public remaining: number, public reset: number) {
    super("Too many requests");
  }
  getHeaders() {
    return {
      "X-RateLimit-Limit": this.limit.toString(),
      "X-RateLimit-Remaining": this.remaining.toString(),
      "X-RateLimit-Reset": this.reset.toString(),
    }
  }
}

type RatelimitResponse = Awaited<ReturnType<typeof rateLimiter.limit>>;

const ratelimit = async (
  ip: string | undefined = "anonymous",
): Promise<RatelimitResponse> => {
  if (process.env.VERCEL_ENV === "development") {
    return {
      success: true,
      reset: 0,
      limit: 0,
      remaining: 0,
    } as RatelimitResponse;
  }
  return rateLimiter.limit(ip);
};


export const limit = async (ip: string | undefined = "anonymous") => {
  const { success, remaining, reset, limit } = await ratelimit(ip);
  if (!success) throw new RateLimitError(limit, remaining, reset);
}

export default ratelimit;
