import { Hono } from "hono";
import { listProducts, getProductBySlug } from "../repositories/catalog.repository";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";

export const catalogRouter = new Hono<import("../types").AppEnv>();

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

catalogRouter.get("/products", async (c) => {
  const sellerId = c.req.query("seller_id");
  const q = (c.req.query("q") || "").trim();
  const category = (c.req.query("category") || "").trim();
  const sort = (c.req.query("sort") || "newest").trim();
  const page = Math.max(parseInt(c.req.query("page") || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(c.req.query("limit") || "12", 10) || 12, 1), 48);
  const offset = (page - 1) * limit;

  if (!q && !category && !sellerId && sort === "newest" && page === 1 && limit === 12) {
    const products = await listProducts(c.env, sellerId || undefined);
    return c.json({
      ok: true,
      data: {
        items: products,
        pagination: {
          page: 1,
          limit: 12,
          total: Array.isArray(products) ? products.length : 0,
          pages: 1
        }
      }
    });
  }

  const whereParts: string[] = [`p.status = 'active'`];
  const binds: unknown[] = [];

  if (sellerId) {
    whereParts.push(`p.seller_id = ?`);
    binds.push(sellerId);
  }

  if (q) {
    whereParts.push(`(p.title_ar like ? or ifnull(p.description_ar, '') like ?)`);
    binds.push(`%${q}%`, `%${q}%`);
  }

  if (category) {
    whereParts.push(`c.slug = ?`);
    binds.push(category);
  }

  const whereSql = whereParts.length ? `where ${whereParts.join(" and ")}` : "";

  let orderBySql = `order by p.created_at desc`;
  if (sort === "price_asc") {
    orderBySql = `order by p.price_mad asc, p.created_at desc`;
  } else if (sort === "price_desc") {
    orderBySql = `order by p.price_mad desc, p.created_at desc`;
  } else if (sort === "featured") {
    orderBySql = `order by p.featured desc, p.created_at desc`;
  } else if (sort === "stock_desc") {
    orderBySql = `order by p.stock desc, p.created_at desc`;
  }

  const totalRow = await c.env.DB.prepare(
    `
    select count(*) as total
    from products p
    left join categories c on c.id = p.category_id
    ${whereSql}
    `
  )
    .bind(...binds)
    .first<{ total: number }>();

  const itemsResult = await c.env.DB.prepare(
    `
    select
      p.id,
      p.seller_id,
      p.slug,
      p.title_ar,
      p.description_ar,
      p.description_long_ar,
      p.landing_html_ar,
      p.category_id,
      c.slug as category_slug,
      p.price_mad,
      p.stock,
      p.status,
      p.featured,
      p.created_at,
      (
        select pm.url
        from product_media pm
        where pm.product_id = p.id
        order by pm.sort_order asc, pm.id asc
        limit 1
      ) as image_url,
      (
        select pm.url
        from product_media pm
        where pm.product_id = p.id
        order by pm.sort_order asc
        limit 1
      ) as image_url,
      (
        select round(avg(r.rating), 1)
        from product_reviews r
        where r.product_id = p.id
          and r.is_approved = 1
      ) as rating_avg,
      (
        select count(*)
        from product_reviews r
        where r.product_id = p.id
          and r.is_approved = 1
      ) as reviews_count
    from products p
    left join categories c on c.id = p.category_id
    ${whereSql}
    ${orderBySql}
    limit ? offset ?
    `
  )
    .bind(...binds, limit, offset)
    .all();

  const total = Number(totalRow?.total || 0);
  const pages = Math.max(Math.ceil(total / limit), 1);

  return c.json({
    ok: true,
    data: {
      items: itemsResult.results || [],
      pagination: {
        page,
        limit,
        total,
        pages
      }
    }
  });
});

