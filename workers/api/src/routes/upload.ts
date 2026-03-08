import { Hono } from "hono";

const uploadRouter = new Hono();

uploadRouter.post("/upload", async (c) => {

  const body = await c.req.parseBody();
  const file = body.file as File;

  if (!file) {
    return c.json({ error: "No file uploaded" }, 400);
  }

  const filename = `${Date.now()}-${file.name}`;

  await c.env.MEDIA.put(filename, file.stream(), {
    httpMetadata: {
      contentType: file.type
    }
  });

  const url = `https://your-r2-domain/${filename}`;

  return c.json({
    url
  });

});

export { uploadRouter };
