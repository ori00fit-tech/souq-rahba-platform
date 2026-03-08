import { Hono } from "hono";
import { listProducts, getProductBySlug } from "../repositories/catalog.repository";

export const catalogRouter = new Hono<{ Bindings: import("../types").Bindings }>();

catalogRouter.get("/products", async (c) => {
  const products = await listProducts(c.env);
  return c.json({ ok: true, data: products });
});

catalogRouter.get("/products/:slug", async (c) => {
  const slug = c.req.param("slug");
  const product = await getProductBySlug(c.env, slug);
  if (!product) {
    return c.json({ ok: false, code: "NOT_FOUND", message: "Product not found" }, 404);
  }
  return c.json({ ok: true, data: product });
});

catalogRouter.post("/products", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body?.title_ar || !body?.slug || !body?.price_mad || !body?.seller_id) {
    return c.json({ ok: false, code: "INVALID_BODY", message: "Missing required fields" }, 400);
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
      price_mad,
      stock,
      status
    ) values (?, ?, ?, ?, ?, ?, 'physical', 'new', ?, ?, 'active')`
  )
    .bind(
      id,
      body.seller_id,
      body.slug,
      body.title_ar,
      body.description_ar || null,
      body.category_id || null,
      body.price_mad,
      body.stock || 0
    )
    .run();

  return c.json({
    ok: true,
    data: {
      id,
      slug: body.slug,
      title_ar: body.title_ar,
      price_mad: body.price_mad,
    },
  }, 201);
});
