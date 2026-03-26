import { Hono } from "hono";
import { listProducts, getProductBySlug } from "../repositories/catalog.repository";
import { ok, fail } from "../utils/response";

export const catalogRouter = new Hono<import("../types").AppEnv>();

catalogRouter.get("/categories", async (c) => {
  const result = await c.env.DB.prepare(
    `
    select
      id,
      slug,
      name_ar,
      name_fr,
      name_en,
      parent_id,
      sort_order,
      is_active
    from categories
    where is_active = 1
    order by sort_order asc, name_ar asc, id asc
    `
  ).all();

  return c.json(
    ok(result.results || [])
  );
});

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

    return c.json(
      ok({
        items: products,
        pagination: {
          page: 1,
          limit: 12,
          total: Array.isArray(products) ? products.length : 0,
          pages: 1
        }
      })
    );
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

  return c.json(
    ok({
      items: itemsResult.results || [],
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })
  );
});

catalogRouter.get("/products/:slug", async (c) => {
  const slug = c.req.param("slug");
  const product = await getProductBySlug(c.env, slug);

  if (!product) {
    return c.json(
      fail("NOT_FOUND", "Product not found"),
      404
    );
  }

  return c.json(
    ok(product)
  );
});