catalogRouter.get("/products/id/:id", authMiddleware, requireRole("seller", "admin"), async (c) => {
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
      { ok: false, code: "NOT_FOUND", message: "Product not found" },
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

  return c.json({
    ok: true,
    data: {
      ...result,
      media: media.results || [],
      specs: specs.results || [],
      faqs: faqs.results || []
    }
  });
});

catalogRouter.get("/products/:slug", async (c) => {
  const slug = c.req.param("slug");
  const product = await getProductBySlug(c.env, slug);

  if (!product) {
    return c.json(
      { ok: false, code: "NOT_FOUND", message: "Product not found" },
      404
    );
  }

  return c.json({ ok: true, data: product });
});

catalogRouter.post("/products", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "Invalid JSON body" },
      400
    );
  }

  const titleAr = String(body.title_ar || "").trim();
  const slug = normalizeSlug(body.slug);
  const categoryId = String(body.category_id || "").trim();
  const priceMad = parseNonNegativeNumber(body.price_mad);
  const stock = parseNonNegativeInteger(body.stock, 0);

  if (!titleAr) {
    return c.json(
      { ok: false, code: "INVALID_TITLE", message: "title_ar is required" },
      400
    );
  }

  if (!slug) {
    return c.json(
      { ok: false, code: "INVALID_SLUG", message: "slug is required" },
      400
    );
  }

  if (!isValidSlug(slug)) {
    return c.json(
      {
        ok: false,
        code: "INVALID_SLUG_FORMAT",
        message: "slug must contain only lowercase latin letters, numbers, and dashes"
      },
      400
    );
  }

  if (!categoryId) {
    return c.json(
      { ok: false, code: "CATEGORY_REQUIRED", message: "category_id is required" },
      400
    );
  }

  if (priceMad === null) {
    return c.json(
      { ok: false, code: "INVALID_PRICE", message: "price_mad must be a non-negative number" },
      400
    );
  }

  if (stock === null) {
    return c.json(
      { ok: false, code: "INVALID_STOCK", message: "stock must be a non-negative integer" },
      400
    );
  }

  const seller = await c.env.DB.prepare(
    `select id from sellers where owner_user_id = ? limit 1`
  )
    .bind(authUser.user_id)
    .first();

  if (!seller && authUser.role !== "admin") {
    return c.json(
      { ok: false, code: "SELLER_NOT_FOUND", message: "Seller profile not found" },
      404
    );
  }

  const sellerId = authUser.role === "admin" && body.seller_id ? body.seller_id : seller!.id;

  const sellerExists = await c.env.DB.prepare(
    `select id from sellers where id = ? limit 1`
  )
    .bind(sellerId)
    .first();

  if (!sellerExists) {
    return c.json(
      { ok: false, code: "INVALID_SELLER", message: "seller does not exist" },
      400
    );
  }

  const category = await c.env.DB.prepare(
    `select id from categories where id = ? and is_active = 1 limit 1`
  )
    .bind(categoryId)
    .first();

  if (!category) {
    return c.json(
      { ok: false, code: "INVALID_CATEGORY", message: "category does not exist" },
      400
    );
  }

  const existingSlug = await c.env.DB.prepare(
    `select id from products where slug = ? limit 1`
  )
    .bind(slug)
    .first();

  if (existingSlug) {
    return c.json(
      { ok: false, code: "SLUG_EXISTS", message: "slug already exists" },
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
    ) values (?, ?, ?, ?, ?, ?, ?, ?, 'physical', 'new', ?, ?, ?, 'active', ?)`
  )
    .bind(
      id,
      sellerId,
      slug,
      titleAr,
      body.description_ar || null,
      body.description_long_ar || null,
      body.landing_html_ar || null,
      categoryId,
      body.sku || null,
      priceMad,
      stock,
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
    {
      ok: true,
      data: {
        id,
        slug,
        title_ar: titleAr,
        category_id: categoryId,
        price_mad: priceMad,
        stock
      }
    },
    201
  );
});

catalogRouter.put("/products/:id", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "Invalid JSON body" },
      400
    );
  }

  const titleAr = String(body.title_ar || "").trim();
  const slug = normalizeSlug(body.slug);
  const categoryId = String(body.category_id || "").trim();
  const priceMad = parseNonNegativeNumber(body.price_mad);
  const stock = parseNonNegativeInteger(body.stock, 0);

  if (!titleAr) {
    return c.json(
      { ok: false, code: "INVALID_TITLE", message: "title_ar is required" },
      400
    );
  }

  if (!slug) {
    return c.json(
      { ok: false, code: "INVALID_SLUG", message: "slug is required" },
      400
    );
  }

  if (!isValidSlug(slug)) {
    return c.json(
      {
        ok: false,
        code: "INVALID_SLUG_FORMAT",
        message: "slug must contain only lowercase latin letters, numbers, and dashes"
      },
      400
    );
  }

  if (!categoryId) {
    return c.json(
      { ok: false, code: "CATEGORY_REQUIRED", message: "category_id is required" },
      400
    );
  }

  if (priceMad === null) {
    return c.json(
      { ok: false, code: "INVALID_PRICE", message: "price_mad must be a non-negative number" },
      400
    );
  }

  if (stock === null) {
    return c.json(
      { ok: false, code: "INVALID_STOCK", message: "stock must be a non-negative integer" },
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
    .first();

  if (!existing) {
    return c.json(
      { ok: false, code: "NOT_FOUND", message: "Product not found" },
      404
    );
  }

  const category = await c.env.DB.prepare(
    `select id from categories where id = ? and is_active = 1 limit 1`
  )
    .bind(categoryId)
    .first();

  if (!category) {
    return c.json(
      { ok: false, code: "INVALID_CATEGORY", message: "category does not exist" },
      400
    );
  }

  const existingSlug = await c.env.DB.prepare(
    `select id from products where slug = ? and id <> ? limit 1`
  )
    .bind(slug, id)
    .first();

  if (existingSlug) {
    return c.json(
      { ok: false, code: "SLUG_EXISTS", message: "slug already exists" },
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
       featured = ?
     where id = ?`
  )
    .bind(
      titleAr,
      slug,
      body.description_ar || null,
      body.description_long_ar || null,
      body.landing_html_ar || null,
      categoryId,
      body.sku || null,
      priceMad,
      stock,
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

  return c.json({ ok: true, data: updated });
});

