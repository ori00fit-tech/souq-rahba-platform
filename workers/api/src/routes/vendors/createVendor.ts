import { createVendor } from "../../services/vendor.service";

export async function createVendorHandler(c: any) {
  const body = await c.req.json();
  const result = await createVendor(body);
  return c.json(result, 201);
}
