import { Hono } from "hono";
import type { AppEnv } from "../types";

export const homeRouter = new Hono<AppEnv>();

homeRouter.get("/home", async (c) => {
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
      s.display_name as seller_name
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
