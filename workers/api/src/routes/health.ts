import { Hono } from "hono";

export const healthRouter = new Hono();
healthRouter.get("/health", (c) => c.json({ ok: true, service: "souq-api", time: new Date().toISOString() }));
