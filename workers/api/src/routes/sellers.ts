import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { getSellerByOwnerUserId } from "../repositories/access.repository";

export const sellerRouter = new Hono<{ Bindings: import("../types").Bindings }>();

function slugify(text: string) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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

sellerRouter.post("/onboarding", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => null);

  if (!body?.display_name) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "display_name is required" },
      400
    );
  }

  const existing = await getSellerByOwnerUserId(c.env, authUser.user_id);

  if (existing) {
    return c.json(
      { ok: false, code: "SELLER_EXISTS", message: "Seller profile already exists" },
      409
    );
  }

  const slug = body.slug ? slugify(body.slug) : slugify(body.display_name);

  if (!slug) {
    return c.json(
      { ok: false, code: "INVALID_SLUG", message: "Invalid seller slug" },
      400
    );
  }

  const slugExists = await c.env.DB.prepare(
    `select id from sellers where slug = ? limit 1`
  )
    .bind(slug)
    .first();

  if (slugExists) {
    return c.json(
      { ok: false, code: "SLUG_EXISTS", message: "Seller slug already exists" },
      409
    );
  }

  const sellerId = crypto.randomUUID();

  await c.env.DB.prepare(
    `insert into sellers (
      id,
      owner_user_id,
      slug,
      display_name,
      city,
      verified,
      kyc_status,
      rating
    ) values (?, ?, ?, ?, ?, 0, 'pending', 0)`
  )
    .bind(
      sellerId,
      authUser.user_id,
      slug,
      body.display_name,
      body.city || null
    )
    .run();

  const seller = await getSellerByOwnerUserId(c.env, authUser.user_id);

  return c.json(
    {
      ok: true,
      data: seller
    },
    201
  );
});
