import type { Context, Next } from "hono";

type SessionRow = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  expires_at?: string | null;
};

function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  const ts = Date.parse(expiresAt);
  if (Number.isNaN(ts)) return false;
  return ts <= Date.now();
}

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
      s.expires_at,
      u.email,
      u.full_name,
      u.role
    from sessions s
    join users u on u.id = s.user_id
    where s.token = ?
    limit 1`
  )
    .bind(token)
    .first<SessionRow>();

  if (!session) {
    return c.json(
      { ok: false, code: "UNAUTHORIZED", message: "Invalid token" },
      401
    );
  }

  if (isExpired(session.expires_at)) {
    await c.env.DB.prepare(`delete from sessions where id = ?`)
      .bind(session.id)
      .run();

    return c.json(
      { ok: false, code: "SESSION_EXPIRED", message: "Session expired" },
      401
    );
  }

  c.set("authUser", session);
  await next();
}
