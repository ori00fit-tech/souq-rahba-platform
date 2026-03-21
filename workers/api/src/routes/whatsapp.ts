import { Hono } from "hono";
import type { AppEnv } from "../types";

export const whatsappRouter = new Hono<AppEnv>();

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

    return c.json({
      ok: res.ok,
      status: res.status,
      data
    }, res.ok ? 200 : 400);
  } catch (error) {
    console.error(error);
    return c.json({
      ok: false,
      message: "Failed to register WhatsApp phone number"
    }, 500);
  }
});

export default whatsappRouter;
