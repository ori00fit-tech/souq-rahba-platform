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
