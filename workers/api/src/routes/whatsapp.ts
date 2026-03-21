import { Hono } from "hono";
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
    const phoneNumberId = c.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = c.env.WHATSAPP_ACCESS_TOKEN;
    const pin = c.env.WHATSAPP_REGISTRATION_PIN;

    const res = await fetch(
      `https://graph.facebook.com/v23.0/${phoneNumberId}/register`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          pin
        })
      }
    );

    const data = await res.json().catch(() => ({}));

    return c.json(
      {
        ok: res.ok,
        status: res.status,
        data
      },
      res.ok ? 200 : 400
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        ok: false,
        message: "Failed to register WhatsApp phone number"
      },
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
        {
          ok: false,
          message: "Phone is required"
        },
        400
      );
    }

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
            name: "hello_world",
            language: {
              code: "en_US"
            }
          }
        })
      }
    );

    const data = await res.json().catch(() => ({}));

    return c.json(
      {
        ok: res.ok,
        status: res.status,
        data
      },
      res.ok ? 200 : 400
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        ok: false,
        message: "Failed to send WhatsApp test message"
      },
      500
    );
  }
});

export default whatsappRouter;