catalogRouter.delete("/products/:id", authMiddleware, requireRole("seller", "admin"), async (c) => {
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
    .first();

  if (!existing) {
    return c.json(
      { ok: false, code: "NOT_FOUND", message: "Product not found" },
      404
    );
  }

  await c.env.DB.prepare(`delete from product_media where product_id = ?`).bind(id).run();
  await c.env.DB.prepare(`delete from product_specs where product_id = ?`).bind(id).run();
  await c.env.DB.prepare(`delete from product_faqs where product_id = ?`).bind(id).run();
  await c.env.DB.prepare(`delete from products where id = ?`).bind(id).run();

  return c.json({
    ok: true,
    message: "Product deleted"
  });
});

catalogRouter.get("/home", async (c) => {
  const categoriesRows = await c.env.DB.prepare(`
    select
      id,
      slug,
      name_ar,
      name_fr,
      name_en,
      sort_order
    from categories
    where is_active = 1
    order by sort_order asc
    limit 12
  `).all();

  const featuredProductsRows = await c.env.DB.prepare(`
    select
      p.id,
      p.slug,
      p.title_ar,
      p.description_ar,
      p.price_mad,
      p.stock,
      p.category_id,
      p.created_at,
      (
        select pm.url
        from product_media pm
        where pm.product_id = p.id
        order by pm.sort_order asc, pm.id asc
        limit 1
      ) as image_url,
      s.display_name as seller_name,
      (
        select pm.url
        from product_media pm
        where pm.product_id = p.id
        order by pm.sort_order asc
        limit 1
      ) as image_url
    from products p
    left join sellers s on s.id = p.seller_id
    where p.status = 'active'
      and p.featured = 1
    order by p.created_at desc
    limit 8
  `).all();

  const featuredSellersRows = await c.env.DB.prepare(`
    select
      id,
      slug,
      display_name,
      city,
      logo_url,
      verified,
      kyc_status,
      rating
    from sellers
    where verified = 1
      and kyc_status = 'approved'
    order by rating desc, created_at desc
    limit 6
  `).all();

  return c.json({
    ok: true,
    data: {
      categories: categoriesRows.results || [],
      featured_products: featuredProductsRows.results || [],
      featured_sellers: featuredSellersRows.results || []
    }
  });
});

