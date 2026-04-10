import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { ok, fail } from "../utils/response";

export const adminRouter = new Hono<{ Bindings: import("../types").Bindings }>();

adminRouter.use("*", authMiddleware, requireRole("admin"));

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
