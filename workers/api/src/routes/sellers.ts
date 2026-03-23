import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import type { AppEnv } from "../types";

export const sellerRouter = new Hono<AppEnv>();

function normalizeText(input: unknown): string {
  return String(input || "").trim();
}

function normalizeSlug(input: unknown): string {
  return String(input || "").trim().toLowerCase();
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

function optionalText(input: unknown): string | null {
  const value = String(input || "").trim();
  return value ? value : null;
}

type SellerRow = {
  id: string;
  owner_user_id: string;
  slug: string;
  display_name: string | null;
  city: string | null;
  phone: string | null;
  category: string | null;
  description: string | null;
  verified: number | null;
  kyc_status: string | null;
  rating: number | null;
  created_at: string | null;
};

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
    .first<SellerRow>();

  return row || null;
}

sellerRouter.get("/me", authMiddleware, requireRole("seller", "admin"), async (c) => {
  try {
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
      data: seller
        ? {
            ...seller,
            role: authUser.role
          }
        : {
            role: authUser.role
          }
    });
  } catch (error) {
    console.error("GET /marketplace/me failed:", error);
    return c.json(
      { ok: false, code: "INTERNAL_ERROR", message: "Failed to load seller profile" },
      500
    );
  }
});

sellerRouter.post("/onboarding", authMiddleware, requireRole("seller", "admin"), async (c) => {
  try {
    const authUser = c.get("authUser");
    const body = await c.req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return c.json(
        { ok: false, code: "INVALID_BODY", message: "Invalid JSON body" },
        400
      );
    }

    const displayName = normalizeText(body.display_name);
    const slug = normalizeSlug(body.slug);
    const city = normalizeText(body.city);
    const phone = optionalText(body.phone);
    const category = optionalText(body.category);
    const description = optionalText(body.description);

    if (!displayName || !slug || !city) {
      return c.json(
        { ok: false, code: "INVALID_BODY", message: "display_name, slug and city are required" },
        400
      );
    }

    if (!isValidSlug(slug)) {
      return c.json(
        { ok: false, code: "INVALID_SLUG", message: "Invalid seller slug" },
        400
      );
    }

    const existingBySlug = await c.env.DB.prepare(
      `select id from sellers where slug = ? limit 1`
    )
      .bind(slug)
      .first<{ id: string }>();

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
        displayName,
        city,
        phone,
        category,
        description
      )
      .run();

    const seller = await getSellerByOwnerUserId(c.env, authUser.user_id);

    return c.json({
      ok: true,
      data: seller
    });
  } catch (error) {
    console.error("POST /marketplace/onboarding failed:", error);
    return c.json(
      { ok: false, code: "INTERNAL_ERROR", message: "Failed to create seller onboarding" },
      500
    );
  }
});

sellerRouter.put("/onboarding", authMiddleware, requireRole("seller", "admin"), async (c) => {
  try {
    const authUser = c.get("authUser");
    const body = await c.req.json().catch(() => null);

    const existingSeller = await getSellerByOwnerUserId(c.env, authUser.user_id);
    if (!existingSeller) {
      return c.json(
        { ok: false, code: "SELLER_NOT_FOUND", message: "Seller profile not found" },
        404
      );
    }

    if (!body || typeof body !== "object") {
      return c.json(
        { ok: false, code: "INVALID_BODY", message: "Invalid JSON body" },
        400
      );
    }

    const displayName = normalizeText(body.display_name);
    const slug = normalizeSlug(body.slug);
    const city = normalizeText(body.city);
    const phone = optionalText(body.phone);
    const category = optionalText(body.category);
    const description = optionalText(body.description);

    if (!displayName || !slug || !city) {
      return c.json(
        { ok: false, code: "INVALID_BODY", message: "display_name, slug and city are required" },
        400
      );
    }

    if (!isValidSlug(slug)) {
      return c.json(
        { ok: false, code: "INVALID_SLUG", message: "Invalid seller slug" },
        400
      );
    }

    const duplicateSlug = await c.env.DB.prepare(
      `select id from sellers where slug = ? and id != ? limit 1`
    )
      .bind(slug, existingSeller.id)
      .first<{ id: string }>();

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
        displayName,
        city,
        phone,
        category,
        description,
        authUser.user_id
      )
      .run();

    const seller = await getSellerByOwnerUserId(c.env, authUser.user_id);

    return c.json({
      ok: true,
      data: seller
    });
  } catch (error) {
    console.error("PUT /marketplace/onboarding failed:", error);
    return c.json(
      { ok: false, code: "INTERNAL_ERROR", message: "Failed to update seller profile" },
      500
    );
  }
});

sellerRouter.get("/public/:slug", async (c) => {
  try {
    const slug = normalizeSlug(c.req.param("slug"));

    if (!slug || !isValidSlug(slug)) {
      return c.json(
        { ok: false, code: "INVALID_SLUG", message: "Seller slug is required" },
        400
      );
    }

    const seller = await c.env.DB.prepare(
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
      where slug = ?
      limit 1`
    )
      .bind(slug)
      .first<SellerRow>();

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
  } catch (error) {
    console.error("GET /marketplace/public/:slug failed:", error);
    return c.json(
      { ok: false, code: "INTERNAL_ERROR", message: "Failed to load public seller profile" },
      500
    );
  }
});

export default sellerRouter;
