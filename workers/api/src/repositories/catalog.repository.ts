import type { Bindings } from "../types";
import { all, first } from "../lib/db";

export async function listProducts(env: Bindings) {
  return all(env, `select id, slug, title_ar, price_mad, stock, category, status from products order by created_at desc limit 24`);
}

export async function getProductBySlug(env: Bindings, slug: string) {
  return first(env, `select * from products where slug = ? limit 1`, slug);
}
