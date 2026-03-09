import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";

const uploadRouter = new Hono<{ Bindings: import("../types").Bindings }>();

uploadRouter.post("/upload", authMiddleware, requireRole("seller", "admin"), async (c) => {
  const body = await c.req.parseBody();
  const file = body.file as File;

  if (!file) {
    return c.json({ ok: false, error: "No file uploaded" }, 400);
  }

  const filename = `${Date.now()}-${file.name}`;

  await c.env.MEDIA.put(filename, file.stream(), {
    httpMetadata: {
      contentType: file.type
    }
  });

  return c.json({
    ok: true,
    key: filename,
    url: `${new URL(c.req.url).origin}/media/${filename}`
  });
});

export { uploadRouter };
