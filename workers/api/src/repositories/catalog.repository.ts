import type { Bindings } from "../types";
import { all, first } from "../lib/db";

export async function listProducts(env: Bindings, sellerId?: string) {
  if (sellerId) {
    return all(
      env,
      `select
        p.id,
        p.seller_id,
        p.slug,
        p.title_ar,
        p.description_ar,
        p.price_mad,
        p.stock,
        p.category_id,
        p.status,
        p.featured,
        p.created_at,
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
      where p.seller_id = ?
      order by p.created_at desc`,
      sellerId
    );
  }

  return all(
    env,
    `select
      p.id,
      p.seller_id,
      p.slug,
      p.title_ar,
      p.description_ar,
      p.price_mad,
      p.stock,
      p.category_id,
      p.status,
      p.featured,
      p.created_at,
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
    order by p.created_at desc
    limit 24`
  );
}

export async function getProductBySlug(env: Bindings, slug: string) {
  const product = await first(
    env,
    `select
      p.*,
      s.display_name as seller_name,
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
    left join sellers s on s.id = p.seller_id
    where p.slug = ?
    limit 1`,
    slug
  );

  if (!product?.id) {
    return product;
  }

  const media = await all(
    env,
    `select
      id,
      url,
      alt_text,
      sort_order
    from product_media
    where product_id = ?
    order by sort_order asc, id asc`,
    product.id
  );

  const specs = await all(
    env,
    `select
      id,
      label_ar,
      value_ar,
      sort_order
    from product_specs
    where product_id = ?
    order by sort_order asc, id asc`,
    product.id
  );

  const faqs = await all(
    env,
    `select
      id,
      question_ar,
      answer_ar,
      sort_order
    from product_faqs
    where product_id = ?
    order by sort_order asc, id asc`,
    product.id
  );

  return {
    ...product,
    media,
    specs,
    faqs
  };
}
