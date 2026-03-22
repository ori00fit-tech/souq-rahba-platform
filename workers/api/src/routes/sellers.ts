import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import type { AppEnv } from "../types";

export const sellerRouter = new Hono<AppEnv>();

async function getSellerByOwnerUserId(env: AppEnv["Bindings"], ownerUserId: string) {
  const row = await env.DB.prepare(
    `select
      id,
      owner_user_id,
      slug,
      display_name,
      city,
      phone,
      category,
      description,
      verified,
      kyc_status,
      rating,
      created_at
    from sellers
    where owner_user_id = ?
    limit 1`
  )
    .bind(ownerUserId)
    .first();

  return row || null;
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
      role: authUser.role
    }
  });
});

sellerRouter.post("/onboarding", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => null);

  if (!body?.display_name || !body?.slug || !body?.city) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "display_name, slug and city are required" },
      400
    );
  }

  const slug = String(body.slug || "").trim().toLowerCase();

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return c.json(
      { ok: false, code: "INVALID_SLUG", message: "Invalid seller slug" },
      400
    );
  }

  const existingBySlug = await c.env.DB.prepare(
    `select id from sellers where slug = ? limit 1`
  )
    .bind(slug)
    .first();

  if (existingBySlug) {
    return c.json(
      { ok: false, code: "SLUG_EXISTS", message: "Seller slug already exists" },
      409
    );
  }

  const existingSeller = await getSellerByOwnerUserId(c.env, authUser.user_id);
  if (existingSeller) {
    return c.json(
      { ok: false, code: "SELLER_EXISTS", message: "Seller profile already exists" },
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
      phone,
      category,
      description,
      verified,
      kyc_status
    ) values (?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending')`
  )
    .bind(
      sellerId,
      authUser.user_id,
      slug,
      String(body.display_name || "").trim(),
      String(body.city || "").trim(),
      String(body.phone || "").trim() || null,
      String(body.category || "").trim() || null,
      String(body.description || "").trim() || null
    )
    .run();

  const seller = await getSellerByOwnerUserId(c.env, authUser.user_id);

  return c.json({
    ok: true,
    data: seller
  });
});

sellerRouter.put("/onboarding", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => null);

  const existingSeller = await getSellerByOwnerUserId(c.env, authUser.user_id);
  if (!existingSeller) {
    return c.json(
      { ok: false, code: "SELLER_NOT_FOUND", message: "Seller profile not found" },
      404
    );
  }

  if (!body?.display_name || !body?.slug || !body?.city) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "display_name, slug and city are required" },
      400
    );
  }

  const slug = String(body.slug || "").trim().toLowerCase();

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return c.json(
      { ok: false, code: "INVALID_SLUG", message: "Invalid seller slug" },
      400
    );
  }

  const duplicateSlug = await c.env.DB.prepare(
    `select id from sellers where slug = ? and id != ? limit 1`
  )
    .bind(slug, existingSeller.id)
    .first();

  if (duplicateSlug) {
    return c.json(
      { ok: false, code: "SLUG_EXISTS", message: "Seller slug already exists" },
      409
    );
  }

  await c.env.DB.prepare(
    `update sellers
     set slug = ?,
         display_name = ?,
         city = ?,
         phone = ?,
         category = ?,
         description = ?
     where owner_user_id = ?`
  )
    .bind(
      slug,
      String(body.display_name || "").trim(),
      String(body.city || "").trim(),
      String(body.phone || "").trim() || null,
      String(body.category || "").trim() || null,
      String(body.description || "").trim() || null,
      authUser.user_id
    )
    .run();

  const seller = await getSellerByOwnerUserId(c.env, authUser.user_id);

  return c.json({
    ok: true,
    data: seller
  });
});

sellerRouter.get("/public/:slug", async (c) => {
  const slug = String(c.req.param("slug") || "").trim().toLowerCase();

  if (!slug) {
    return c.json(
      { ok: false, code: "INVALID_SLUG", message: "Seller slug is required" },
      400
    );
  }

  const seller = await c.env.DB.prepare(
    `select
      id,
      slug,
      display_name,
      city,
      phone,
      category,
      description,
      verified,
      kyc_status,
      rating,
      created_at
    from sellers
    where slug = ?
    limit 1`
  )
    .bind(slug)
    .first();

  if (!seller) {
    return c.json(
      { ok: false, code: "SELLER_NOT_FOUND", message: "Seller not found" },
      404
    );
  }

  return c.json({
    ok: true,
    data: {
      id: seller.id,
      slug: seller.slug,
      display_name: seller.display_name,
      city: seller.city,
      phone: seller.phone,
      category: seller.category,
      description: seller.description,
      verified: Number(seller.verified || 0),
      kyc_status: seller.kyc_status || "pending",
      rating: Number(seller.rating || 0),
      created_at: seller.created_at
    }
  });
});

export default sellerRouter;
