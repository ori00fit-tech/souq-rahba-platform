export interface OrderNotificationItem {
  name: string;
  quantity: number;
}

export interface OrderNotificationData {
  order_number: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_city: string;
  total_mad: number;
  items: OrderNotificationItem[];
  seller_name: string;
  seller_phone?: string | null;
}

function normalizeMoroccanPhone(input: string, defaultCountryCode = "212") {
  const raw = String(input || "").trim().replace(/[^\d+]/g, "");

  if (!raw) return null;

  if (raw.startsWith("+")) {
    return raw.slice(1);
  }

  if (raw.startsWith("00")) {
    return raw.slice(2);
  }

  if (raw.startsWith(defaultCountryCode)) {
    return raw;
  }

  if (raw.startsWith("0")) {
    return `${defaultCountryCode}${raw.slice(1)}`;
  }

  return `${defaultCountryCode}${raw}`;
}

export function buildSellerOrderWhatsAppMessage(order: OrderNotificationData) {
  const itemsSummary = order.items
    .map((item) => `- ${item.name} × ${item.quantity}`)
    .join("\n");

  return [
    "🔔 *طلب جديد على RAHBA*",
    "",
    `رقم الطلب: ${order.order_number}`,
    `المشتري: ${order.buyer_name}`,
    `الهاتف: ${order.buyer_phone}`,
    `المدينة: ${order.buyer_city}`,
    `الإجمالي: ${order.total_mad} MAD`,
    "",
    "*المنتجات:*",
    itemsSummary || "- منتج",
    "",
    "يرجى التواصل مع الزبون لتأكيد الطلب."
  ].join("\n");
}

export function buildBuyerOrderWhatsAppMessage(order: OrderNotificationData) {
  return [
    "✅ *تم استلام طلبك بنجاح*",
    "",
    `مرحباً ${order.buyer_name}،`,
    `رقم طلبك: ${order.order_number}`,
    `المبلغ الإجمالي: ${order.total_mad} MAD`,
    `البائع: ${order.seller_name}`,
    "",
    "سيتم التواصل معك قريباً لتأكيد التوصيل.",
    "شكراً لثقتك في منصة رهبة."
  ].join("\n");
}

async function sendWhatsAppTextMessage(
  env: {
    WHATSAPP_ACCESS_TOKEN?: string;
    WHATSAPP_PHONE_NUMBER_ID?: string;
    WHATSAPP_DEFAULT_COUNTRY_CODE?: string;
  },
  to: string,
  body: string
) {
  const accessToken = env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.log("WhatsApp config missing, skipping real send");
    return { ok: false, skipped: true, reason: "missing_config" };
  }

  const normalizedTo = normalizeMoroccanPhone(
    to,
    env.WHATSAPP_DEFAULT_COUNTRY_CODE || "212"
  );

  if (!normalizedTo) {
    return { ok: false, skipped: true, reason: "invalid_phone" };
  }

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizedTo,
        type: "text",
        text: {
          preview_url: false,
          body
        }
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("WhatsApp send failed", {
      status: response.status,
      data
    });
    return { ok: false, skipped: false, status: response.status, data };
  }

  console.log("WhatsApp sent successfully", { to: normalizedTo, data });
  return { ok: true, skipped: false, data };
}

export async function notifyNewOrder(
  env: {
    WHATSAPP_ACCESS_TOKEN?: string;
    WHATSAPP_PHONE_NUMBER_ID?: string;
    WHATSAPP_BUSINESS_ACCOUNT_ID?: string;
    WHATSAPP_DEFAULT_COUNTRY_CODE?: string;
  },
  order: OrderNotificationData
) {
  try {
    const sellerMsg = buildSellerOrderWhatsAppMessage(order);
    const buyerMsg = buildBuyerOrderWhatsAppMessage(order);

    console.log("---------- WHATSAPP NOTIFICATION ----------");
    console.log("TO SELLER:");
    console.log(sellerMsg);
    console.log("-------------------------------------------");
    console.log("TO BUYER:");
    console.log(buyerMsg);
    console.log("-------------------------------------------");

    const results = {
      seller: null as any,
      buyer: null as any
    };

    if (order.seller_phone) {
      results.seller = await sendWhatsAppTextMessage(env, order.seller_phone, sellerMsg);
    } else {
      console.log("Seller phone missing, seller WhatsApp skipped");
      results.seller = { ok: false, skipped: true, reason: "missing_seller_phone" };
    }

    results.buyer = await sendWhatsAppTextMessage(env, order.buyer_phone, buyerMsg);

    return {
      ok: true,
      results
    };
  } catch (error) {
    console.error("Failed to process notifications:", error);
    return {
      ok: false,
      error: String(error)
    };
  }
}
