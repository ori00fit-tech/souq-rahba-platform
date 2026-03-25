import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import type { AppEnv } from "../types";

export const reviewsRouter = new Hono<AppEnv>();

reviewsRouter.get("/products/:slug/reviews", async (c) => {
  const slug = c.req.param("slug");

  const product = await c.env.DB.prepare(
    "select id from products where slug=?"
  ).bind(slug).first<{ id: string }>();

  if (!product) {
    return c.json(
      { ok: false, code: "NOT_FOUND", message: "Product not found" },
      404
    );
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

reviewsRouter.post(
  "/products/:slug/reviews",
  authMiddleware,
  requireRole("buyer"),
  async (c) => {
    const slug = c.req.param("slug");
    const body = await c.req.json().catch(() => null);

    if (!body || !body.rating || !body.comment?.trim()) {
      return c.json(
        { ok: false, code: "INVALID_REVIEW", message: "rating and comment are required" },
        400
      );
    }

    const product = await c.env.DB.prepare(
      "select id from products where slug=?"
    ).bind(slug).first<{ id: string }>();

    if (!product) {
      return c.json(
        { ok: false, code: "NOT_FOUND", message: "Product not found" },
        404
      );
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
      return c.json(
        {
          ok: false,
          code: "REVIEW_NOT_ALLOWED",
          message: "يمكنك التقييم فقط بعد شراء المنتج"
        },
        403
      );
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
    } catch {
      return c.json(
        {
          ok: false,
          code: "REVIEW_EXISTS",
          message: "review already exists"
        },
        400
      );
    }

    return c.json({
      ok: true,
      data: { id }
    });
  }
);

reviewsRouter.get("/products/:slug/similar", async (c) => {
  const slug = c.req.param("slug");

  const product = await c.env.DB.prepare(`
    select id, category_id
    from products
    where slug = ?
  `)
    .bind(slug)
    .first<{ id: string; category_id: string }>();

  if (!product) {
    return c.json(
      { ok: false, code: "NOT_FOUND", message: "Product not found" },
      404
    );
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
