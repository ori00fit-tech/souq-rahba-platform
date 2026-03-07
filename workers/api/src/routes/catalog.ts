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
  if (!product) return c.json({ ok: false, code: "NOT_FOUND", message: "Product not found" }, 404);
  return c.json({ ok: true, data: product });
});
