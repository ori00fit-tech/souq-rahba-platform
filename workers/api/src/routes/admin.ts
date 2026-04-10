import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { ok, fail } from "../utils/response";

export const adminRouter = new Hono<{ Bindings: import("../types").Bindings }>();

adminRouter.use("*", authMiddleware, requireRole("admin"));

function parseLimit(value: string | undefined, fallback = 10, max = 50) {
  const n = Number(value || fallback);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

adminRouter.get("/sellers", async (c) => {
  const rows = await c.env.DB.prepare(
    `select
      s.id,
      s.owner_user_id,
      s.slug,
      s.display_name,
      s.city,
      s.verified,
      s.kyc_status,
      s.rating,
      s.created_at,
      u.email,
      u.full_name,
      u.role
    from sellers s
    left join users u on u.id = s.owner_user_id
    order by s.created_at desc`
  ).all();

  return c.json(
    ok(rows.results || [])
  );
});

adminRouter.patch("/sellers/:id/status", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);

  const nextStatus = body?.kyc_status;
  const verified = body?.verified;

  if (!["pending", "approved", "rejected"].includes(nextStatus)) {
    return c.json(
      fail("INVALID_STATUS", "Invalid seller status"),
      400
    );
  }

  await c.env.DB.prepare(
    `update sellers
     set kyc_status = ?, verified = ?
     where id = ?`
  )
    .bind(nextStatus, verified ? 1 : 0, id)
    .run();

  const updated = await c.env.DB.prepare(
    `select
      id,
      owner_user_id,
      slug,
      display_name,
      city,
      verified,
      kyc_status,
      rating,
      created_at
    from sellers
    where id = ?
    limit 1`
  )
    .bind(id)
    .first();

  if (!updated) {
    return c.json(
      fail("NOT_FOUND", "Seller not found"),
      404
    );
  }

  return c.json(
    ok(updated)
  );
});

