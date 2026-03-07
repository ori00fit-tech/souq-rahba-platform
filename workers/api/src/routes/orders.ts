import { Hono } from "hono";

export const orderRouter = new Hono<{ Bindings: import("../types").Bindings }>();

orderRouter.post("/orders", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) {
    return c.json({ ok: false, code: "INVALID_BODY", message: "Invalid JSON" }, 400);
  }
  return c.json({
    ok: true,
    data: {
      id: crypto.randomUUID(),
      status: "pending_confirmation",
      paymentMethod: body.paymentMethod || "cod"
    }
  }, 201);
});
