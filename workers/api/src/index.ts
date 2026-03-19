import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "./middleware/request-id";
import { healthRouter } from "./routes/health";
import { catalogRouter } from "./routes/catalog";
import { sellerRouter } from "./routes/sellers";
import { orderRouter } from "./routes/orders";
import { uploadRouter } from "./routes/upload";
import { mediaRouter } from "./routes/media";
import { authRouter } from "./routes/auth";
import { adminRouter } from "./routes/admin";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use("*", cors());
app.use("*", requestId);

app.route("/", healthRouter);
app.route("/auth", authRouter);
app.route("/catalog", catalogRouter);
app.route("/marketplace", sellerRouter);
app.route("/admin", adminRouter);
app.route("/commerce", orderRouter);
app.route("/", uploadRouter);
app.route("/", mediaRouter);

app.notFound((c) =>
  c.json(
    { ok: false, code: "NOT_FOUND", message: "Route not found" },
    404
  )
);

export default app;
