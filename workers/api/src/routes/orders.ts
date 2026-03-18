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
      return c.json(
        { ok: false, code: "FORBIDDEN", message: "Insufficient permissions" },
        403
      );
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
        o.created_at,
        u.full_name as buyer_name,
        u.phone as buyer_phone,
        u.city as buyer_city,
        u.address as buyer_address,
        (
          select count(*)
          from order_items oi
          where oi.order_id = o.id
        ) as items_count
      from orders o
      left join sellers s on s.id = o.seller_id
      left join users u on u.id = o.buyer_user_id
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
      return c.json(
        { ok: false, code: "FORBIDDEN", message: "Insufficient permissions" },
        403
      );
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
        o.created_at,
        u.full_name as buyer_name,
        u.phone as buyer_phone,
        u.city as buyer_city,
        u.address as buyer_address,
        (
          select count(*)
          from order_items oi
          where oi.order_id = o.id
        ) as items_count
      from orders o
      left join users u on u.id = o.buyer_user_id
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
        o.created_at,
        u.full_name as buyer_name,
        u.phone as buyer_phone,
        u.city as buyer_city,
        u.address as buyer_address,
        (
          select count(*)
          from order_items oi
          where oi.order_id = o.id
        ) as items_count
      from orders o
      left join users u on u.id = o.buyer_user_id
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
      o.created_at,
      u.full_name as buyer_name,
      u.phone as buyer_phone,
      u.city as buyer_city,
      u.address as buyer_address,
      s.display_name as seller_name
    from orders o
    left join sellers s on s.id = o.seller_id
    left join users u on u.id = o.buyer_user_id
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
      p.title_ar,
      (
        select pm.url
        from product_media pm
        where pm.product_id = p.id
        order by pm.sort_order asc
        limit 1
      ) as image_url
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

  const seller = await c.env.DB.prepare(
    `select id from sellers where id = ? limit 1`
  )
    .bind(body.seller_id)
    .first();

  if (!seller) {
    return c.json(
      { ok: false, code: "SELLER_NOT_FOUND", message: "Seller not found" },
      404
    );
  }

  const validatedItems = [];
  let totalMad = 0;

  for (const item of body.items) {
    if (!item?.product_id || !item?.quantity) {
      return c.json(
        { ok: false, code: "INVALID_ITEM", message: "Each item must include product_id and quantity" },
        400
      );
    }

    const quantity = Number(item.quantity || 0);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return c.json(
        { ok: false, code: "INVALID_QUANTITY", message: "Invalid quantity" },
        400
      );
    }

    const product = await c.env.DB.prepare(
      `select
        id,
        seller_id,
        title_ar,
        price_mad,
        stock,
        status
      from products
      where id = ?
      limit 1`
    )
      .bind(item.product_id)
      .first();

    if (!product) {
      return c.json(
        { ok: false, code: "PRODUCT_NOT_FOUND", message: `Product not found: ${item.product_id}` },
        404
      );
    }

    if (product.seller_id !== body.seller_id) {
      return c.json(
        { ok: false, code: "SELLER_MISMATCH", message: "All items must belong to the same seller" },
        400
      );
    }

    if (product.status !== "active") {
      return c.json(
        { ok: false, code: "PRODUCT_INACTIVE", message: `Product is not active: ${item.product_id}` },
        400
      );
    }

    if (Number(product.stock || 0) < quantity) {
      return c.json(
        { ok: false, code: "INSUFFICIENT_STOCK", message: `Insufficient stock for product: ${item.product_id}` },
        400
      );
    }

    const unitPrice = Number(product.price_mad || 0);
    totalMad += quantity * unitPrice;

    validatedItems.push({
      product_id: product.id,
      quantity,
      unit_price_mad: unitPrice
    });
  }

  const orderId = crypto.randomUUID();
  const buyerUserId =
    authUser.role === "admin" && body.buyer_user_id
      ? body.buyer_user_id
      : authUser.user_id;

  const paymentMethod = body.payment_method;
  const paymentStatus = body.payment_status || "pending";
  const shippingStatus = body.shipping_status || "pending";
  const orderStatus = body.order_status || "pending";

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
      body.seller_id,
      orderStatus,
      paymentMethod,
      paymentStatus,
      shippingStatus,
      totalMad
    )
    .run();

  for (const item of validatedItems) {
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
        item.quantity,
        item.unit_price_mad
      )
      .run();

    await c.env.DB.prepare(
      `update products
       set stock = stock - ?
       where id = ?`
    )
      .bind(item.quantity, item.product_id)
      .run();
  }

  return c.json(
    {
      ok: true,
      data: {
        id: orderId,
        buyer_user_id: buyerUserId,
        seller_id: body.seller_id,
        order_status: orderStatus,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        shipping_status: shippingStatus,
        total_mad: totalMad,
        currency: "MAD"
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

  if (!nextStatus) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "order_status is required" },
      400
    );
  }

  const allowedStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

  if (!allowedStatuses.includes(nextStatus)) {
    return c.json(
      { ok: false, code: "INVALID_STATUS", message: "Invalid order status" },
      400
    );
  }

  const existing = await c.env.DB.prepare(
    `select
      o.id,
      o.order_status
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

  let shippingStatus = undefined;
  if (nextStatus === "pending") shippingStatus = "pending";
  if (nextStatus === "confirmed") shippingStatus = "pending";
  if (nextStatus === "shipped") shippingStatus = "shipped";
  if (nextStatus === "delivered") shippingStatus = "delivered";
  if (nextStatus === "cancelled") shippingStatus = "cancelled";

  await c.env.DB.prepare(
    `update orders
     set
       order_status = ?,
       shipping_status = ?
     where id = ?`
  )
    .bind(nextStatus, shippingStatus, id)
    .run();

  const updated = await c.env.DB.prepare(
    `select
      id,
      order_status,
      shipping_status
    from orders
    where id = ?
    limit 1`
  )
    .bind(id)
    .first();

  return c.json({ ok: true, data: updated });
});
