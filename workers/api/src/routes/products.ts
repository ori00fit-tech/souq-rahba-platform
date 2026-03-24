import { Hono } from "hono";
import { getFullProductPageData } from "../services/product.service";
import {
  presentProductFull,
  presentProductNotFound,
  presentProductServerError
} from "../presenters/product.presenter";

export const productsRouter = new Hono<import("../types").AppEnv>();

productsRouter.get("/:slug/full", async (c) => {
  const slug = String(c.req.param("slug") || "").trim().toLowerCase();

  if (!slug) {
    return c.json(presentProductNotFound(), 404);
  }

  try {
    const data = await getFullProductPageData(c.env, slug);

    if (!data) {
      return c.json(presentProductNotFound(), 404);
    }

    c.header("Cache-Control", "public, max-age=60");
    return c.json(presentProductFull(data));
  } catch (error) {
    console.error("GET /catalog/products/:slug/full failed:", error);
    return c.json(presentProductServerError(), 500);
  }
});
