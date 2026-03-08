import type { Bindings } from "../types";
import { all, first } from "../lib/db";

export async function listProducts(env: Bindings) {
  return all(
    env,
    `select
      p.id,
      p.slug,
      p.title_ar,
      p.description_ar,
      p.price_mad,
      p.stock,
      p.category_id,
      p.status,
      p.created_at,
      (
        select pm.url
        from product_media pm
        where pm.product_id = p.id
        order by pm.sort_order asc
        limit 1
      ) as image_url
    from products p
    order by p.created_at desc
    limit 24`
  );
}

export async function getProductBySlug(env: Bindings, slug: string) {
  return first(
    env,
    `select
      p.*,
      (
        select pm.url
        from product_media pm
        where pm.product_id = p.id
        order by pm.sort_order asc
        limit 1
      ) as image_url
    from products p
    where p.slug = ?
    limit 1`,
    slug
  );
}
