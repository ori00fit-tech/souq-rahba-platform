import { Hono } from "hono";

const uploadRouter = new Hono();

uploadRouter.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body.file as File | undefined;

  if (!file) {
    return c.json({ ok: false, error: "No file uploaded" }, 400);
  }

  if (!file.type || !file.type.startsWith("image/")) {
    return c.json({ ok: false, error: "Only image files are allowed" }, 400);
  }

  const safeName = file.name.replace(/\s+/g, "-");
  const key = `products/${Date.now()}-${safeName}`;

  await c.env.MEDIA.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type
    }
  });

  return c.json({
    ok: true,
    key,
    message: "Image uploaded successfully"
  });
});

export { uploadRouter };
