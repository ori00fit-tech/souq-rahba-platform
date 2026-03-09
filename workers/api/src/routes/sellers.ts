import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

export const sellerRouter = new Hono<{ Bindings: import("../types").Bindings }>();

sellerRouter.get("/me", authMiddleware, async (c) => {
  const authUser = c.get("authUser");

  const seller = await c.env.DB.prepare(
    `select
      s.id,
      s.owner_user_id,
      s.slug,
      s.display_name,
      s.city,
      s.verified,
      s.kyc_status,
      s.rating,
      s.created_at
    from sellers s
    where s.owner_user_id = ?
    limit 1`
  )
    .bind(authUser.user_id)
    .first();

  if (!seller) {
    return c.json(
      { ok: false, code: "SELLER_NOT_FOUND", message: "Seller profile not found" },
      404
    );
  }

  return c.json({
    ok: true,
    data: {
      ...seller,
      user: {
        id: authUser.user_id,
        email: authUser.email,
        full_name: authUser.full_name,
        role: authUser.role
      }
    }
  });
});