catalogRouter.get("/products/:slug/reviews", async (c) => {
  const slug = c.req.param("slug");

  const product = await c.env.DB.prepare(
    "select id from products where slug=?"
  ).bind(slug).first();

  if (!product) {
    return c.json({ ok: false, message: "product not found" }, 404);
  }

  const reviews = await c.env.DB.prepare(`
    select
      r.id,
      r.rating,
      r.title,
      r.comment,
      r.review_image_url,
      r.created_at,
      u.full_name as buyer_name
    from product_reviews r
    left join users u on u.id = r.buyer_user_id
    where r.product_id = ?
      and r.is_approved = 1
    order by r.created_at desc
    limit 20
  `)
    .bind(product.id)
    .all();

  return c.json({
    ok: true,
    data: reviews.results || []
  });
});

catalogRouter.post(
  "/products/:slug/reviews",
  authMiddleware,
  requireRole("buyer"),
  async (c) => {
    const slug = c.req.param("slug");
    const body = await c.req.json().catch(() => null);

    if (!body || !body.rating || !body.comment?.trim()) {
      return c.json(
        { ok: false, message: "rating and comment required" },
        400
      );
    }

    const product = await c.env.DB.prepare(
      "select id from products where slug=?"
    ).bind(slug).first();

    if (!product) {
      return c.json({ ok: false, message: "product not found" }, 404);
    }

    const authUser = c.get("authUser");

    const purchased = await c.env.DB.prepare(`
      select oi.product_id
      from order_items oi
      join orders o on o.id = oi.order_id
      where oi.product_id = ?
        and o.buyer_user_id = ?
      limit 1
    `)
      .bind(product.id, authUser.user_id)
      .first();

    if (!purchased) {
      return c.json({
        ok: false,
        message: "يمكنك التقييم فقط بعد شراء المنتج"
      }, 403);
    }

    const id = crypto.randomUUID();

    try {
      await c.env.DB.prepare(`
        insert into product_reviews
        (id, product_id, buyer_user_id, rating, title, comment, review_image_url)
        values (?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(
          id,
          product.id,
          authUser.user_id,
          body.rating,
          body.title || null,
          body.comment || null,
          body.review_image_url || null
        )
        .run();
    } catch (e) {
      return c.json({
        ok: false,
        message: "review already exists"
      }, 400);
    }

    return c.json({
      ok: true,
      data: { id }
    });
  }
);

catalogRouter.get("/products/:slug/similar", async (c) => {
  const slug = c.req.param("slug");

  const product = await c.env.DB.prepare(`
    select id, category_id
    from products
    where slug = ?
  `)
    .bind(slug)
    .first();

  if (!product) {
    return c.json({ ok: false }, 404);
  }

  const rows = await c.env.DB.prepare(`
    select
      p.id,
      p.slug,
      p.title_ar,
      p.description_ar,
      p.price_mad,
      (
        select pm.url
        from product_media pm
        where pm.product_id = p.id
        order by pm.sort_order asc
        limit 1
      ) as image_url
    from products p
    where p.category_id = ?
      and p.id != ?
      and p.status = 'active'
    order by p.created_at desc
    limit 6
  `)
    .bind(product.category_id, product.id)
    .all();

  return c.json({
    ok: true,
    data: rows.results || []
  });
});
