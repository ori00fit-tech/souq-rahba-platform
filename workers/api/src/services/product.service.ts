import {
  findProductDetailsBySlug,
  findSimilarProductsByCategory
} from "../repositories/product.repository";
import { findApprovedReviewsForProduct } from "../repositories/review.repository";

type Env = import("../types").Bindings;

export async function getFullProductPageData(env: Env, slug: string) {
  const product = await findProductDetailsBySlug(env, slug);

  if (!product) {
    return null;
  }

  const [reviews, similar] = await Promise.all([
    findApprovedReviewsForProduct(env, product.id),
    product.category_id
      ? findSimilarProductsByCategory(env, product.category_id, product.id)
      : Promise.resolve([])
  ]);

  return {
    product,
    reviews,
    similar
  };
}
