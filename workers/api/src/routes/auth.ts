import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

export const authRouter = new Hono<import("../types").AppEnv>();

function hashPassword(password: string) {
  return btoa(password);
}

authRouter.post("/register", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "Email and password are required" },
      400
    );
  }

  const existing = await c.env.DB.prepare(
    `select id from users where email = ? limit 1`
  )
    .bind(body.email)
    .first();

  if (existing) {
    return c.json(
      { ok: false, code: "EMAIL_EXISTS", message: "Email already exists" },
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
      password_hash
    ) values (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      userId,
      body.email,
      body.full_name || null,
      body.phone || null,
      body.role || "buyer",
      body.locale || "ar",
      hashPassword(body.password)
    )
    .run();

  return c.json(
    {
      ok: true,
      data: {
        id: userId,
        email: body.email,
        role: body.role || "buyer"
      }
    },
    201
  );
});

authRouter.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return c.json(
      { ok: false, code: "INVALID_BODY", message: "Email and password are required" },
      400
    );
  }

  const user = await c.env.DB.prepare(
    `select id, email, full_name, role, password_hash
     from users
     where email = ?
     limit 1`
  )
    .bind(body.email)
    .first();

  if (!user || user.password_hash !== hashPassword(body.password)) {
    return c.json(
      { ok: false, code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
      401
    );
  }

  const token = crypto.randomUUID();
  const sessionId = crypto.randomUUID();

  await c.env.DB.prepare(
    `insert into sessions (
      id,
      user_id,
      token
    ) values (?, ?, ?)`
  )
    .bind(sessionId, user.id, token)
    .run();

  return c.json({
    ok: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    }
  });
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

authRouter.get("/auth/google/callback", async (c) => {
  const code = c.req.query("code");

  if (!code) {
    return c.json({ ok: false, message: "Missing code" }, 400);
  }

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

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return c.json({ ok: false, message: "Failed to get token", tokenData }, 400);
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const googleUser = await userRes.json();

  const email = googleUser.email;
  const googleId = googleUser.id;
  const name = googleUser.name;
  const avatar = googleUser.picture;

  if (!email) {
    return c.json({ ok: false, message: "No email from Google" }, 400);
  }

  // check user
  let user = await c.env.DB.prepare(
    `select * from users where email = ? limit 1`
  )
    .bind(email)
    .first();

  if (!user) {
    const id = crypto.randomUUID();

    await c.env.DB.prepare(
      `insert into users (
        id,
        email,
        full_name,
        google_id,
        auth_provider,
        avatar_url
      ) values (?, ?, ?, ?, 'google', ?)`
    )
      .bind(id, email, name, googleId, avatar)
      .run();

    user = { id, email };
  } else {
    await c.env.DB.prepare(
      `update users
       set google_id = ?, auth_provider = 'google', avatar_url = ?
       where id = ?`
    )
      .bind(googleId, avatar, user.id)
      .run();
  }

  // create session
  const sessionId = crypto.randomUUID();

  await c.env.DB.prepare(
    `insert into sessions (id, user_id)
     values (?, ?)`
  )
    .bind(sessionId, user.id)
    .run();

  // redirect to frontend
  return c.redirect(`https://rahba.site?session=${sessionId}`);
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
    return c.json({ ok: false, code: "MISSING_CODE", message: "Missing Google code" }, 400);
  }

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

  const tokenData = await tokenRes.json().catch(() => null);

  if (!tokenRes.ok || !tokenData?.access_token) {
    return c.json(
      { ok: false, code: "GOOGLE_TOKEN_EXCHANGE_FAILED", message: "Failed to exchange code", details: tokenData },
      400
    );
  }

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const profile = await profileRes.json().catch(() => null);

  if (!profileRes.ok || !profile?.email || !profile?.id) {
    return c.json(
      { ok: false, code: "GOOGLE_PROFILE_FAILED", message: "Failed to fetch Google profile", details: profile },
      400
    );
  }

  let user = await c.env.DB.prepare(
    `select id, email, full_name, role from users where google_id = ? limit 1`
  )
    .bind(profile.id)
    .first();

  if (!user) {
    user = await c.env.DB.prepare(
      `select id, email, full_name, role from users where email = ? limit 1`
    )
      .bind(profile.email)
      .first();
  }

  if (!user) {
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
      role: "buyer"
    };
  } else {
    await c.env.DB.prepare(
      `update users
       set google_id = ?, auth_provider = 'google', avatar_url = ?, full_name = coalesce(full_name, ?)
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
    `insert into sessions (id, user_id, created_at)
     values (?, ?, current_timestamp)`
  )
    .bind(sessionId, user.id)
    .run();

  const token = sessionId;

  return c.redirect(`https://rahba.site/auth?google=success&token=${encodeURIComponent(token)}`);
});