adminRouter.get("/system/health-summary", async (c) => {
  try {
    const [
      usersRow,
      sellersRow,
      productsRow,
      ordersRow,
      sessionsRow,
      expiredSessionsRow
    ] = await Promise.all([
      c.env.DB.prepare(`select count(*) as total from users`).first<{ total: number }>(),
      c.env.DB.prepare(`select count(*) as total from sellers`).first<{ total: number }>(),
      c.env.DB.prepare(`select count(*) as total from products`).first<{ total: number }>(),
      c.env.DB.prepare(`select count(*) as total from orders`).first<{ total: number }>(),
      c.env.DB.prepare(`select count(*) as total from sessions`).first<{ total: number }>(),
      c.env.DB.prepare(`
        select count(*) as total
        from sessions
        where expires_at is not null
          and datetime(expires_at) <= datetime('now')
      `).first<{ total: number }>()
    ]);

    return c.json(
      ok({
        users: Number(usersRow?.total || 0),
        sellers: Number(sellersRow?.total || 0),
        products: Number(productsRow?.total || 0),
        orders: Number(ordersRow?.total || 0),
        sessions: Number(sessionsRow?.total || 0),
        expired_sessions: Number(expiredSessionsRow?.total || 0),
        checked_at: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error("GET /admin/system/health-summary failed", error);
    return c.json(
      fail("SYSTEM_HEALTH_FAILED", "Failed to load system health summary"),
      500
    );
  }
});

adminRouter.post("/system/cleanup-sessions", async (c) => {
  try {
    const beforeRow = await c.env.DB.prepare(`
      select count(*) as total
      from sessions
      where expires_at is not null
        and datetime(expires_at) <= datetime('now')
    `).first<{ total: number }>();

    const before = Number(beforeRow?.total || 0);

    await c.env.DB.prepare(`
      delete from sessions
      where expires_at is not null
        and datetime(expires_at) <= datetime('now')
    `).run();

    const afterRow = await c.env.DB.prepare(`
      select count(*) as total
      from sessions
      where expires_at is not null
        and datetime(expires_at) <= datetime('now')
    `).first<{ total: number }>();

    const after = Number(afterRow?.total || 0);

    return c.json(
      ok({
        deleted_sessions: Math.max(before - after, 0),
        remaining_expired_sessions: after,
        cleaned_at: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error("POST /admin/system/cleanup-sessions failed", error);
    return c.json(
      fail("SESSION_CLEANUP_FAILED", "Failed to cleanup expired sessions"),
      500
    );
  }
});

adminRouter.get("/system/recent-orders", async (c) => {
  try {
    const limit = parseLimit(c.req.query("limit"), 10, 50);

    const rows = await c.env.DB.prepare(
      `
      select
        o.id,
        o.order_number,
        o.buyer_user_id,
        o.seller_id,
        o.order_status,
        o.payment_method,
        o.payment_status,
        o.shipping_status,
        o.total_mad,
        o.buyer_name,
        o.buyer_phone,
        o.buyer_city,
        o.created_at,
        s.display_name as seller_name,
        (
          select count(*)
          from order_items oi
          where oi.order_id = o.id
        ) as items_count
      from orders o
      left join sellers s on s.id = o.seller_id
      order by datetime(o.created_at) desc
      limit ?
      `
    )
      .bind(limit)
      .all();

    return c.json(
      ok({
        limit,
        items: rows.results || []
      })
    );
  } catch (error) {
    console.error("GET /admin/system/recent-orders failed", error);
    return c.json(
      fail("RECENT_ORDERS_FAILED", "Failed to load recent orders"),
      500
    );
  }
});

adminRouter.get("/system/recent-users", async (c) => {
  try {
    const limit = parseLimit(c.req.query("limit"), 10, 50);

    const rows = await c.env.DB.prepare(
      `
      select
        id,
        email,
        full_name,
        phone,
        role,
        locale,
        auth_provider,
        google_id,
        avatar_url,
        created_at
      from users
      order by datetime(created_at) desc
      limit ?
      `
    )
      .bind(limit)
      .all();

    return c.json(
      ok({
        limit,
        items: rows.results || []
      })
    );
  } catch (error) {
    console.error("GET /admin/system/recent-users failed", error);
    return c.json(
      fail("RECENT_USERS_FAILED", "Failed to load recent users"),
      500
    );
  }
});

adminRouter.get("/system/recent-sessions", async (c) => {
  try {
    const limit = parseLimit(c.req.query("limit"), 10, 50);

    const rows = await c.env.DB.prepare(
      `
      select
        s.id,
        s.user_id,
        s.token,
        s.created_at,
        s.expires_at,
        u.email,
        u.full_name,
        u.role
      from sessions s
      left join users u on u.id = s.user_id
      order by datetime(s.created_at) desc
      limit ?
      `
    )
      .bind(limit)
      .all();

    const items = Array.isArray(rows.results)
      ? rows.results.map((row: any) => ({
          ...row,
          token_preview: row?.token
            ? `${String(row.token).slice(0, 8)}...${String(row.token).slice(-4)}`
            : null,
          token: undefined
        }))
      : [];

    return c.json(
      ok({
        limit,
        items
      })
    );
  } catch (error) {
    console.error("GET /admin/system/recent-sessions failed", error);
    return c.json(
      fail("RECENT_SESSIONS_FAILED", "Failed to load recent sessions"),
      500
    );
  }
});

adminRouter.post("/system/revoke-session/:id", async (c) => {
  try {
    const sessionId = String(c.req.param("id") || "").trim();

    if (!sessionId) {
      return c.json(
        fail("SESSION_ID_REQUIRED", "Session id is required"),
        400
      );
    }

    const existing = await c.env.DB.prepare(
      `
      select
        s.id,
        s.user_id,
        s.created_at,
        s.expires_at,
        u.email,
        u.full_name,
        u.role
      from sessions s
      left join users u on u.id = s.user_id
      where s.id = ?
      limit 1
      `
    )
      .bind(sessionId)
      .first<any>();

    if (!existing) {
      return c.json(
        fail("SESSION_NOT_FOUND", "Session not found"),
        404
      );
    }

    await c.env.DB.prepare(
      `delete from sessions where id = ?`
    )
      .bind(sessionId)
      .run();

    return c.json(
      ok({
        revoked: true,
        session: {
          id: existing.id,
          user_id: existing.user_id,
          email: existing.email || null,
          full_name: existing.full_name || null,
          role: existing.role || null,
          created_at: existing.created_at || null,
          expires_at: existing.expires_at || null
        }
      })
    );
  } catch (error) {
    console.error("POST /admin/system/revoke-session/:id failed", error);
    return c.json(
      fail("REVOKE_SESSION_FAILED", "Failed to revoke session"),
      500
    );
  }
});

adminRouter.post("/system/revoke-user-sessions/:userId", async (c) => {
  try {
    const userId = String(c.req.param("userId") || "").trim();

    if (!userId) {
      return c.json(
        fail("USER_ID_REQUIRED", "User id is required"),
        400
      );
    }

    const user = await c.env.DB.prepare(
      `
      select
        id,
        email,
        full_name,
        role
      from users
      where id = ?
      limit 1
      `
    )
      .bind(userId)
      .first<any>();

    if (!user) {
      return c.json(
        fail("USER_NOT_FOUND", "User not found"),
        404
      );
    }

    const beforeRow = await c.env.DB.prepare(
      `select count(*) as total from sessions where user_id = ?`
    )
      .bind(userId)
      .first<{ total: number }>();

    const before = Number(beforeRow?.total || 0);

    await c.env.DB.prepare(
      `delete from sessions where user_id = ?`
    )
      .bind(userId)
      .run();

    return c.json(
      ok({
        revoked: true,
        user: {
          id: user.id,
          email: user.email || null,
          full_name: user.full_name || null,
          role: user.role || null
        },
        deleted_sessions: before
      })
    );
  } catch (error) {
    console.error("POST /admin/system/revoke-user-sessions/:userId failed", error);
    return c.json(
      fail("REVOKE_USER_SESSIONS_FAILED", "Failed to revoke user sessions"),
      500
    );
  }
});
