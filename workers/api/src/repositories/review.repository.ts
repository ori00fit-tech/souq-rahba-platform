type Env = import("../types").Bindings;

export async function findApprovedReviewsForProduct(env: Env, productId: string) {
  const reviews = await env.DB.prepare(
    `
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
    `
  )
    .bind(productId)
    .all();

  return reviews.results || [];
}
