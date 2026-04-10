import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { ok, fail } from "../utils/response";
import { AuthErrors } from "../utils/auth-errors";
import { rateLimit } from "../middleware/rateLimit";
import { hashPassword, verifyPassword } from "../lib/password";
import type { AppEnv } from "../types";

export const authRouter = new Hono<AppEnv>();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 8;
}

function normalizeEmail(email: unknown): string {
  return String(email || "").trim().toLowerCase();
}

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "buyer" | "seller" | "admin";
  password_hash: string | null;
};

type GoogleTokenResponse = {
  access_token?: string;
};

type GoogleProfileResponse = {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
};

authRouter.post(
  "/register",
  rateLimit({ keyPrefix: "register", limit: 3, windowSeconds: 1800 }),
  async (c) => {
    try {
      const body = await c.req.json().catch(() => null);

      if (!body || typeof body !== "object") {
        return c.json(AuthErrors.invalidBody(), 400);
      }

      const email = normalizeEmail((body as Record<string, unknown>).email);
      const password = String((body as Record<string, unknown>).password || "");
      const fullName = String((body as Record<string, unknown>).full_name || "").trim();
      const phone = String((body as Record<string, unknown>).phone || "").trim();
      const locale = String((body as Record<string, unknown>).locale || "ar").trim() || "ar";
      const requestedRole = String((body as Record<string, unknown>).role || "buyer")
        .trim()
        .toLowerCase();
      const role = requestedRole === "seller" ? "seller" : "buyer";

      if (!email || !isValidEmail(email)) {
        return c.json(AuthErrors.invalidEmail(), 400);
      }

      if (!isStrongPassword(password)) {
        return c.json(AuthErrors.weakPassword(), 400);
      }

      const existing = await c.env.DB.prepare(
        `select id from users where email = ? limit 1`
      )
        .bind(email)
        .first();

      if (existing) {
        return c.json(AuthErrors.emailAlreadyExists(), 409);
      }

      const userId = crypto.randomUUID();
      const passwordHash = await hashPassword(password);

      await c.env.DB.prepare(
        `insert into users (
          id,
          email,
          full_name,
          phone,
          role,
          locale,
          password_hash
        ) values (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          userId,
          email,
          fullName || null,
          phone || null,
          role,
          locale,
          passwordHash
        )
        .run();

      return c.json(
        ok({
          user: {
            id: userId,
            email,
            full_name: fullName || null,
            phone: phone || null,
            role
          }
        }),
        201
      );
    } catch (err) {
      return c.json(
        fail(
          "REGISTER_FAILED",
          "Registration failed",
          err instanceof Error ? err.message : String(err)
        ),
        500
      );
    }
  }
);

authRouter.post(
  "/login",
  rateLimit({ keyPrefix: "login", limit: 5, windowSeconds: 600 }),
  async (c) => {
    try {
      const body = await c.req.json().catch(() => null);

      if (!body || typeof body !== "object") {
        return c.json(AuthErrors.invalidBody(), 400);
      }

      const email = normalizeEmail((body as Record<string, unknown>).email);
      const password = String((body as Record<string, unknown>).password || "");

      if (!email || !password) {
        return c.json(
          AuthErrors.invalidBody("Email and password are required"),
          400
        );
      }

      if (!isValidEmail(email)) {
        return c.json(AuthErrors.invalidEmail(), 400);
      }

      const userRaw = await c.env.DB.prepare(
        `select id, email, full_name, phone, role, password_hash
         from users
         where email = ?
         limit 1`
      )
        .bind(email)
        .first();

      const user = userRaw as UserRow | null;

      if (!user || !user.password_hash) {
        return c.json(AuthErrors.invalidCredentials(), 401);
      }

      const passwordCheck = await verifyPassword(password, user.password_hash);

      if (!passwordCheck.valid) {
        return c.json(AuthErrors.invalidCredentials(), 401);
      }

      if (passwordCheck.needsRehash) {
        const upgradedHash = await hashPassword(password);

        await c.env.DB.prepare(
          `update users set password_hash = ? where id = ?`
        )
          .bind(upgradedHash, user.id)
          .run();
      }

      const token = crypto.randomUUID();
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 30
      ).toISOString();

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

      return c.json(
        ok({
          token,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: user.role
          }
        })
      );
    } catch (err) {
      return c.json(
        fail(
          "LOGIN_FAILED",
          "Login failed",
          err instanceof Error ? err.message : String(err)
        ),
        500
      );
    }
  }
);

authRouter.get("/me", authMiddleware, async (c) => {
  const authUser = c.get("authUser");

  return c.json(
    ok({
      user: {
        id: authUser.user_id,
        email: authUser.email,
        full_name: authUser.full_name,
        role: authUser.role
      }
    })
  );
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
      return c.json(AuthErrors.missingGoogleCode(), 400);
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

    const tokenData = (await tokenRes.json().catch(() => ({}))) as GoogleTokenResponse;

    if (!tokenRes.ok || !tokenData.access_token) {
      return c.json(
        fail(
          "GOOGLE_TOKEN_EXCHANGE_FAILED",
          "Failed to exchange Google code",
          { step }
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

    const profile = (await profileRes.json().catch(() => ({}))) as GoogleProfileResponse;

    if (!profileRes.ok || !profile.email || !profile.id) {
      return c.json(
        fail(
          "GOOGLE_PROFILE_FAILED",
          "Failed to fetch Google profile",
          { step }
        ),
        400
      );
    }

    step = "lookup_user_by_google_id";

    let userRaw = await c.env.DB.prepare(
      `select id, email, full_name, phone, role
       from users
       where google_id = ?
       limit 1`
    )
      .bind(profile.id)
      .first();

    let user = userRaw as {
      id: string;
      email: string;
      full_name: string | null;
      phone: string | null;
      role: "buyer" | "seller" | "admin";
    } | null;

    if (!user) {
      step = "lookup_user_by_email";

      const byEmailRaw = await c.env.DB.prepare(
        `select id, email, full_name, phone, role
         from users
         where email = ?
         limit 1`
      )
        .bind(profile.email)
        .first();

      user = byEmailRaw as {
        id: string;
        email: string;
        full_name: string | null;
        phone: string | null;
        role: "buyer" | "seller" | "admin";
      } | null;
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
      fail(
        "GOOGLE_CALLBACK_CRASH",
        "Google callback crashed",
        {
          step,
          details: err instanceof Error ? err.message : String(err)
        }
      ),
      500
    );
  }
});

authRouter.post("/logout", authMiddleware, async (c) => {
  try {
    const authHeader = c.req.header("Authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (token) {
      await c.env.DB.prepare(`delete from sessions where token = ?`)
        .bind(token)
        .run();
    }

    return c.json(
      ok({
        message: "Logged out successfully"
      })
    );
  } catch (err) {
    return c.json(
      fail(
        "LOGOUT_FAILED",
        "Logout failed",
        err instanceof Error ? err.message : String(err)
      ),
      500
    );
  }
});
