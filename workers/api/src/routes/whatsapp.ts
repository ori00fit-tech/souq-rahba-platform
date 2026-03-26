import { Hono } from "hono";
import { ok, fail } from "../utils/response";
import type { AppEnv } from "../types";

export const whatsappRouter = new Hono<AppEnv>();

function normalizeMoroccanPhone(input: string, defaultCountryCode = "212") {
  const raw = String(input || "").trim().replace(/[^\d+]/g, "");
  if (!raw) return null;
  if (raw.startsWith("+")) return raw.slice(1);
  if (raw.startsWith("00")) return raw.slice(2);
  if (raw.startsWith(defaultCountryCode)) return raw;
  if (raw.startsWith("0")) return `${defaultCountryCode}${raw.slice(1)}`;
  return `${defaultCountryCode}${raw}`;
}

whatsappRouter.post("/whatsapp/register", async (c) => {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v23.0/${c.env.WHATSAPP_PHONE_NUMBER_ID}/register`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${c.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          pin: c.env.WHATSAPP_REGISTRATION_PIN
        })
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return c.json(
        fail("WHATSAPP_REGISTER_FAILED", "Failed to register WhatsApp phone number", {
          status: res.status,
          data
        }),
        400
      );
    }

    return c.json(
      ok({
        status: res.status,
        data
      })
    );
  } catch (error) {
    console.error(error);
    return c.json(
      fail("WHATSAPP_REGISTER_FAILED", "Failed to register WhatsApp phone number"),
      500
    );
  }
});

whatsappRouter.post("/whatsapp/test", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const to = normalizeMoroccanPhone(
      body?.to || "",
      c.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "212"
    );

    if (!to) {
      return c.json(
        fail("PHONE_REQUIRED", "Phone is required"),
        400
      );
    }

    const orderNumber = body?.order_number || "RB-2026-TEST1234";

    const res = await fetch(
      `https://graph.facebook.com/v23.0/${c.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${c.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: "rahba_order_received",
            language: {
              code: "en"
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: orderNumber
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
      return c.json(
        fail("WHATSAPP_TEST_FAILED", "Failed to send WhatsApp test message", {
          status: res.status,
          data
        }),
        400
      );
    }

    return c.json(
      ok({
        status: res.status,
        data
      })
    );
  } catch (error) {
    console.error(error);
    return c.json(
      fail("WHATSAPP_TEST_FAILED", "Failed to send WhatsApp test message"),
      500
    );
  }
});

export default whatsappRouter;
