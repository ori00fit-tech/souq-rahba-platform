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

    const originalName = String(file.name || "file").trim();
    const ext = originalName.includes(".") ? originalName.split(".").pop() : "bin";
    const safeExt = String(ext || "bin").toLowerCase();
    const filename = `${Date.now()}-${originalName.replace(/[^\w.\- ]+/g, "_")}`;
    const finalName = filename.endsWith(`.${safeExt}`) ? filename : `${filename}.${safeExt}`;

    // مهم: نخزن غير filename، ماشي media/filename
    await c.env.MEDIA.put(finalName, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type || "application/octet-stream"
      }
    });

    const publicUrl = `https://api.rahba.site/media/${encodeURIComponent(finalName)}`;

    return c.json({
      ok: true,
      data: {
        key: finalName,
        filename: finalName,
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

export default uploadRouter;
