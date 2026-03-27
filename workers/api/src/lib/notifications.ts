type WhatsAppEnv = {
  WHATSAPP_ACCESS_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_BUSINESS_ACCOUNT_ID?: string;
  WHATSAPP_DEFAULT_COUNTRY_CODE?: string;
  WHATSAPP_ADMIN_PHONE?: string;
  STOREFRONT_URL?: string;
};

type OrderItem = {
  name: string;
  quantity: number;
};

type NewOrderPayload = {
  order_number: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_city: string;
  total_mad: number;
  subtotal_mad?: number;
  shipping_mad?: number;
  shipping_provider_id?: string | null;
  shipping_method_id?: string | null;
  shipping_method_label?: string | null;
  items: OrderItem[];
  seller_name?: string | null;
  seller_phone?: string | null;
};

function normalizePhone(input: string, defaultCountryCode = "212") {
  const raw = String(input || "").trim().replace(/[^\d+]/g, "");
  if (!raw) return null;
  if (raw.startsWith("+")) return raw.slice(1);
  if (raw.startsWith("00")) return raw.slice(2);
  if (raw.startsWith(defaultCountryCode)) return raw;
  if (raw.startsWith("0")) return `${defaultCountryCode}${raw.slice(1)}`;
  return `${defaultCountryCode}${raw}`;
}

function money(value: unknown) {
  return `${Number(value || 0)} MAD`;
}

function normalizeOrderStatusText(status: unknown) {
  const value = String(status || "").trim().toLowerCase();
  switch (value) {
    case "pending":
      return "قيد الانتظار";
    case "confirmed":
      return "تم التأكيد";
    case "processing":
      return "قيد المعالجة";
    case "shipped":
      return "تم الشحن";
    case "delivered":
      return "تم التسليم";
    case "cancelled":
      return "ملغي";
    default:
      return "قيد الانتظار";
  }
}

function buildTrackingUrl(baseUrl: string | undefined, orderNumber: string) {
  const origin = String(baseUrl || "https://rahba.site").replace(/\/+$/, "");
  return `${origin}/track/${encodeURIComponent(orderNumber)}`;
}

async function sendWhatsAppText(env: WhatsAppEnv, to: string, body: string) {
  const phoneNumberId = String(env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
  const accessToken = String(env.WHATSAPP_ACCESS_TOKEN || "").trim();

  if (!phoneNumberId || !accessToken || !to || !body.trim()) {
    return { ok: false, skipped: true };
  }

  const res = await fetch(
    `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body
        }
      })
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("WhatsApp text send failed:", res.status, data);
  }

  return {
    ok: res.ok,
    status: res.status,
    data
  };
}

async function sendWhatsAppTemplateOrderTracking(
  env: WhatsAppEnv,
  to: string,
  payload: NewOrderPayload
) {
  const phoneNumberId = String(env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
  const accessToken = String(env.WHATSAPP_ACCESS_TOKEN || "").trim();

  if (!phoneNumberId || !accessToken || !to) {
    return { ok: false, skipped: true };
  }

  const totalMadText = money(payload.total_mad || 0);
  const orderStatusText = normalizeOrderStatusText("pending");
  const trackingUrl = buildTrackingUrl(env.STOREFRONT_URL, payload.order_number);

  const res = await fetch(
    `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "rahba_order_tracking_utility_ar",
          language: {
            code: "ar"
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: String(payload.buyer_name || "عميل رحبة")
                },
                {
                  type: "text",
                  text: String(payload.order_number || "")
                },
                {
                  type: "text",
                  text: totalMadText
                },
                {
                  type: "text",
                  text: orderStatusText
                }
              ]
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                {
                  type: "text",
                  text: String(payload.order_number || "")
                }
              ]
            }
          ]
        }
      })
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("WhatsApp template send failed:", res.status, data, {
      order_number: payload.order_number,
      tracking_url: trackingUrl
    });
  }

  return {
    ok: res.ok,
    status: res.status,
    data
  };
}

export async function notifyNewOrder(env: WhatsAppEnv, payload: NewOrderPayload) {
  try {
    const defaultCountryCode = env.WHATSAPP_DEFAULT_COUNTRY_CODE || "212";
    const adminPhone = normalizePhone(env.WHATSAPP_ADMIN_PHONE || "", defaultCountryCode);
    const buyerPhone = normalizePhone(payload.buyer_phone || "", defaultCountryCode);
    const trackingUrl = buildTrackingUrl(env.STOREFRONT_URL, payload.order_number);

    const itemsText = Array.isArray(payload.items) && payload.items.length > 0
      ? payload.items
          .map((item) => `- ${item.name} × ${Number(item.quantity || 0)}`)
          .join("\n")
      : "- لا توجد عناصر";

    const shippingLine = payload.shipping_method_label
      ? `الشحن: ${payload.shipping_method_label} (${money(payload.shipping_mad || 0)})`
      : `الشحن: ${money(payload.shipping_mad || 0)}`;

    const adminMessage = [
      "طلب جديد في RAHBA",
      `رقم الطلب: ${payload.order_number}`,
      `الزبون: ${payload.buyer_name}`,
      `الهاتف: ${payload.buyer_phone}`,
      `المدينة: ${payload.buyer_city}`,
      `البائع: ${payload.seller_name || "RAHBA"}`,
      `المجموع الفرعي: ${money(payload.subtotal_mad || 0)}`,
      shippingLine,
      `الإجمالي: ${money(payload.total_mad || 0)}`,
      "العناصر:",
      itemsText,
      `رابط التتبع: ${trackingUrl}`
    ].join("\n");

    const jobs: Promise<unknown>[] = [];

    if (adminPhone) {
      jobs.push(sendWhatsAppText(env, adminPhone, adminMessage));
    }

    if (buyerPhone) {
      jobs.push(sendWhatsAppTemplateOrderTracking(env, buyerPhone, payload));
    }

    await Promise.allSettled(jobs);
  } catch (error) {
    console.error("notifyNewOrder failed:", error);
  }
}
