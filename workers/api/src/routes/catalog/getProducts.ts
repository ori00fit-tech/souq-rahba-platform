import { listProducts } from "../../services/catalog.service";

export async function getProductsHandler(c: any) {
  const result = await listProducts();
  return c.json(result);
}
