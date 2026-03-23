import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";

export const uploadRouter = new Hono<import("../types").AppEnv>();

uploadRouter.post("/upload", authMiddleware, requireRole("seller", "admin"), async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return c.json(
        { ok: false, code: "INVALID_FILE", message: "No file uploaded" },
        400
      );
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const safeExt = String(ext || "bin").toLowerCase();
    const filename = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}.${safeExt}`;
    const key = `media/${filename}`;

    await c.env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type || "application/octet-stream"
      }
    });

    const publicUrl = `https://api.rahba.site/media/${filename}`;

    return c.json({
      ok: true,
      data: {
        key,
        filename,
        url: publicUrl
      }
    });
  } catch (error) {
    console.error("POST /upload failed:", error);
    return c.json(
      { ok: false, code: "UPLOAD_FAILED", message: "Failed to upload file" },
      500
    );
  }
});

uploadRouter.get("/media/:filename", async (c) => {
  try {
    const filename = String(c.req.param("filename") || "").trim();

    if (!filename) {
      return c.json(
        { ok: false, code: "INVALID_FILENAME", message: "Filename is required" },
        400
      );
    }

    const key = `media/${filename}`;
    const object = await c.env.MEDIA_BUCKET.get(key);

    if (!object) {
      return c.json(
        { ok: false, code: "FILE_NOT_FOUND", message: "Media file not found" },
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
      { ok: false, code: "MEDIA_READ_FAILED", message: "Failed to load media file" },
      500
    );
  }
});

export default uploadRouter;
