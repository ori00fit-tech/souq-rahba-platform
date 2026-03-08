import { listOrders } from "../../services/order.service";

export async function listOrdersHandler(c: any) {
  const result = await listOrders();
  return c.json(result);
}
