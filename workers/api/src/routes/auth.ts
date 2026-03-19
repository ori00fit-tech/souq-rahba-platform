import { Hono } from "hono";
import type { AppEnv } from "../types";
import { authMiddleware } from "../middleware/auth";

export const authRouter = new Hono<AppEnv>();

type GoogleTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleProfile = {
  id?: string;
  email?: string;
  verified_email?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

function jsonError(message: string, code = "BAD_REQUEST", status = 400) {
  return { ok: false, code, message, status };
}

authRouter.post("/auth/register", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body?.email || !body?.password || !body?.full_name) {
    return c.json(jsonError("Missing required fields", "INVALID_BODY", 400), 400);
  }

  const email = String(body.email).trim().toLowerCase();
  const password = String(body.password).trim();
  const fullName = String(body.full_name).trim();
  const phone = body.phone ? String(body.phone).trim() : null;
  const role = body.role === "seller" ? "seller" : "buyer";

  const existing = await c.env.DB.prepare(
    `select id from users where email = ? limit 1`
  )
    .bind(email)
    .first<{ id: string }>();

  if (existing) {
    return c.json(jsonError("Email already exists", "EMAIL_EXISTS", 409), 409);
  }

  const userId = crypto.randomUUID();
  const passwordHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password)
  );
  const passwordHashHex = Array.from(new Uint8Array(passwordHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  await c.env.DB.prepare(
    `insert into users (
      id,
      email,
      password_hash,
      full_name,
      phone,
      role,
      auth_provider
    ) values (?, ?, ?, ?, ?, ?, 'password')`
  )
    .bind(userId, email, passwordHashHex, fullName, phone, role)
    .run();

  const sessionId = crypto.randomUUID();

  await c.env.DB.prepare(
    `insert into sessions (id, user_id) values (?, ?)`
  )
    .bind(sessionId, userId)
    .run();

  return c.json({
    ok: true,
    data: {
      token: sessionId,
      user: {
        id: userId,
        email,
        full_name: fullName,
        phone,
        role
      }
    }
  });
});

authRouter.post("/auth/login", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return c.json(jsonError("Missing email or password", "INVALID_BODY", 400), 400);
  }

  const email = String(body.email).trim().toLowerCase();
  const password = String(body.password).trim();

  const user = await c.env.DB.prepare(
    `select
      id,
      email,
      password_hash,
      full_name,
      phone,
      role
    from users
    where email = ?
    limit 1`
  )
    .bind(email)
    .first<{
      id: string;
      email: string;
      password_hash: string | null;
      full_name: string | null;
      phone: string | null;
      role: "buyer" | "seller" | "admin";
    }>();

  if (!user?.id || !user.password_hash) {
    return c.json(jsonError("Invalid credentials", "INVALID_CREDENTIALS", 401), 401);
  }

  const passwordHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password)
  );
  const passwordHashHex = Array.from(new Uint8Array(passwordHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (passwordHashHex !== user.password_hash) {
    return c.json(jsonError("Invalid credentials", "INVALID_CREDENTIALS", 401), 401);
  }

  const sessionId = crypto.randomUUID();

  await c.env.DB.prepare(
    `insert into sessions (id, user_id) values (?, ?)`
  )
    .bind(sessionId, user.id)
    .run();

  return c.json({
    ok: true,
    data: {
      token: sessionId,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role
      }
    }
  });
});

authRouter.get("/auth/me", authMiddleware, async (c) => {
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

authRouter.get("/auth/google/start", async (c) => {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", c.env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", c.env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  return c.redirect(url.toString());
});

authRouter.get("/auth/google/callback", async (c) => {
  const code = c.req.query("code");

  if (!code) {
    return c.json(jsonError("Missing Google code", "MISSING_CODE", 400), 400);
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code"
    })
  });

  const tokenData = (await tokenRes.json().catch(() => ({}))) as GoogleTokenResponse;

  if (!tokenRes.ok || !tokenData.access_token) {
    return c.json(
      {
        ok: false,
        code: "GOOGLE_TOKEN_EXCHANGE_FAILED",
        message: "Failed to exchange Google code",
        details: tokenData
      },
      400
    );
  }

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const profile = (await profileRes.json().catch(() => ({}))) as GoogleProfile;

  if (!profileRes.ok || !profile.email || !profile.id) {
    return c.json(
      {
        ok: false,
        code: "GOOGLE_PROFILE_FAILED",
        message: "Failed to fetch Google profile",
        details: profile
      },
      400
    );
  }

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
    const userId = crypto.randomUUID();

    await c.env.DB.prepare(
      `insert into users (
        id,
        email,
        full_name,
        role,
        google_id,
        auth_provider,
        avatar_url
      ) values (?, ?, ?, 'buyer', ?, 'google', ?)`
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

  const sessionId = crypto.randomUUID();

  await c.env.DB.prepare(
    `insert into sessions (id, user_id) values (?, ?)`
  )
    .bind(sessionId, user.id)
    .run();

  return c.redirect(
    `https://rahba.site/auth?google=success&token=${encodeURIComponent(sessionId)}`
  );
});

authRouter.get("/auth/debug-google-env", async (c) => {
  return c.json({
    ok: true,
    has_client_id: !!c.env.GOOGLE_CLIENT_ID,
    has_client_secret: !!c.env.GOOGLE_CLIENT_SECRET,
    has_redirect_uri: !!c.env.GOOGLE_REDIRECT_URI
  });
});

