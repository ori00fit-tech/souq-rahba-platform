import { Hono } from "hono";
import { fail } from "../utils/response";

export const mediaRouter = new Hono<import("../types").AppEnv>();

mediaRouter.get("/media/:filename", async (c) => {
  try {
    const raw = String(c.req.param("filename") || "").trim();

    if (!raw) {
      return c.json(
        fail("INVALID_FILENAME", "Filename is required"),
        400
      );
    }

    let filename = raw;
    try {
      filename = decodeURIComponent(raw);
    } catch {
      filename = raw;
    }

    const object = await c.env.MEDIA.get(filename);

    if (!object) {
      return c.json(
        fail("FILE_NOT_FOUND", "Media file not found"),
        404
      );
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("GET /media/:filename failed:", error);
    return c.json(
      fail("MEDIA_READ_FAILED", "Failed to load media file"),
      500
    );
  }
});

export default mediaRouter;
