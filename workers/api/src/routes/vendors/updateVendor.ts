import { updateVendor } from "../../services/vendor.service";

export async function updateVendorHandler(c: any) {
  const id = c.req.param("id");
  const body = await c.req.json();
  const result = await updateVendor(id, body);
  return c.json(result);
}
