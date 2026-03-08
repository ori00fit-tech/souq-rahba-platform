import { getVendorProfile } from "../../services/vendor.service";

export async function getVendorProfileHandler(c: any) {
  const id = c.req.param("id");
  const result = await getVendorProfile(id);
  return c.json(result);
}
