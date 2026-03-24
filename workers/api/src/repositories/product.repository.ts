type Env = import("../types").Bindings;

type ProductRow = {
  id: string;
  seller_id: string | null;
  slug: string;
  title_ar: string | null;
  description_ar: string | null;
  description_long_ar: string | null;
  landing_html_ar: string | null;
  category_id: string | null;
  sku: string | null;
  price_mad: number | null;
  stock: number | null;
  status: string | null;
  featured: number | null;
  created_at: string | null;
  seller_name?: string | null;
  category_slug?: string | null;
  image_url?: string | null;
  rating_avg?: number | null;
  reviews_count?: number | null;
};

export async function findProductDetailsBySlug(env: Env, slug: string) {
  const product = await env.DB.prepare(
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
      p.sku,
      p.price_mad,
      p.stock,
      p.status,
      p.featured,
      p.created_at,
      s.display_name as seller_name,
      c.slug as category_slug,
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
    left join sellers s on s.id = p.seller_id
    left join categories c on c.id = p.category_id
    where p.slug = ?
      and p.status = 'active'
    limit 1
    `
  )
    .bind(slug)
    .first<ProductRow>();

  if (!product?.id) {
    return null;
  }

  const media = await env.DB.prepare(
    `
    select
      id,
      media_type,
      url,
      alt_text,
      sort_order
    from product_media
    where product_id = ?
    order by sort_order asc, id asc
    `
  )
    .bind(product.id)
    .all();

  const specs = await env.DB.prepare(
    `
    select
      id,
      label_ar,
      value_ar,
      sort_order
    from product_specs
    where product_id = ?
    order by sort_order asc, id asc
    `
  )
    .bind(product.id)
    .all();

  const faqs = await env.DB.prepare(
    `
    select
      id,
      question_ar,
      answer_ar,
      sort_order
    from product_faqs
    where product_id = ?
    order by sort_order asc, id asc
    `
  )
    .bind(product.id)
    .all();

  return {
    ...product,
    media: media.results || [],
    specs: specs.results || [],
    faqs: faqs.results || []
  };
}

export async function findSimilarProductsByCategory(
  env: Env,
  categoryId: string,
  currentProductId: string
) {
  const rows = await env.DB.prepare(
    `
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
        order by pm.sort_order asc, pm.id asc
        limit 1
      ) as image_url
    from products p
    where p.category_id = ?
      and p.id != ?
      and p.status = 'active'
    order by p.created_at desc
    limit 6
    `
  )
    .bind(categoryId, currentProductId)
    .all();

  return rows.results || [];
}
