import type { MiddlewareHandler } from "hono";

export const requestId: MiddlewareHandler = async (c, next) => {
  const value = crypto.randomUUID();
  c.set("requestId", value);
  await next();
  c.header("x-request-id", value);
};
