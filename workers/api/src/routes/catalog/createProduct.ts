import { createProduct } from "../../services/catalog.service";

export async function createProductHandler(c: any) {
  const body = await c.req.json();
  const result = await createProduct(body);
  return c.json(result, 201);
}
