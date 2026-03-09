import type { Bindings } from "../types";

export async function getSellerByOwnerUserId(env: Bindings, ownerUserId: string) {
  return env.DB.prepare(
    `select
      id,
      owner_user_id,
      slug,
      display_name,
      city,
      verified,
      kyc_status,
      rating,
      created_at
    from sellers
    where owner_user_id = ?
    limit 1`
  )
    .bind(ownerUserId)
    .first();
}

export async function sellerOwnsProduct(env: Bindings, productId: string, ownerUserId: string) {
  return env.DB.prepare(
    `select p.id
     from products p
     left join sellers s on s.id = p.seller_id
     where p.id = ?
       and s.owner_user_id = ?
     limit 1`
  )
    .bind(productId, ownerUserId)
    .first();
}

export async function sellerOwnsOrder(env: Bindings, orderId: string, ownerUserId: string) {
  return env.DB.prepare(
    `select o.id
     from orders o
     left join sellers s on s.id = o.seller_id
     where o.id = ?
       and s.owner_user_id = ?
     limit 1`
  )
    .bind(orderId, ownerUserId)
    .first();
}
