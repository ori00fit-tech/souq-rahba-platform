import { Hono } from "hono";
import { listProducts, getProductBySlug } from "../repositories/catalog.repository";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";

export const catalogRouter = new Hono<{ Bindings: import("../types").Bindings }>();

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
        order by pm.sort_order asc
        limit 1
      ) as image_url
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
      p.category_id,
      p.sku,
      p.price_mad,
      p.stock,
      p.status,
      (
        select pm.url
        from product_media pm
        where pm.product_id = p.id
        order by pm.sort_order asc
        limit 1
      ) as image_url
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

  return c.json({ ok: true, data: result });
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

  if (!body?.title_ar || !body?.slug || !body?.price_mad) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "Missing required fields" },
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

  const sellerId = authUser.role === "admin" && body.seller_id ? body.seller_id : seller.id;
  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `insert into products (
      id,
      seller_id,
      slug,
      title_ar,
      description_ar,
      category_id,
      product_kind,
      condition_label,
      sku,
      price_mad,
      stock,
      status
    ) values (?, ?, ?, ?, ?, ?, 'physical', 'new', ?, ?, ?, 'active')`
  )
    .bind(
      id,
      sellerId,
      body.slug,
      body.title_ar,
      body.description_ar || null,
      body.category_id || null,
      body.sku || null,
      body.price_mad,
      body.stock || 0
    )
    .run();

  if (body.image_key) {
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

  return c.json(
    {
      ok: true,
      data: {
        id,
        slug: body.slug,
        title_ar: body.title_ar,
        price_mad: body.price_mad,
        stock: body.stock || 0
      }
    },
    201
  );
});

catalogRouter.put("/products/:id", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => null);

  if (!body?.title_ar || !body?.price_mad) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "Missing required fields" },
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

  await c.env.DB.prepare(
    `update products
     set
       title_ar = ?,
       description_ar = ?,
       category_id = ?,
       sku = ?,
       price_mad = ?,
       stock = ?
     where id = ?`
  )
    .bind(
      body.title_ar,
      body.description_ar || null,
      body.category_id || null,
      body.sku || null,
      body.price_mad,
      body.stock || 0,
      id
    )
    .run();

  if (body.image_key) {
    const imageUrl = `${new URL(c.req.url).origin}/media/${body.image_key}`;

    const existingMedia = await c.env.DB.prepare(
      `select id
       from product_media
       where product_id = ?
       order by sort_order asc
       limit 1`
    )
      .bind(id)
      .first();

    if (existingMedia?.id) {
      await c.env.DB.prepare(
        `update product_media
         set url = ?, alt_text = ?
         where id = ?`
      )
        .bind(imageUrl, body.title_ar, existingMedia.id)
        .run();
    } else {
      const mediaId = crypto.randomUUID();

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
        .bind(mediaId, id, imageUrl, body.title_ar)
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
      p.category_id,
      p.sku,
      p.price_mad,
      p.stock,
      p.status,
      (
        select pm.url
        from product_media pm
        where pm.product_id = p.id
        order by pm.sort_order asc
        limit 1
      ) as image_url
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

  await c.env.DB.prepare(`delete from product_media where product_id = ?`)
    .bind(id)
    .run();

  await c.env.DB.prepare(`delete from products where id = ?`)
    .bind(id)
    .run();

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
    return c.json({ ok:false, message:"product not found" },404);
  }

  const reviews = await c.env.DB.prepare(`
    select
      r.id,
      r.rating,
      r.title,
      r.comment,
      r.created_at
    from product_reviews r
    where r.product_id = ?
    and r.is_approved = 1
    order by r.created_at desc
    limit 20
  `)
  .bind(product.id)
  .all();

  return c.json({
    ok:true,
    data:reviews.results
  });
});

catalogRouter.post(
  "/products/:slug/reviews",
  authMiddleware,
  requireRole("buyer"),
  async (c) => {

  const slug = c.req.param("slug");
  const body = await c.req.json();

  if (!body.rating) {
    return c.json({ ok:false,message:"rating required"},400);
  }

  const product = await c.env.DB.prepare(
    "select id from products where slug=?"
  ).bind(slug).first();

  if (!product) {
    return c.json({ ok:false,message:"product not found"},404);
  }

  const authUser = c.get("authUser");

  const id = crypto.randomUUID();

  try {

    await c.env.DB.prepare(`
      insert into product_reviews
      (id,product_id,buyer_user_id,rating,title,comment)
      values (?,?,?,?,?,?)
    `)
    .bind(
      id,
      product.id,
      authUser.user_id,
      body.rating,
      body.title || null,
      body.comment || null
    )
    .run();

  } catch(e) {

    return c.json({
      ok:false,
      message:"review already exists"
    },400);

  }

  return c.json({
    ok:true,
    data:{ id }
  });
});
