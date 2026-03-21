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
  if (raw.startsWith("+")) return raw.slice(1);
  if (raw.startsWith("00")) return raw.slice(2);
  if (raw.startsWith(defaultCountryCode)) return raw;
  if (raw.startsWith("0")) return `${defaultCountryCode}${raw.slice(1)}`;
  return `${defaultCountryCode}${raw}`;
}

export async function sendWhatsAppTemplateMessage(
  env: {
    WHATSAPP_ACCESS_TOKEN?: string;
    WHATSAPP_PHONE_NUMBER_ID?: string;
    WHATSAPP_DEFAULT_COUNTRY_CODE?: string;
  },
  to: string,
  templateName = "hello_world",
  languageCode = "en_US"
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
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode
          }
        }
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("WhatsApp template send failed", {
      status: response.status,
      data
    });
    return { ok: false, status: response.status, data };
  }

  console.log("WhatsApp template sent successfully", { to: normalizedTo, data });
  return { ok: true, data };
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
    console.log("Preparing WhatsApp notification for order", order.order_number);

    const buyerResult = await sendWhatsAppTemplateMessage(
      env,
      order.buyer_phone,
      "hello_world",
      "en_US"
    );

    return {
      ok: true,
      results: {
        buyer: buyerResult
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
