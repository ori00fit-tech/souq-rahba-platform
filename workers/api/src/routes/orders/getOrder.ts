import { getOrder } from "../../services/order.service";

export async function getOrderHandler(c: any) {
  const id = c.req.param("id");
  const result = await getOrder(id);
  return c.json(result);
}
