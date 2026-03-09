import { Hono } from "hono";
import { listProducts, getProductBySlug } from "../repositories/catalog.repository";

export const catalogRouter = new Hono<{ Bindings: import("../types").Bindings }>();

catalogRouter.get("/products", async (c) => {
  const sellerId = c.req.query("seller_id");
  const products = await listProducts(c.env, sellerId || undefined);
  return c.json({ ok: true, data: products });
});

catalogRouter.get("/products/id/:id", async (c) => {
  const id = c.req.param("id");

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
    where p.id = ?
    limit 1`
  )
    .bind(id)
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

catalogRouter.post("/products", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body?.title_ar || !body?.slug || !body?.price_mad || !body?.seller_id) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "Missing required fields" },
      400
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
      body.seller_id,
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

catalogRouter.put("/products/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);

  if (!body?.title_ar || !body?.price_mad) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "Missing required fields" },
      400
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

catalogRouter.delete("/products/:id", async (c) => {
  const id = c.req.param("id");

  const product = await c.env.DB.prepare(
    `select id from products where id = ? limit 1`
  )
    .bind(id)
    .first();

  if (!product) {
    return c.json(
      { ok: false, code: "NOT_FOUND", message: "Product not found" },
      404
    );
  }

  await c.env.DB.prepare(
    `delete from product_media where product_id = ?`
  )
    .bind(id)
    .run();

  await c.env.DB.prepare(
    `delete from products where id = ?`
  )
    .bind(id)
    .run();

  return c.json({
    ok: true,
    message: "Product deleted"
  });
});
