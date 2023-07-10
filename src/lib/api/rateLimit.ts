import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rateLimiter = new Ratelimit({
  redis: new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  }),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: false,
  prefix: "ratelimit",
});

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

export default ratelimit;
