import type { Context, Next } from "hono";
import { AuthErrors } from "../utils/auth-errors";
import type { AuthUser } from "../types";

type SessionRow = {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "buyer" | "seller" | "admin" | string;
  expires_at?: string | null;
};

function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  const ts = Date.parse(expiresAt);
  if (Number.isNaN(ts)) return false;
  return ts <= Date.now();
}

function mapSessionRowToAuthUser(row: SessionRow): AuthUser {
  const normalizedRole =
    row.role === "buyer" || row.role === "seller" || row.role === "admin"
      ? row.role
      : "buyer";

  return {
    user_id: row.user_id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone || null,
    role: normalizedRole
  };
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      AuthErrors.unauthorized("Missing token"),
      401
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return c.json(
      AuthErrors.unauthorized("Missing token"),
      401
    );
  }

  const session = await c.env.DB.prepare(
    `select
      s.id,
      s.user_id,
      s.expires_at,
      u.email,
      u.full_name,
      u.phone,
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
      AuthErrors.unauthorized("Invalid token"),
      401
    );
  }

  if (isExpired(session.expires_at)) {
    await c.env.DB.prepare(`delete from sessions where id = ?`)
      .bind(session.id)
      .run();

    return c.json(
      AuthErrors.sessionExpired(),
      401
    );
  }

  c.set("authUser", mapSessionRowToAuthUser(session));
  await next();
}
