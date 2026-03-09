import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";

export const orderRouter = new Hono<{ Bindings: import("../types").Bindings }>();

orderRouter.get("/orders", authMiddleware, async (c) => {
  const authUser = c.get("authUser");
  const sellerId = c.req.query("seller_id");
  const buyerUserId = c.req.query("buyer_user_id");

  if (sellerId) {
    if (!["seller", "admin"].includes(authUser.role)) {
      return c.json({ ok: false, code: "FORBIDDEN", message: "Insufficient permissions" }, 403);
    }

    const rows = await c.env.DB.prepare(
      `select
        o.id,
        o.buyer_user_id,
        o.seller_id,
        o.order_status,
        o.payment_method,
        o.payment_status,
        o.shipping_status,
        o.total_mad,
        o.currency,
        o.created_at
      from orders o
      left join sellers s on s.id = o.seller_id
      where o.seller_id = ?
        and (? = 'admin' or s.owner_user_id = ?)
      order by o.created_at desc`
    )
      .bind(sellerId, authUser.role, authUser.user_id)
      .all();

    return c.json({ ok: true, data: rows.results || [] });
  }

  if (buyerUserId) {
    if (authUser.role !== "buyer" && authUser.role !== "admin") {
      return c.json({ ok: false, code: "FORBIDDEN", message: "Insufficient permissions" }, 403);
    }

    const rows = await c.env.DB.prepare(
      `select
        o.id,
        o.buyer_user_id,
        o.seller_id,
        o.order_status,
        o.payment_method,
        o.payment_status,
        o.shipping_status,
        o.total_mad,
        o.currency,
        o.created_at
      from orders o
      where o.buyer_user_id = ?
        and (? = 'admin' or o.buyer_user_id = ?)
      order by o.created_at desc`
    )
      .bind(buyerUserId, authUser.role, authUser.user_id)
      .all();

    return c.json({ ok: true, data: rows.results || [] });
  }

  if (authUser.role === "admin") {
    const rows = await c.env.DB.prepare(
      `select
        o.id,
        o.buyer_user_id,
        o.seller_id,
        o.order_status,
        o.payment_method,
        o.payment_status,
        o.shipping_status,
        o.total_mad,
        o.currency,
        o.created_at
      from orders o
      order by o.created_at desc`
    ).all();

    return c.json({ ok: true, data: rows.results || [] });
  }

  return c.json({ ok: true, data: [] });
});

orderRouter.get("/orders/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");

  const order = await c.env.DB.prepare(
    `select
      o.id,
      o.buyer_user_id,
      o.seller_id,
      o.order_status,
      o.payment_method,
      o.payment_status,
      o.shipping_status,
      o.total_mad,
      o.currency,
      o.created_at
    from orders o
    left join sellers s on s.id = o.seller_id
    where o.id = ?
      and (
        ? = 'admin'
        or (? = 'buyer' and o.buyer_user_id = ?)
        or (? = 'seller' and s.owner_user_id = ?)
      )
    limit 1`
  )
    .bind(id, authUser.role, authUser.role, authUser.user_id, authUser.role, authUser.user_id)
    .first();

  if (!order) {
    return c.json(
      { ok: false, code: "NOT_FOUND", message: "Order not found" },
      404
    );
  }

  const items = await c.env.DB.prepare(
    `select
      oi.id,
      oi.order_id,
      oi.product_id,
      oi.quantity,
      oi.unit_price_mad,
      p.slug,
      p.title_ar
    from order_items oi
    left join products p on p.id = oi.product_id
    where oi.order_id = ?
    order by oi.id asc`
  )
    .bind(id)
    .all();

  return c.json({
    ok: true,
    data: {
      ...order,
      items: items.results || []
    }
  });
});

orderRouter.post("/orders", authMiddleware, requireRole("buyer", "admin"), async (c) => {
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => null);

  if (
    !body?.seller_id ||
    !body?.payment_method ||
    !Array.isArray(body?.items) ||
    body.items.length === 0
  ) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "Missing required fields" },
      400
    );
  }

  const orderId = crypto.randomUUID();
  const buyerUserId = authUser.role === "admin" && body.buyer_user_id ? body.buyer_user_id : authUser.user_id;
  const sellerId = body.seller_id;
  const paymentMethod = body.payment_method;
  const paymentStatus = body.payment_status || "pending";
  const shippingStatus = body.shipping_status || "pending";
  const orderStatus = body.order_status || "pending";

  let totalMad = 0;

  for (const item of body.items) {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unit_price_mad || 0);
    totalMad += quantity * unitPrice;
  }

  await c.env.DB.prepare(
    `insert into orders (
      id,
      buyer_user_id,
      seller_id,
      order_status,
      payment_method,
      payment_status,
      shipping_status,
      total_mad,
      currency
    ) values (?, ?, ?, ?, ?, ?, ?, ?, 'MAD')`
  )
    .bind(
      orderId,
      buyerUserId,
      sellerId,
      orderStatus,
      paymentMethod,
      paymentStatus,
      shippingStatus,
      totalMad
    )
    .run();

  for (const item of body.items) {
    await c.env.DB.prepare(
      `insert into order_items (
        id,
        order_id,
        product_id,
        quantity,
        unit_price_mad
      ) values (?, ?, ?, ?, ?)`
    )
      .bind(
        crypto.randomUUID(),
        orderId,
        item.product_id,
        Number(item.quantity || 0),
        Number(item.unit_price_mad || 0)
      )
      .run();
  }

  return c.json(
    {
      ok: true,
      data: {
        id: orderId,
        seller_id: sellerId,
        total_mad: totalMad,
        order_status: orderStatus
      }
    },
    201
  );
});

orderRouter.patch("/orders/:id/status", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const id = c.req.param("id");
  const authUser = c.get("authUser");
  const body = await c.req.json().catch(() => null);
  const nextStatus = body?.order_status;

  if (!nextStatus || !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(nextStatus)) {
    return c.json(
      { ok: false, code: "INVALID_STATUS", message: "Invalid order status" },
      400
    );
  }

  const existing = await c.env.DB.prepare(
    `select o.id
     from orders o
     left join sellers s on s.id = o.seller_id
     where o.id = ?
       and (? = 'admin' or s.owner_user_id = ?)
     limit 1`
  )
    .bind(id, authUser.role, authUser.user_id)
    .first();

  if (!existing) {
    return c.json(
      { ok: false, code: "NOT_FOUND", message: "Order not found" },
      404
    );
  }

  await c.env.DB.prepare(
    `update orders
     set order_status = ?
     where id = ?`
  )
    .bind(nextStatus, id)
    .run();

  const updated = await c.env.DB.prepare(
    `select
      id,
      buyer_user_id,
      seller_id,
      order_status,
      payment_method,
      payment_status,
      shipping_status,
      total_mad,
      currency,
      created_at
    from orders
    where id = ?
    limit 1`
  )
    .bind(id)
    .first();

  return c.json({ ok: true, data: updated });
});
