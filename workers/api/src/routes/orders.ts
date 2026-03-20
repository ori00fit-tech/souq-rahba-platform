import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import type { AppEnv } from "../types";
import { notifyNewOrder } from "../lib/notifications";

export const orderRouter = new Hono<AppEnv>();

type OptionalAuthUser = {
  user_id: string;
  role: "buyer" | "seller" | "admin";
  email: string | null;
  full_name: string | null;
  phone: string | null;
};

function makeOrderNumber() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const short = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `RB-${year}-${short}`;
}

async function getOptionalAuthUser(c: any): Promise<OptionalAuthUser | null> {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const session = await c.env.DB.prepare(
    `
    select
      s.user_id as user_id,
      u.role as role,
      u.email as email,
      u.full_name as full_name,
      u.phone as phone
    from sessions s
    join users u on u.id = s.user_id
    where s.token = ?
      and (s.expires_at is null or datetime(s.expires_at) > datetime('now'))
    limit 1
    `
  )
    .bind(token)
    .first();

  return (session as OptionalAuthUser | null) || null;
}

function normalizeStatusInput(value: string) {
  const status = String(value || "").trim().toLowerCase();
  const allowed = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  return allowed.includes(status) ? status : null;
}

function normalizeShippingStatus(orderStatus: string) {
  switch (orderStatus) {
    case "pending":
      return "pending";
    case "confirmed":
      return "pending";
    case "processing":
      return "processing";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

function normalizePaymentStatus(paymentMethod: string, orderStatus: string) {
  if (orderStatus === "cancelled") return "cancelled";
  if (paymentMethod === "cod") {
    return orderStatus === "delivered" ? "paid" : "unpaid";
  }
  return "unpaid";
}

/**
 * GET /orders
 * - buyer: يقدر يشوف غير طلباته
 * - seller: يقدر يشوف طلبات seller_id ديالو
 * - admin: يقدر يشوف الكل أو حسب buyer/seller
 */
orderRouter.get("/orders", authMiddleware, async (c) => {
  try {
    const authUser = c.get("authUser");
    const sellerId = c.req.query("seller_id");
    const buyerUserId = c.req.query("buyer_user_id");

    if (authUser.role === "buyer") {
      const rows = await c.env.DB.prepare(
        `
        select
          o.*,
          s.display_name as seller_name
        from orders o
        left join sellers s on s.id = o.seller_id
        where o.buyer_user_id = ?
        order by datetime(o.created_at) desc
        `
      )
        .bind(authUser.user_id)
        .all();

      return c.json({ ok: true, data: rows.results || [] });
    }

    if (authUser.role === "seller") {
      if (!sellerId) {
        return c.json(
          { ok: false, code: "SELLER_ID_REQUIRED", message: "seller_id is required" },
          400
        );
      }

      const sellerAccess = await c.env.DB.prepare(
        `select id from sellers where id = ? and owner_user_id = ? limit 1`
      )
        .bind(sellerId, authUser.user_id)
        .first();

      if (!sellerAccess) {
        return c.json({ ok: false, code: "FORBIDDEN", message: "Forbidden" }, 403);
      }

      const rows = await c.env.DB.prepare(
        `
        select
          o.*,
          s.display_name as seller_name
        from orders o
        left join sellers s on s.id = o.seller_id
        where o.seller_id = ?
        order by datetime(o.created_at) desc
        `
      )
        .bind(sellerId)
        .all();

      return c.json({ ok: true, data: rows.results || [] });
    }

    // admin
    if (sellerId) {
      const rows = await c.env.DB.prepare(
        `
        select
          o.*,
          s.display_name as seller_name
        from orders o
        left join sellers s on s.id = o.seller_id
        where o.seller_id = ?
        order by datetime(o.created_at) desc
        `
      )
        .bind(sellerId)
        .all();

      return c.json({ ok: true, data: rows.results || [] });
    }

    if (buyerUserId) {
      const rows = await c.env.DB.prepare(
        `
        select
          o.*,
          s.display_name as seller_name
        from orders o
        left join sellers s on s.id = o.seller_id
        where o.buyer_user_id = ?
        order by datetime(o.created_at) desc
        `
      )
        .bind(buyerUserId)
        .all();

      return c.json({ ok: true, data: rows.results || [] });
    }

    const rows = await c.env.DB.prepare(
      `
      select
        o.*,
        s.display_name as seller_name
      from orders o
      left join sellers s on s.id = o.seller_id
      order by datetime(o.created_at) desc
      limit 100
      `
    ).all();

    return c.json({ ok: true, data: rows.results || [] });
  } catch (error) {
    console.error("GET /orders failed", error);
    return c.json(
      { ok: false, code: "ORDERS_LIST_FAILED", message: "Failed to load orders" },
      500
    );
  }
});

/**
 * POST /orders
 * هذا هو المسار المفتوح للضيف أو للمستخدم المسجل
 */
orderRouter.post("/orders", async (c) => {
  try {
    const authUser = await getOptionalAuthUser(c);
    const body = await c.req.json().catch(() => null);

    if (!body) {
      return c.json(
        { ok: false, code: "INVALID_JSON", message: "Invalid request body" },
        400
      );
    }

    const sellerId = String(body.seller_id || "").trim();
    const items = Array.isArray(body.items) ? body.items : [];

    const buyerName = String(body.buyer_name || authUser?.full_name || "").trim();
    const buyerPhone = String(body.buyer_phone || authUser?.phone || "").trim();
    const buyerCity = String(body.buyer_city || "").trim();
    const buyerAddress = String(body.buyer_address || "").trim();
    const notes = body.notes ? String(body.notes).trim() : null;
    const paymentMethod = String(body.payment_method || "cod").trim().toLowerCase();

    if (!sellerId) {
      return c.json(
        { ok: false, code: "SELLER_ID_REQUIRED", message: "seller_id is required" },
        400
      );
    }

    if (!items.length) {
      return c.json(
        { ok: false, code: "ITEMS_REQUIRED", message: "Order items are required" },
        400
      );
    }

    if (!buyerName) {
      return c.json(
        { ok: false, code: "BUYER_NAME_REQUIRED", message: "Buyer name is required" },
        400
      );
    }

    if (!buyerPhone) {
      return c.json(
        { ok: false, code: "BUYER_PHONE_REQUIRED", message: "Buyer phone is required" },
        400
      );
    }

    if (!buyerCity) {
      return c.json(
        { ok: false, code: "BUYER_CITY_REQUIRED", message: "Buyer city is required" },
        400
      );
    }

    if (!buyerAddress) {
      return c.json(
        { ok: false, code: "BUYER_ADDRESS_REQUIRED", message: "Buyer address is required" },
        400
      );
    }

    if (paymentMethod !== "cod") {
      return c.json(
        {
          ok: false,
          code: "PAYMENT_METHOD_NOT_SUPPORTED",
          message: "Only cash on delivery is supported حاليا"
        },
        400
      );
    }

    const seller = await c.env.DB.prepare(
      `select id, display_name from sellers where id = ? limit 1`
    )
      .bind(sellerId)
      .first<{ id: string; display_name: string | null }>();

    if (!seller) {
      return c.json(
        { ok: false, code: "SELLER_NOT_FOUND", message: "Seller not found" },
        404
      );
    }

    let subtotalMad = 0;
    const validatedItems: Array<{
      product_id: string;
      quantity: number;
      unit_price_mad: number;
      product_name: string;
    }> = [];

    for (const item of items) {
      const productId = String(item?.product_id || "").trim();
      const quantity = Number(item?.quantity || 0);

      if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
        return c.json(
          { ok: false, code: "INVALID_ITEM", message: "Invalid order item" },
          400
        );
      }

      const product = await c.env.DB.prepare(
        `
        select
          id,
          seller_id,
          price_mad,
          stock,
          status,
          title_ar
        from products
        where id = ?
        limit 1
        `
      )
        .bind(productId)
        .first<{
          id: string;
          seller_id: string;
          price_mad: number;
          stock: number | null;
          status: string | null;
          title_ar: string | null;
        }>();

      if (!product) {
        return c.json(
          { ok: false, code: "PRODUCT_NOT_FOUND", message: "Invalid product" },
          404
        );
      }

      if (product.seller_id !== sellerId) {
        return c.json(
          {
            ok: false,
            code: "MIXED_SELLER_NOT_ALLOWED",
            message: "All products must belong to the same seller"
          },
          400
        );
      }

      if (product.status && product.status !== "active") {
        return c.json(
          {
            ok: false,
            code: "PRODUCT_NOT_ACTIVE",
            message: "One or more products are not available"
          },
          400
        );
      }

      if (product.stock !== null && Number(product.stock) < quantity) {
        return c.json(
          {
            ok: false,
            code: "INSUFFICIENT_STOCK",
            message: "Insufficient stock for one or more products"
          },
          400
        );
      }

      const unitPriceMad = Number(product.price_mad || 0);
      subtotalMad += unitPriceMad * quantity;

      validatedItems.push({
        product_id: product.id,
        quantity,
        unit_price_mad: unitPriceMad,
        product_name: product.title_ar || "منتج"
      });
    }

    const shippingMad = 0;
    const totalMad = subtotalMad + shippingMad;
    const orderId = crypto.randomUUID();
    const orderNumber = makeOrderNumber();
    const buyerUserId = authUser?.user_id ?? null;
    const orderStatus = "pending";
    const paymentStatus = normalizePaymentStatus(paymentMethod, orderStatus);
    const shippingStatus = normalizeShippingStatus(orderStatus);

    await c.env.DB.prepare(
      `
      insert into orders (
        id,
        order_number,
        buyer_user_id,
        seller_id,
        order_status,
        payment_method,
        payment_status,
        shipping_status,
        total_mad,
        buyer_name,
        buyer_phone,
        buyer_city,
        buyer_address,
        notes
      )
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        orderId,
        orderNumber,
        buyerUserId,
        sellerId,
        orderStatus,
        paymentMethod,
        paymentStatus,
        shippingStatus,
        totalMad,
        buyerName,
        buyerPhone,
        buyerCity,
        buyerAddress,
        notes
      )
      .run();

    for (const item of validatedItems) {
      await c.env.DB.prepare(
        `
        insert into order_items (
          id,
          order_id,
          product_id,
          quantity,
          unit_price_mad
        )
        values (?, ?, ?, ?, ?)
        `
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
        `
        update products
        set stock = case
          when stock is null then null
          else max(stock - ?, 0)
        end
        where id = ?
        `
      )
        .bind(item.quantity, item.product_id)
        .run();
    }

    c.executionCtx.waitUntil(
      notifyNewOrder({
        order_number: orderNumber,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        buyer_city: buyerCity,
        total_mad: totalMad,
        items: validatedItems.map((item) => ({
          name: item.product_name,
          quantity: item.quantity
        })),
        seller_name: seller.display_name || "RAHBA",
        seller_phone: null
      })
    );

    return c.json({
      ok: true,
      data: {
        id: orderId,
        order_number: orderNumber,
        total_mad: totalMad,
        order_status: orderStatus,
        payment_method: paymentMethod,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        buyer_city: buyerCity,
        buyer_address: buyerAddress
      }
    });
  } catch (error) {
    console.error("POST /orders failed", error);
    return c.json(
      { ok: false, code: "ORDER_CREATE_FAILED", message: "Failed to create order" },
      500
    );
  }
});

/**
 * GET /orders/:id
 * route محمي
 */
orderRouter.get("/orders/:id", authMiddleware, async (c) => {
  try {
    const authUser = c.get("authUser");
    const id = c.req.param("id");

    const order = await c.env.DB.prepare(
      `
      select
        o.*,
        s.display_name as seller_name,
        s.owner_user_id as seller_owner_user_id
      from orders o
      left join sellers s on s.id = o.seller_id
      where o.id = ?
      limit 1
      `
    )
      .bind(id)
      .first<any>();

    if (!order) {
      return c.json(
        { ok: false, code: "ORDER_NOT_FOUND", message: "Order not found" },
        404
      );
    }

    const isBuyerOwner =
      authUser.role === "buyer" && order.buyer_user_id === authUser.user_id;

    const isSellerOwner =
      authUser.role === "seller" && order.seller_owner_user_id === authUser.user_id;

    const isAdmin = authUser.role === "admin";

    if (!isBuyerOwner && !isSellerOwner && !isAdmin) {
      return c.json(
        { ok: false, code: "FORBIDDEN", message: "Forbidden" },
        403
      );
    }

    const itemsRes = await c.env.DB.prepare(
      `
      select
        oi.*,
        p.title_ar,
        p.slug,
        p.image_url
      from order_items oi
      left join products p on p.id = oi.product_id
      where oi.order_id = ?
      order by oi.rowid asc
      `
    )
      .bind(id)
      .all();

    return c.json({
      ok: true,
      data: {
        ...order,
        items: itemsRes.results || []
      }
    });
  } catch (error) {
    console.error("GET /orders/:id failed", error);
    return c.json(
      { ok: false, code: "ORDER_DETAILS_FAILED", message: "Failed to load order details" },
      500
    );
  }
});

/**
 * PATCH /orders/:id/status
 * محمي للبائع أو admin
 */
orderRouter.patch(
  "/orders/:id/status",
  authMiddleware,
  requireRole("seller", "admin"),
  async (c) => {
    try {
      const authUser = c.get("authUser");
      const id = c.req.param("id");
      const body = await c.req.json().catch(() => null);

      const nextStatus = normalizeStatusInput(String(body?.order_status || ""));
      const trackingNumber = body?.tracking_number
        ? String(body.tracking_number).trim()
        : null;

      if (!nextStatus) {
        return c.json(
          { ok: false, code: "INVALID_STATUS", message: "Invalid order status" },
          400
        );
      }

      const order = await c.env.DB.prepare(
        `
        select
          o.id,
          o.seller_id,
          s.owner_user_id as seller_owner_user_id,
          o.payment_method
        from orders o
        left join sellers s on s.id = o.seller_id
        where o.id = ?
        limit 1
        `
      )
        .bind(id)
        .first<any>();

      if (!order) {
        return c.json(
          { ok: false, code: "ORDER_NOT_FOUND", message: "Order not found" },
          404
        );
      }

      if (
        authUser.role === "seller" &&
        order.seller_owner_user_id !== authUser.user_id
      ) {
        return c.json(
          { ok: false, code: "FORBIDDEN", message: "Forbidden" },
          403
        );
      }

      const shippingStatus = normalizeShippingStatus(nextStatus);
      const paymentStatus = normalizePaymentStatus(order.payment_method || "cod", nextStatus);

      await c.env.DB.prepare(
        `
        update orders
        set
          order_status = ?,
          shipping_status = ?,
          payment_status = ?,
          tracking_number = coalesce(?, tracking_number)
        where id = ?
        `
      )
        .bind(nextStatus, shippingStatus, paymentStatus, trackingNumber, id)
        .run();

      const updated = await c.env.DB.prepare(
        `select * from orders where id = ? limit 1`
      )
        .bind(id)
        .first();

      return c.json({ ok: true, data: updated });
    } catch (error) {
      console.error("PATCH /orders/:id/status failed", error);
      return c.json(
        { ok: false, code: "ORDER_STATUS_UPDATE_FAILED", message: "Failed to update order status" },
        500
      );
    }
  }
);

export default orderRouter;
