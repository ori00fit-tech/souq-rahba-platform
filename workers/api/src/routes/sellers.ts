import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { getSellerByOwnerUserId } from "../repositories/access.repository";

export const sellerRouter = new Hono<{ Bindings: import("../types").Bindings }>();

sellerRouter.get("/me", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const authUser = c.get("authUser");

  const seller = await getSellerByOwnerUserId(c.env, authUser.user_id);

  if (!seller && authUser.role !== "admin") {
    return c.json(
      { ok: false, code: "SELLER_NOT_FOUND", message: "Seller profile not found" },
      404
    );
  }

  return c.json({
    ok: true,
    data: {
      ...(seller || {}),
      user: {
        id: authUser.user_id,
        email: authUser.email,
        full_name: authUser.full_name,
        role: authUser.role
      }
    }
  });
});
