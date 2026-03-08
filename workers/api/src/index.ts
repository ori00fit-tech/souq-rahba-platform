import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "./middleware/request-id";
import { healthRouter } from "./routes/health";
import { catalogRouter } from "./routes/catalog";
import { sellerRouter } from "./routes/sellers";
import { orderRouter } from "./routes/orders";
import type { Bindings } from "./types";
import { getProductsHandler } from "./routes/catalog/getProducts";
import { getProductBySlugHandler } from "./routes/catalog/getProductBySlug";
import { createProductHandler } from "./routes/catalog/createProduct";
import { uploadRouter } from "./routes/upload";
import { createVendorHandler } from "./routes/vendors/createVendor";
import { getVendorProfileHandler } from "./routes/vendors/getVendorProfile";
import { updateVendorHandler } from "./routes/vendors/updateVendor";

import { createOrderHandler } from "./routes/orders/createOrder";
import { getOrderHandler } from "./routes/orders/getOrder";
import { listOrdersHandler } from "./routes/orders/listOrders";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/products", getProductsHandler);
app.get("/api/products/:slug", getProductBySlugHandler);
app.post("/api/products", createProductHandler);

app.post("/api/vendors", createVendorHandler);
app.get("/api/vendors/:id", getVendorProfileHandler);
app.put("/api/vendors/:id", updateVendorHandler);

app.get("/api/orders", listOrdersHandler);
app.get("/api/orders/:id", getOrderHandler);
app.post("/api/orders", createOrderHandler);
app.use("*", cors());
app.use("*", requestId);

app.route("/", healthRouter);
app.route("/catalog", catalogRouter);
app.route("/marketplace", sellerRouter);
app.route("/commerce", orderRouter);
app.route("/", uploadRouter);

app.notFound((c) => c.json({ ok: false, code: "NOT_FOUND", message: "Route not found" }, 404));

export default app;
