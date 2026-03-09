import type { Context, Next } from "hono";

export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const authUser = c.get("authUser");

    if (!authUser) {
      return c.json(
        { ok: false, code: "UNAUTHORIZED", message: "Authentication required" },
        401
      );
    }

    if (!roles.includes(authUser.role)) {
      return c.json(
        { ok: false, code: "FORBIDDEN", message: "Insufficient permissions" },
        403
      );
    }

    await next();
  };
}
