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
