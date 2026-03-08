import { getProductBySlug } from "../../services/catalog.service";

export async function getProductBySlugHandler(c: any) {
  const slug = c.req.param("slug");
  const result = await getProductBySlug(slug);
  return c.json(result);
}
