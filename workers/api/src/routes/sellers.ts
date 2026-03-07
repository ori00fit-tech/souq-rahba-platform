import { Hono } from "hono";

export const sellerRouter = new Hono<{ Bindings: import("../types").Bindings }>();

sellerRouter.get("/sellers", async (c) => {
  const result = await c.env.DB.prepare(`select id, slug, display_name, city, verified, rating from sellers order by created_at desc limit 24`).all();
  return c.json({ ok: true, data: result.results });
});
