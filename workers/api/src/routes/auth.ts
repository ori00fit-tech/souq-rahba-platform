import { Hono } from "hono";
import type { AppEnv } from "../types";

export const authRouter = new Hono<AppEnv>();

// 1. Google OAuth - Start Flow
authRouter.get("/google/login", (c) => {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", c.env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", c.env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");

  return c.redirect(url.toString());
});

// 2. Google OAuth - Callback Debug Version
authRouter.get("/google/callback", async (c) => {
  try {
    const code = c.req.query("code");

    if (!code) {
      return c.json({ ok: false, code: "MISSING_CODE", message: "No code from Google" }, 400);
    }

    // Exchange Code for Token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: c.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenRes.json().catch(() => ({} as any)) as any;

    if (!tokenRes.ok || !tokenData?.access_token) {
      return c.json({
        ok: false,
        code: "GOOGLE_TOKEN_EXCHANGE_FAILED",
        message: "Failed to exchange Google code",
        details: tokenData
      }, 400);
    }

    // Fetch User Profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const profile = await profileRes.json().catch(() => ({} as any)) as any;

    if (!profileRes.ok || !profile?.email || !profile?.id) {
      return c.json({
        ok: false,
        code: "GOOGLE_PROFILE_FAILED",
        message: "Failed to fetch Google profile",
        details: profile
      }, 400);
    }

    // المرحلة الحالية: نوقف هنا للتأكد من نجاح الاتصال بـ Google
    return c.json({
      ok: true,
      step: "google_profile_ok",
      profile: {
        email: profile.email,
        id: profile.id,
        name: profile.name || null,
        picture: profile.picture || null
      }
    });

  } catch (err) {
    return c.json({
      ok: false,
      code: "GOOGLE_CALLBACK_CRASH",
      message: "Callback crashed",
      details: String(err)
    }, 500);
  }
});

// Route مؤقت لفحص البيئة
authRouter.get("/debug-google-env", (c) => {
  return c.json({
    has_id: !!c.env.GOOGLE_CLIENT_ID,
    has_secret: !!c.env.GOOGLE_CLIENT_SECRET,
    has_redirect: !!c.env.GOOGLE_REDIRECT_URI,
    redirect_uri: c.env.GOOGLE_REDIRECT_URI
  });
});

export default authRouter;
