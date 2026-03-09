import type { Context, Next } from "hono";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { ok: false, code: "UNAUTHORIZED", message: "Missing token" },
      401
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();

  const session = await c.env.DB.prepare(
    `select
      s.id,
      s.user_id,
      u.email,
      u.full_name,
      u.role
    from sessions s
    join users u on u.id = s.user_id
    where s.token = ?
    limit 1`
  )
    .bind(token)
    .first();

  if (!session) {
    return c.json(
      { ok: false, code: "UNAUTHORIZED", message: "Invalid token" },
      401
    );
  }

  c.set("authUser", session);
  await next();
}
