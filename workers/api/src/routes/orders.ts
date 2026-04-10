import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import { rateLimit } from "../middleware/rateLimit";
import { ok, fail } from "../utils/response";
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

function normalizeMoroccanPhone(input: unknown): string {
  const raw = String(input || "").trim().replace(/\s+/g, "");
  if (!raw) return "";

  if (raw.startsWith("+212")) return `0${raw.slice(4)}`;
  if (raw.startsWith("212")) return `0${raw.slice(3)}`;
  return raw;
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
 * - buyer: يشوف غير طلباته
 * - seller: يشوف طلبات seller_id ديالو
 * - admin: يشوف الكل أو حسب buyer/seller
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
          s.display_name as seller_name,
          (select count(*) from order_items oi where oi.order_id = o.id) as items_count
        from orders o
        left join sellers s on s.id = o.seller_id
        where o.buyer_user_id = ?
        order by datetime(o.created_at) desc
        `
      )
        .bind(authUser.user_id)
        .all();

      return c.json(ok(rows.results || []));
    }

    if (authUser.role === "seller") {
      if (!sellerId) {
        return c.json(
          fail("SELLER_ID_REQUIRED", "seller_id is required"),
          400
        );
      }

      const sellerAccess = await c.env.DB.prepare(
        `select id from sellers where id = ? and owner_user_id = ? limit 1`
      )
        .bind(sellerId, authUser.user_id)
        .first();

      if (!sellerAccess) {
        return c.json(
          fail("FORBIDDEN", "Forbidden"),
          403
        );
      }

      const rows = await c.env.DB.prepare(
        `
        select
          o.*,
          s.display_name as seller_name,
          (select count(*) from order_items oi where oi.order_id = o.id) as items_count
        from orders o
        left join sellers s on s.id = o.seller_id
        where o.seller_id = ?
        order by datetime(o.created_at) desc
        `
      )
        .bind(sellerId)
        .all();

      return c.json(ok(rows.results || []));
    }

    if (sellerId) {
      const rows = await c.env.DB.prepare(
        `
        select
          o.*,
          s.display_name as seller_name,
          (select count(*) from order_items oi where oi.order_id = o.id) as items_count
        from orders o
        left join sellers s on s.id = o.seller_id
        where o.seller_id = ?
        order by datetime(o.created_at) desc
        `
      )
        .bind(sellerId)
        .all();

      return c.json(ok(rows.results || []));
    }

    if (buyerUserId) {
      const rows = await c.env.DB.prepare(
        `
        select
          o.*,
          s.display_name as seller_name,
          (select count(*) from order_items oi where oi.order_id = o.id) as items_count
        from orders o
        left join sellers s on s.id = o.seller_id
        where o.buyer_user_id = ?
        order by datetime(o.created_at) desc
        `
      )
        .bind(buyerUserId)
        .all();

      return c.json(ok(rows.results || []));
    }

    const rows = await c.env.DB.prepare(
      `
      select
        o.*,
        s.display_name as seller_name,
        (select count(*) from order_items oi where oi.order_id = o.id) as items_count
      from orders o
      left join sellers s on s.id = o.seller_id
      order by datetime(o.created_at) desc
      limit 100
      `
    ).all();

    return c.json(ok(rows.results || []));
  } catch (error) {
    console.error("GET /orders failed", error);
    return c.json(
      fail("ORDERS_LIST_FAILED", "Failed to load orders"),
      500
    );
  }
});

orderRouter.get("/stats", authMiddleware, requireRole("seller", "admin"), async (c) => {
  try {
    const authUser = c.get("authUser");
    const sellerId = c.req.query("seller_id");

    if (!sellerId) {
      return c.json(
        fail("SELLER_ID_REQUIRED", "seller_id is required"),
        400
      );
    }

    if (authUser.role === "seller") {
      const sellerAccess = await c.env.DB.prepare(
        `select id from sellers where id = ? and owner_user_id = ? limit 1`
      )
        .bind(sellerId, authUser.user_id)
        .first();

      if (!sellerAccess) {
        return c.json(
          fail("FORBIDDEN", "Forbidden"),
          403
        );
      }
    }

    const stats = await c.env.DB.prepare(
      `
      select
        count(*) as total_orders,
        coalesce(sum(total_mad), 0) as total_revenue,
        sum(case when order_status = 'pending' then 1 else 0 end) as pending_orders,
        sum(case when order_status = 'confirmed' then 1 else 0 end) as confirmed_orders
      from orders
      where seller_id = ?
      `
    )
      .bind(sellerId)
      .first();

    return c.json(
      ok({
        total_orders: Number(stats?.total_orders || 0),
        total_revenue: Number(stats?.total_revenue || 0),
        pending_orders: Number(stats?.pending_orders || 0),
        confirmed_orders: Number(stats?.confirmed_orders || 0),
      })
    );
  } catch (error) {
    console.error("GET /stats failed", error);
    return c.json(
      fail("STATS_FETCH_FAILED", "Failed to load stats"),
      500
    );
  }
});

/**
 * POST /orders
 * route مفتوح للضيف أو للمستخدم المسجل
 */
orderRouter.post("/orders", async (c) => {
  try {
    const authUser = await getOptionalAuthUser(c);
    const body = await c.req.json().catch(() => null);

    if (!body) {
      return c.json(
        fail("INVALID_JSON", "Invalid request body"),
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

    const shippingPriceRaw = body.shipping_price;
    const shippingProviderId = body.shipping_provider_id
      ? String(body.shipping_provider_id).trim()
      : null;
    const shippingMethodId = body.shipping_method_id
      ? String(body.shipping_method_id).trim()
      : null;
    const shippingMethodLabel = body.shipping_method_label
      ? String(body.shipping_method_label).trim()
      : null;

    if (!sellerId) {
      return c.json(
        fail("SELLER_ID_REQUIRED", "seller_id is required"),
        400
      );
    }

    if (!items.length) {
      return c.json(
        fail("ITEMS_REQUIRED", "Order items are required"),
        400
      );
    }

    if (!buyerName) {
      return c.json(
        fail("BUYER_NAME_REQUIRED", "Buyer name is required"),
        400
      );
    }

    if (!buyerPhone) {
      return c.json(
        fail("BUYER_PHONE_REQUIRED", "Buyer phone is required"),
        400
      );
    }

    if (!buyerCity) {
      return c.json(
        fail("BUYER_CITY_REQUIRED", "Buyer city is required"),
        400
      );
    }

    if (!buyerAddress) {
      return c.json(
        fail("BUYER_ADDRESS_REQUIRED", "Buyer address is required"),
        400
      );
    }

    if (paymentMethod !== "cod") {
      return c.json(
        fail("PAYMENT_METHOD_NOT_SUPPORTED", "Only cash on delivery is supported حاليا"),
        400
      );
    }

    const seller = await c.env.DB.prepare(
      `select id, display_name, phone from sellers where id = ? limit 1`
    )
      .bind(sellerId)
      .first<{ id: string; display_name: string | null; phone: string | null }>();

    if (!seller) {
      return c.json(
        fail("SELLER_NOT_FOUND", "Seller not found"),
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

    let shippingMad = 0;

    for (const item of items) {
      const productId = String(item?.product_id || "").trim();
      const quantity = Number(item?.quantity || 0);

      if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
        return c.json(
          fail("INVALID_ITEM", "Invalid order item"),
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
          fail("PRODUCT_NOT_FOUND", "Invalid product"),
          404
        );
      }

      if (product.seller_id !== sellerId) {
        return c.json(
          fail("MIXED_SELLER_NOT_ALLOWED", "All products must belong to the same seller"),
          400
        );
      }

      if (product.status && product.status !== "active") {
        return c.json(
          fail("PRODUCT_NOT_ACTIVE", "One or more products are not available"),
          400
        );
      }

      if (product.stock !== null && Number(product.stock) < quantity) {
        return c.json(
          fail("INSUFFICIENT_STOCK", "Insufficient stock for one or more products"),
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

    if (
      shippingPriceRaw !== undefined &&
      shippingPriceRaw !== null &&
      String(shippingPriceRaw).trim() !== ""
    ) {
      const parsedShipping = Number(shippingPriceRaw);

      if (!Number.isFinite(parsedShipping) || parsedShipping < 0) {
        return c.json(
          fail("INVALID_SHIPPING_PRICE", "Invalid shipping price"),
          400
        );
      }

      shippingMad = Math.round(parsedShipping);
    }

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

    if (shippingProviderId || shippingMethodId || shippingMad > 0) {
      await c.env.DB.prepare(
        `
        insert into order_shipments (
          id,
          order_id,
          seller_id,
          provider_id,
          provider_method_id,
          shipping_price,
          shipping_status,
          created_at
        )
        values (?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
        `
      )
        .bind(
          crypto.randomUUID(),
          orderId,
          sellerId,
          shippingProviderId,
          shippingMethodId,
          shippingMad
        )
        .run();
    }

    c.executionCtx.waitUntil(
      notifyNewOrder(
        {
          WHATSAPP_ACCESS_TOKEN: c.env.WHATSAPP_ACCESS_TOKEN,
          WHATSAPP_PHONE_NUMBER_ID: c.env.WHATSAPP_PHONE_NUMBER_ID,
          WHATSAPP_BUSINESS_ACCOUNT_ID: c.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
          WHATSAPP_DEFAULT_COUNTRY_CODE: c.env.WHATSAPP_DEFAULT_COUNTRY_CODE,
          WHATSAPP_ADMIN_PHONE: c.env.WHATSAPP_ADMIN_PHONE
        },
        {
          order_number: orderNumber,
          buyer_name: buyerName,
          buyer_phone: buyerPhone,
          buyer_city: buyerCity,
          total_mad: totalMad,
          subtotal_mad: subtotalMad,
          shipping_mad: shippingMad,
          shipping_provider_id: shippingProviderId,
          shipping_method_id: shippingMethodId,
          shipping_method_label: shippingMethodLabel,
          items: validatedItems.map((item) => ({
            name: item.product_name,
            quantity: item.quantity
          })),
          seller_name: seller.display_name || "RAHBA",
          seller_phone: seller.phone || null
        }
      )
    );

    return c.json(
      ok({
        id: orderId,
        order_number: orderNumber,
        total_mad: totalMad,
        order_status: orderStatus,
        payment_method: paymentMethod,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        buyer_city: buyerCity,
        buyer_address: buyerAddress
      })
    );
  } catch (error) {
    console.error("POST /orders failed", error);
    return c.json(
      fail("ORDER_CREATE_FAILED", "Failed to create order"),
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
        fail("ORDER_NOT_FOUND", "Order not found"),
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
        fail("FORBIDDEN", "Forbidden"),
        403
      );
    }

    const itemsRes = await c.env.DB.prepare(
      `
      select
        oi.*,
        p.title_ar,
        p.slug,
        (
          select pm.url
          from product_media pm
          where pm.product_id = p.id
          order by pm.sort_order asc, pm.rowid asc
          limit 1
        ) as image_url
      from order_items oi
      left join products p on p.id = oi.product_id
      where oi.order_id = ?
      order by oi.rowid asc
      `
    )
      .bind(id)
      .all();

    const shipmentsRes = await c.env.DB.prepare(
      `
      select
        os.*,
        lp.name as provider_name,
        lpm.name as method_name,
        lpm.code as method_code
      from order_shipments os
      left join logistics_providers lp on lp.id = os.provider_id
      left join logistics_provider_methods lpm on lpm.id = os.provider_method_id
      where os.order_id = ?
      order by datetime(os.created_at) asc
      `
    )
      .bind(id)
      .all();

    const shipments = shipmentsRes.results || [];
    const primaryShipment = shipments[0] || null;

    return c.json(
      ok({
        ...order,
        items: itemsRes.results || [],
        shipping: primaryShipment
          ? {
              id: primaryShipment.id,
              provider_id: primaryShipment.provider_id,
              provider_name: primaryShipment.provider_name || null,
              provider_method_id: primaryShipment.provider_method_id,
              method_name: primaryShipment.method_name || null,
              method_code: primaryShipment.method_code || null,
              shipping_price: Number(primaryShipment.shipping_price || 0),
              shipping_status: primaryShipment.shipping_status || null,
              tracking_number: primaryShipment.tracking_number || order.tracking_number || null,
              shipped_at: primaryShipment.shipped_at || null,
              delivered_at: primaryShipment.delivered_at || null
            }
          : null,
        shipments
      })
    );
  } catch (error) {
    console.error("GET /orders/:id failed", error);
    return c.json(
      fail("ORDER_DETAILS_FAILED", "Failed to load order details"),
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
          fail("INVALID_STATUS", "Invalid order status"),
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
          fail("ORDER_NOT_FOUND", "Order not found"),
          404
        );
      }

      if (
        authUser.role === "seller" &&
        order.seller_owner_user_id !== authUser.user_id
      ) {
        return c.json(
          fail("FORBIDDEN", "Forbidden"),
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

      return c.json(ok(updated));
    } catch (error) {
      console.error("PATCH /orders/:id/status failed", error);
      return c.json(
        fail("ORDER_STATUS_UPDATE_FAILED", "Failed to update order status"),
        500
      );
    }
  }
);

orderRouter.get(
  "/track/:orderNumber",
  rateLimit({ keyPrefix: "order-track", limit: 10, windowSeconds: 600 }),
  async (c) => {
    try {
      const orderNumber = String(c.req.param("orderNumber") || "").trim().toUpperCase();
      const phone = normalizeMoroccanPhone(c.req.query("phone"));

      if (!orderNumber) {
        return c.json(
          fail("ORDER_NUMBER_REQUIRED", "order_number is required"),
          400
        );
      }

      if (!phone) {
        return c.json(
          fail("PHONE_REQUIRED", "phone is required"),
          400
        );
      }

      const order = await c.env.DB.prepare(
        `
        select
          o.id,
          o.order_number,
          o.buyer_phone,
          o.buyer_name,
          o.buyer_city,
          o.order_status,
          o.payment_status,
          o.shipping_status,
          o.total_mad,
          o.created_at,
          o.tracking_number,
          s.display_name as seller_name
        from orders o
        left join sellers s on s.id = o.seller_id
        where upper(o.order_number) = upper(?)
        limit 1
        `
      )
        .bind(orderNumber)
        .first<any>();

      if (!order) {
        return c.json(
          fail("ORDER_NOT_FOUND", "Order not found"),
          404
        );
      }

      if (normalizeMoroccanPhone(order.buyer_phone) !== phone) {
        return c.json(
          fail("ORDER_NOT_FOUND", "Order not found"),
          404
        );
      }

      const itemsRes = await c.env.DB.prepare(
        `
        select
          oi.id,
          oi.product_id,
          oi.quantity,
          oi.unit_price_mad,
          p.title_ar,
          p.slug,
          (
            select pm.url
            from product_media pm
            where pm.product_id = p.id
            order by pm.sort_order asc, pm.rowid asc
            limit 1
          ) as image_url
        from order_items oi
        left join products p on p.id = oi.product_id
        where oi.order_id = ?
        order by oi.rowid asc
        `
      )
        .bind(order.id)
        .all();

      const shipmentsRes = await c.env.DB.prepare(
        `
        select
          os.id,
          os.provider_id,
          os.provider_method_id,
          os.shipping_price,
          os.shipping_status,
          os.tracking_number,
          os.shipped_at,
          os.delivered_at,
          lp.name as provider_name,
          lpm.name as method_name,
          lpm.code as method_code
        from order_shipments os
        left join logistics_providers lp on lp.id = os.provider_id
        left join logistics_provider_methods lpm on lpm.id = os.provider_method_id
        where os.order_id = ?
        order by datetime(os.created_at) asc
        `
      )
        .bind(order.id)
        .all();

      const shipments = Array.isArray(shipmentsRes.results) ? shipmentsRes.results : [];
      const primaryShipment = shipments[0] || null;

      return c.json(
        ok({
          id: order.id,
          order_number: order.order_number,
          buyer_name: order.buyer_name || null,
          buyer_city: order.buyer_city || null,
          seller_name: order.seller_name || "RAHBA",
          order_status: order.order_status || "pending",
          payment_status: order.payment_status || "unpaid",
          shipping_status: order.shipping_status || "pending",
          total_mad: Number(order.total_mad || 0),
          created_at: order.created_at || null,
          tracking_number:
            primaryShipment?.tracking_number || order.tracking_number || null,
          items: Array.isArray(itemsRes.results) ? itemsRes.results : [],
          shipping: primaryShipment
            ? {
                id: primaryShipment.id,
                provider_id: primaryShipment.provider_id,
                provider_name: primaryShipment.provider_name || null,
                provider_method_id: primaryShipment.provider_method_id,
                method_name: primaryShipment.method_name || null,
                method_code: primaryShipment.method_code || null,
                shipping_price: Number(primaryShipment.shipping_price || 0),
                shipping_status: primaryShipment.shipping_status || null,
                tracking_number:
                  primaryShipment.tracking_number || order.tracking_number || null,
                shipped_at: primaryShipment.shipped_at || null,
                delivered_at: primaryShipment.delivered_at || null
              }
            : null
        })
      );
    } catch (error) {
      console.error("GET /track/:orderNumber failed", error);
      return c.json(
        fail("ORDER_TRACK_FAILED", "Failed to track order"),
        500
      );
    }
  }
);

export default orderRouter;
