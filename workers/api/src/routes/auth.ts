import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../types";

export const authRouter = new Hono<AppEnv>();

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "buyer" | "seller" | "admin";
  password_hash: string | null;
};

function hashPassword(password: string) {
  return btoa(password);
}

function jsonError(message: string, code: string, status = 400, details?: unknown) {
  return {
    ok: false,
    code,
    message,
    ...(details !== undefined ? { details } : {})
  };
}

authRouter.get("/debug-google-env", async (c) => {
  return c.json({
    ok: true,
    has_client_id: !!c.env.GOOGLE_CLIENT_ID,
    has_client_secret: !!c.env.GOOGLE_CLIENT_SECRET,
    has_redirect_uri: !!c.env.GOOGLE_REDIRECT_URI
  });
});

authRouter.post("/register", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);

    if (!body?.email || !body?.password) {
      return c.json(
        jsonError("Email and password are required", "INVALID_BODY", 400),
        400
      );
    }

    const email = String(body.email).trim().toLowerCase();

    const existing = await c.env.DB.prepare(
      `select id from users where email = ? limit 1`
    )
      .bind(email)
      .first<{ id: string }>();

    if (existing) {
      return c.json(
        jsonError("Email already exists", "EMAIL_EXISTS", 409),
        409
      );
    }

    const userId = crypto.randomUUID();

    await c.env.DB.prepare(
      `insert into users (
        id,
        email,
        full_name,
        phone,
        role,
        locale,
        password_hash,
        auth_provider
      ) values (?, ?, ?, ?, ?, ?, ?, 'password')`
    )
      .bind(
        userId,
        email,
        body.full_name || null,
        body.phone || null,
        body.role || "buyer",
        body.locale || "ar",
        hashPassword(String(body.password))
      )
      .run();

    return c.json(
      {
        ok: true,
        data: {
          id: userId,
          email,
          role: body.role || "buyer"
        }
      },
      201
    );
  } catch (err) {
    return c.json(
      jsonError(
        "Registration failed",
        "REGISTER_FAILED",
        500,
        err instanceof Error ? err.message : String(err)
      ),
      500
    );
  }
});

authRouter.post("/login", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);

    if (!body?.email || !body?.password) {
      return c.json(
        jsonError("Email and password are required", "INVALID_BODY", 400),
        400
      );
    }

    const email = String(body.email).trim().toLowerCase();

    const user = await c.env.DB.prepare(
      `select id, email, full_name, phone, role, password_hash
       from users
       where email = ?
       limit 1`
    )
      .bind(email)
      .first<UserRow>();

    if (!user || user.password_hash !== hashPassword(String(body.password))) {
      return c.json(
        jsonError("Invalid email or password", "INVALID_CREDENTIALS", 401),
        401
      );
    }

    const token = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    await c.env.DB.prepare(
      `insert into sessions (
        id,
        user_id,
        token,
        expires_at
      ) values (?, ?, ?, ?)`
    )
      .bind(sessionId, user.id, token, expiresAt)
      .run();

    return c.json({
      ok: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (err) {
    return c.json(
      jsonError(
        "Login failed",
        "LOGIN_FAILED",
        500,
        err instanceof Error ? err.message : String(err)
      ),
      500
    );
  }
});

authRouter.get("/me", authMiddleware, async (c) => {
  const authUser = c.get("authUser");

  return c.json({
    ok: true,
    data: {
      id: authUser.user_id,
      email: authUser.email,
      full_name: authUser.full_name,
      role: authUser.role
    }
  });
});

authRouter.post("/logout", authMiddleware, async (c) => {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (token) {
    await c.env.DB.prepare(`delete from sessions where token = ?`)
      .bind(token)
      .run();
  }

  return c.json({ ok: true });
});

authRouter.get("/google/login", async (c) => {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", c.env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", c.env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  return c.redirect(url.toString(), 302);
});

authRouter.get("/google/callback", async (c) => {
  let step = "start";

  try {
    const code = c.req.query("code");

    if (!code) {
      return c.json(
        jsonError("Missing Google code", "MISSING_CODE", 400),
        400
      );
    }

    step = "exchange_token";

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

    const tokenData = (await tokenRes.json().catch(() => ({}))) as any;

    if (!tokenRes.ok || !tokenData?.access_token) {
      return c.json(
        jsonError(
          "Failed to exchange Google code",
          "GOOGLE_TOKEN_EXCHANGE_FAILED",
          400,
          { step, tokenData }
        ),
        400
      );
    }

    step = "fetch_profile";

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const profile = (await profileRes.json().catch(() => ({}))) as any;

    if (!profileRes.ok || !profile?.email || !profile?.id) {
      return c.json(
        jsonError(
          "Failed to fetch Google profile",
          "GOOGLE_PROFILE_FAILED",
          400,
          { step, profile }
        ),
        400
      );
    }

    step = "lookup_user_by_google_id";

    let user = await c.env.DB.prepare(
      `select id, email, full_name, phone, role
       from users
       where google_id = ?
       limit 1`
    )
      .bind(profile.id)
      .first<{
        id: string;
        email: string;
        full_name: string | null;
        phone: string | null;
        role: "buyer" | "seller" | "admin";
      }>();

    if (!user) {
      step = "lookup_user_by_email";

      user = await c.env.DB.prepare(
        `select id, email, full_name, phone, role
         from users
         where email = ?
         limit 1`
      )
        .bind(profile.email)
        .first<{
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: "buyer" | "seller" | "admin";
        }>();
    }

    if (!user) {
      step = "insert_user";

      const userId = crypto.randomUUID();

      await c.env.DB.prepare(
        `insert into users (
          id,
          email,
          full_name,
          role,
          locale,
          google_id,
          auth_provider,
          avatar_url
        ) values (?, ?, ?, 'buyer', 'ar', ?, 'google', ?)`
      )
        .bind(
          userId,
          profile.email,
          profile.name || profile.email,
          profile.id,
          profile.picture || null
        )
        .run();

      user = {
        id: userId,
        email: profile.email,
        full_name: profile.name || profile.email,
        phone: null,
        role: "buyer"
      };
    } else {
      step = "update_existing_user_google_fields";

      await c.env.DB.prepare(
        `update users
         set google_id = ?,
             auth_provider = 'google',
             avatar_url = ?,
             full_name = coalesce(full_name, ?)
         where id = ?`
      )
        .bind(
          profile.id,
          profile.picture || null,
          profile.name || profile.email,
          user.id
        )
        .run();
    }

    step = "create_session";

    const token = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    await c.env.DB.prepare(
      `insert into sessions (
        id,
        user_id,
        token,
        expires_at
      ) values (?, ?, ?, ?)`
    )
      .bind(sessionId, user.id, token, expiresAt)
      .run();

    const redirectUrl = new URL("https://souq-rahba-platform.pages.dev/auth");
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("provider", "google");

    return c.redirect(redirectUrl.toString(), 302);
  } catch (err) {
    return c.json(
      {
        ok: false,
        code: "GOOGLE_CALLBACK_CRASH",
        message: "Google callback crashed",
        step,
        details: err instanceof Error ? err.message : String(err)
      },
      500
    );
  }
});
