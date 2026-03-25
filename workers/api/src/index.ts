import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "./middleware/request-id";
import { healthRouter } from "./routes/health";
import { catalogRouter } from "./routes/catalog";
import { catalogManagementRouter } from "./routes/catalog-management";
import { productsRouter } from "./routes/products";
import { homeRouter } from "./routes/home";
import { reviewsRouter } from "./routes/reviews";
import { sellerRouter } from "./routes/sellers";
import { orderRouter } from "./routes/orders";
import { uploadRouter } from "./routes/upload";
import { mediaRouter } from "./routes/media";
import { authRouter } from "./routes/auth";
import { whatsappRouter } from "./routes/whatsapp";
import { adminRouter } from "./routes/admin";
import { fail } from "./utils/response";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use("*", cors());
app.use("*", requestId);

app.route("/", healthRouter);
app.route("/auth", authRouter);
app.route("/catalog/products", productsRouter);
app.route("/catalog", homeRouter);
app.route("/catalog", reviewsRouter);
app.route("/catalog", catalogManagementRouter);
app.route("/catalog", catalogRouter);
app.route("/marketplace", sellerRouter);
app.route("/admin", adminRouter);
app.route("/commerce", orderRouter);
app.route("/", uploadRouter);
app.route("/", mediaRouter);
app.route("/", whatsappRouter);

app.notFound((c) =>
  c.json(
    fail("NOT_FOUND", "Route not found"),
    404
  )
);

export default app;
