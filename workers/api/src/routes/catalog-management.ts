import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { ok, fail } from "../utils/response";

export const catalogManagementRouter = new Hono<import("../types").AppEnv>();

function normalizeSlug(input: unknown): string {
  return String(input || "").trim().toLowerCase();
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

function parseNonNegativeNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseNonNegativeInteger(value: unknown, fallback = 0): number | null {
  const raw = value === undefined || value === null || value === "" ? fallback : value;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function normalizeProductStatus(input: unknown): "active" | "draft" | "archived" | null {
  const status = String(input || "").trim().toLowerCase();
  if (!status) return "active";
  if (status === "active" || status === "draft" || status === "archived") {
    return status;
  }
  return null;
}

function sanitizeHtml(input: unknown): string | null {
  const html = String(input || "").trim();
  if (!html) return null;

  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<(iframe|object|embed|link|meta)[^>]*?>[\s\S]*?<\/(iframe|object|embed)>/gi, "")
    .replace(/<(iframe|object|embed|link|meta)[^>]*?\/?>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

catalogManagementRouter.get("/products/id/:id", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");

  const result = await c.env.DB.prepare(
    `select
      p.id,
      p.seller_id,
      p.slug,
      p.title_ar,
      p.description_ar,
      p.description_long_ar,
      p.landing_html_ar,
      p.category_id,
      p.sku,
      p.price_mad,
      p.stock,
      p.status,
      p.featured
    from products p
    left join sellers s on s.id = p.seller_id
    where p.id = ?
      and (? = 'admin' or s.owner_user_id = ?)
    limit 1`
  )
    .bind(id, authUser.role, authUser.user_id)
    .first();

  if (!result) {
    return c.json(
      fail("NOT_FOUND", "Product not found"),
      404
    );
  }

  const media = await c.env.DB.prepare(`
    select id, url, alt_text, sort_order
    from product_media
    where product_id = ?
    order by sort_order asc, id asc
  `).bind(id).all();

  const specs = await c.env.DB.prepare(`
    select id, label_ar, value_ar, sort_order
    from product_specs
    where product_id = ?
    order by sort_order asc, id asc
  `).bind(id).all();

  const faqs = await c.env.DB.prepare(`
    select id, question_ar, answer_ar, sort_order
    from product_faqs
    where product_id = ?
    order by sort_order asc, id asc
  `).bind(id).all();

  return c.json(
    ok({
      ...result,
      media: media.results || [],
      specs: specs.results || [],
      faqs: faqs.results || []
    })
  );
});

catalogManagementRouter.post("/products", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return c.json(
      fail("INVALID_BODY", "Invalid JSON body"),
      400
    );
  }

  const titleAr = String(body.title_ar || "").trim();
  const slug = normalizeSlug(body.slug);
  const categoryId = String(body.category_id || "").trim();
  const status = normalizeProductStatus(body.status);
  const priceMad = parseNonNegativeNumber(body.price_mad);
  const stock = parseNonNegativeInteger(body.stock, 0);

  if (!titleAr) {
    return c.json(
      fail("INVALID_TITLE", "title_ar is required"),
      400
    );
  }

  if (!slug) {
    return c.json(
      fail("INVALID_SLUG", "slug is required"),
      400
    );
  }

  if (!isValidSlug(slug)) {
    return c.json(
      fail("INVALID_SLUG_FORMAT", "slug must contain only lowercase latin letters, numbers, and dashes"),
      400
    );
  }

  if (!categoryId) {
    return c.json(
      fail("CATEGORY_REQUIRED", "category_id is required"),
      400
    );
  }

  if (status === null) {
    return c.json(
      fail("INVALID_STATUS", "status must be active, draft, or archived"),
      400
    );
  }

  if (priceMad === null) {
    return c.json(
      fail("INVALID_PRICE", "price_mad must be a non-negative number"),
      400
    );
  }

  if (stock === null) {
    return c.json(
      fail("INVALID_STOCK", "stock must be a non-negative integer"),
      400
    );
  }

  const seller = await c.env.DB.prepare(
    `select id from sellers where owner_user_id = ? limit 1`
  )
    .bind(authUser.user_id)
    .first<{ id: string }>();

  if (!seller && authUser.role !== "admin") {
    return c.json(
      fail("SELLER_NOT_FOUND", "Seller profile not found"),
      404
    );
  }

  const sellerId = authUser.role === "admin" && body.seller_id ? body.seller_id : seller!.id;

  const sellerExists = await c.env.DB.prepare(
    `select id from sellers where id = ? limit 1`
  )
    .bind(sellerId)
    .first<{ id: string }>();

  if (!sellerExists) {
    return c.json(
      fail("INVALID_SELLER", "seller does not exist"),
      400
    );
  }

  const category = await c.env.DB.prepare(
    `select id from categories where id = ? and is_active = 1 limit 1`
  )
    .bind(categoryId)
    .first<{ id: string }>();

  if (!category) {
    return c.json(
      fail("INVALID_CATEGORY", "category does not exist"),
      400
    );
  }

  const existingSlug = await c.env.DB.prepare(
    `select id from products where slug = ? limit 1`
  )
    .bind(slug)
    .first<{ id: string }>();

  if (existingSlug) {
    return c.json(
      fail("SLUG_EXISTS", "slug already exists"),
      409
    );
  }

  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `insert into products (
      id,
      seller_id,
      slug,
      title_ar,
      description_ar,
      description_long_ar,
      landing_html_ar,
      category_id,
      product_kind,
      condition_label,
      sku,
      price_mad,
      stock,
      status,
      featured
    ) values (?, ?, ?, ?, ?, ?, ?, ?, 'physical', 'new', ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      sellerId,
      slug,
      titleAr,
      body.description_ar || null,
      body.description_long_ar || null,
      sanitizeHtml(body.landing_html_ar),
      categoryId,
      body.sku || null,
      priceMad,
      stock,
      status,
      body.featured ? 1 : 0
    )
    .run();

  if (Array.isArray(body.images)) {
    for (let i = 0; i < body.images.length; i += 1) {
      const img = body.images[i];
      if (!img?.url) continue;

      await c.env.DB.prepare(
        `insert into product_media (
          id,
          product_id,
          media_type,
          url,
          alt_text,
          sort_order
        ) values (?, ?, 'image', ?, ?, ?)`
      )
        .bind(
          crypto.randomUUID(),
          id,
          img.url,
          img.alt_text || body.title_ar,
          i
        )
        .run();
    }
  } else if (body.image_key) {
    const mediaId = crypto.randomUUID();
    const mediaUrl = `${new URL(c.req.url).origin}/media/${body.image_key}`;

    await c.env.DB.prepare(
      `insert into product_media (
        id,
        product_id,
        media_type,
        url,
        alt_text,
        sort_order
      ) values (?, ?, 'image', ?, ?, 0)`
    )
      .bind(mediaId, id, mediaUrl, body.title_ar)
      .run();
  }

  if (Array.isArray(body.specs)) {
    for (let i = 0; i < body.specs.length; i += 1) {
      const spec = body.specs[i];
      if (!spec?.label_ar || !spec?.value_ar) continue;

      await c.env.DB.prepare(
        `insert into product_specs (
          id,
          product_id,
          label_ar,
          value_ar,
          sort_order
        ) values (?, ?, ?, ?, ?)`
      )
        .bind(
          crypto.randomUUID(),
          id,
          spec.label_ar,
          spec.value_ar,
          i
        )
        .run();
    }
  }

  if (Array.isArray(body.faqs)) {
    for (let i = 0; i < body.faqs.length; i += 1) {
      const faq = body.faqs[i];
      if (!faq?.question_ar || !faq?.answer_ar) continue;

      await c.env.DB.prepare(
        `insert into product_faqs (
          id,
          product_id,
          question_ar,
          answer_ar,
          sort_order
        ) values (?, ?, ?, ?, ?)`
      )
        .bind(
          crypto.randomUUID(),
          id,
          faq.question_ar,
          faq.answer_ar,
          i
        )
        .run();
    }
  }

  return c.json(
    ok({
      id,
      slug,
      title_ar: titleAr,
      category_id: categoryId,
      price_mad: priceMad,
      stock
    }),
    201
  );
});

catalogManagementRouter.put("/products/:id", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return c.json(
      fail("INVALID_BODY", "Invalid JSON body"),
      400
    );
  }

  const titleAr = String(body.title_ar || "").trim();
  const slug = normalizeSlug(body.slug);
  const categoryId = String(body.category_id || "").trim();
  const status = normalizeProductStatus(body.status);
  const priceMad = parseNonNegativeNumber(body.price_mad);
  const stock = parseNonNegativeInteger(body.stock, 0);

  if (!titleAr) {
    return c.json(
      fail("INVALID_TITLE", "title_ar is required"),
      400
    );
  }

  if (!slug) {
    return c.json(
      fail("INVALID_SLUG", "slug is required"),
      400
    );
  }

  if (!isValidSlug(slug)) {
    return c.json(
      fail("INVALID_SLUG_FORMAT", "slug must contain only lowercase latin letters, numbers, and dashes"),
      400
    );
  }

  if (!categoryId) {
    return c.json(
      fail("CATEGORY_REQUIRED", "category_id is required"),
      400
    );
  }

  if (status === null) {
    return c.json(
      fail("INVALID_STATUS", "status must be active, draft, or archived"),
      400
    );
  }

  if (priceMad === null) {
    return c.json(
      fail("INVALID_PRICE", "price_mad must be a non-negative number"),
      400
    );
  }

  if (stock === null) {
    return c.json(
      fail("INVALID_STOCK", "stock must be a non-negative integer"),
      400
    );
  }

  const existing = await c.env.DB.prepare(
    `select p.id
     from products p
     left join sellers s on s.id = p.seller_id
     where p.id = ?
       and (? = 'admin' or s.owner_user_id = ?)
     limit 1`
  )
    .bind(id, authUser.role, authUser.user_id)
    .first<{ id: string }>();

  if (!existing) {
    return c.json(
      fail("NOT_FOUND", "Product not found"),
      404
    );
  }

  const category = await c.env.DB.prepare(
    `select id from categories where id = ? and is_active = 1 limit 1`
  )
    .bind(categoryId)
    .first<{ id: string }>();

  if (!category) {
    return c.json(
      fail("INVALID_CATEGORY", "category does not exist"),
      400
    );
  }

  const existingSlug = await c.env.DB.prepare(
    `select id from products where slug = ? and id <> ? limit 1`
  )
    .bind(slug, id)
    .first<{ id: string }>();

  if (existingSlug) {
    return c.json(
      fail("SLUG_EXISTS", "slug already exists"),
      409
    );
  }

  await c.env.DB.prepare(
    `update products
     set
       title_ar = ?,
       slug = ?,
       description_ar = ?,
       description_long_ar = ?,
       landing_html_ar = ?,
       category_id = ?,
       sku = ?,
       price_mad = ?,
       stock = ?,
       status = ?,
       featured = ?
     where id = ?`
  )
    .bind(
      titleAr,
      slug,
      body.description_ar || null,
      body.description_long_ar || null,
      sanitizeHtml(body.landing_html_ar),
      categoryId,
      body.sku || null,
      priceMad,
      stock,
      status,
      body.featured ? 1 : 0,
      id
    )
    .run();

  if (Array.isArray(body.images)) {
    await c.env.DB.prepare(`delete from product_media where product_id = ?`)
      .bind(id)
      .run();

    for (let i = 0; i < body.images.length; i += 1) {
      const img = body.images[i];
      if (!img?.url) continue;

      await c.env.DB.prepare(
        `insert into product_media (
          id,
          product_id,
          media_type,
          url,
          alt_text,
          sort_order
        ) values (?, ?, 'image', ?, ?, ?)`
      )
        .bind(
          crypto.randomUUID(),
          id,
          img.url,
          img.alt_text || body.title_ar,
          i
        )
        .run();
    }
  }

  await c.env.DB.prepare(`delete from product_specs where product_id = ?`)
    .bind(id)
    .run();

  if (Array.isArray(body.specs)) {
    for (let i = 0; i < body.specs.length; i += 1) {
      const spec = body.specs[i];
      if (!spec?.label_ar || !spec?.value_ar) continue;

      await c.env.DB.prepare(
        `insert into product_specs (
          id,
          product_id,
          label_ar,
          value_ar,
          sort_order
        ) values (?, ?, ?, ?, ?)`
      )
        .bind(
          crypto.randomUUID(),
          id,
          spec.label_ar,
          spec.value_ar,
          i
        )
        .run();
    }
  }

  await c.env.DB.prepare(`delete from product_faqs where product_id = ?`)
    .bind(id)
    .run();

  if (Array.isArray(body.faqs)) {
    for (let i = 0; i < body.faqs.length; i += 1) {
      const faq = body.faqs[i];
      if (!faq?.question_ar || !faq?.answer_ar) continue;

      await c.env.DB.prepare(
        `insert into product_faqs (
          id,
          product_id,
          question_ar,
          answer_ar,
          sort_order
        ) values (?, ?, ?, ?, ?)`
      )
        .bind(
          crypto.randomUUID(),
          id,
          faq.question_ar,
          faq.answer_ar,
          i
        )
        .run();
    }
  }

  const updated = await c.env.DB.prepare(
    `select
      p.id,
      p.seller_id,
      p.slug,
      p.title_ar,
      p.description_ar,
      p.description_long_ar,
      p.landing_html_ar,
      p.category_id,
      p.sku,
      p.price_mad,
      p.stock,
      p.status,
      p.featured
    from products p
    where p.id = ?
    limit 1`
  )
    .bind(id)
    .first();

  return c.json(
    ok(updated)
  );
});

catalogManagementRouter.delete("/products/:id", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");

  const existing = await c.env.DB.prepare(
    `select p.id
     from products p
     left join sellers s on s.id = p.seller_id
     where p.id = ?
       and (? = 'admin' or s.owner_user_id = ?)
     limit 1`
  )
    .bind(id, authUser.role, authUser.user_id)
    .first<{ id: string }>();

  if (!existing) {
    return c.json(
      fail("NOT_FOUND", "Product not found"),
      404
    );
  }

  await c.env.DB.prepare(`delete from product_media where product_id = ?`).bind(id).run();
  await c.env.DB.prepare(`delete from product_specs where product_id = ?`).bind(id).run();
  await c.env.DB.prepare(`delete from product_faqs where product_id = ?`).bind(id).run();
  await c.env.DB.prepare(`delete from products where id = ?`).bind(id).run();

  return c.json(
    ok({
      message: "Product deleted"
    })
  );
});
