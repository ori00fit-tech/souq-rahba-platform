import { createOrder } from "../../services/order.service";

export async function createOrderHandler(c: any) {
  const body = await c.req.json();
  const result = await createOrder(body);
  return c.json(result, 201);
}
