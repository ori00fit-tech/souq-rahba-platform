import type { Context, Next } from "hono";
import { fail } from "../utils/response";

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
};

function getClientIp(c: Context): string {
  return (
    c.req.header("CF-Connecting-IP") ||
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function rateLimit(options: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    const ip = getClientIp(c);
    const nowBucket = Math.floor(Date.now() / 1000 / options.windowSeconds);
    const key = `rl:${options.keyPrefix}:${ip}:${nowBucket}`;

    try {
      const raw = await c.env.CACHE.get(key);
      const count = Number(raw || "0");

      if (count >= options.limit) {
        return c.json(
          fail("RATE_LIMITED", "Too many requests, please try again later"),
          429
        );
      }

      await c.env.CACHE.put(key, String(count + 1), {
        expirationTtl: options.windowSeconds
      });

      await next();
    } catch (error) {
      console.error("rateLimit failed, continuing without blocking:", error);
      await next();
    }
  };
}
