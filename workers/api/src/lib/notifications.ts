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

function normalizePhone(input: string, defaultCountryCode = "212") {
  const raw = String(input || "").trim().replace(/[^\d+]/g, "");
  if (!raw) return null;
  if (raw.startsWith("+")) return raw.slice(1);
  if (raw.startsWith("00")) return raw.slice(2);
  if (raw.startsWith(defaultCountryCode)) return raw;
  if (raw.startsWith("0")) return `${defaultCountryCode}${raw.slice(1)}`;
  return `${defaultCountryCode}${raw}`;
}

async function sendWhatsAppTemplateMessage(
  env: {
    WHATSAPP_ACCESS_TOKEN?: string;
    WHATSAPP_PHONE_NUMBER_ID?: string;
    WHATSAPP_DEFAULT_COUNTRY_CODE?: string;
  },
  to: string,
  templateName: string,
  languageCode: string,
  parameters: string[] = []
) {
  const accessToken = env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return { ok: false, skipped: true, reason: "missing_config" };
  }

  const normalizedTo = normalizePhone(
    to,
    env.WHATSAPP_DEFAULT_COUNTRY_CODE || "212"
  );

  if (!normalizedTo) {
    return { ok: false, skipped: true, reason: "invalid_phone" };
  }

  const components = parameters.length
    ? [
        {
          type: "body",
          parameters: parameters.map((value) => ({
            type: "text",
            text: value
          }))
        }
      ]
    : [];

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
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          ...(components.length ? { components } : {})
        }
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("WhatsApp template send failed", {
      status: response.status,
      data,
      to: normalizedTo,
      templateName
    });
    return { ok: false, skipped: false, status: response.status, data };
  }

  console.log("WhatsApp template sent successfully", {
    to: normalizedTo,
    templateName,
    data
  });

  return { ok: true, skipped: false, data };
}

export async function notifyNewOrder(
  env: {
    WHATSAPP_ACCESS_TOKEN?: string;
    WHATSAPP_PHONE_NUMBER_ID?: string;
    WHATSAPP_BUSINESS_ACCOUNT_ID?: string;
    WHATSAPP_DEFAULT_COUNTRY_CODE?: string;
    WHATSAPP_ADMIN_PHONE?: string;
  },
  order: OrderNotificationData
) {
  try {
    const buyerResult = await sendWhatsAppTemplateMessage(
      env,
      order.buyer_phone,
      "rahba_order_received",
      "en",
      [order.order_number]
    );

    const sellerRecipient = order.seller_phone || env.WHATSAPP_ADMIN_PHONE || "";

    const sellerResult = sellerRecipient
      ? await sendWhatsAppTemplateMessage(
          env,
          sellerRecipient,
          "rahba_new_order_seller",
          "ar",
          [
            order.order_number,
            order.buyer_name,
            order.buyer_phone,
            order.buyer_city,
            `${order.total_mad} MAD`
          ]
        )
      : { ok: false, skipped: true, reason: "missing_seller_and_admin_phone" };

    return {
      ok: true,
      results: {
        buyer: buyerResult,
        seller: sellerResult
      }
    };
  } catch (error) {
    console.error("Failed to process notifications:", error);
    return {
      ok: false,
      error: String(error)
    };
  }
}
