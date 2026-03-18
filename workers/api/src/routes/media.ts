import { Hono } from "hono";

export const mediaRouter = new Hono<import("../types").AppEnv>();

mediaRouter.get("/:key", async (c) => {
  const key = c.req.param("key");
  const object = await c.env.MEDIA.get(key);

  if (!object) {
    return c.json(
      { ok: false, code: "NOT_FOUND", message: "Media not found" },
      404
    );
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    headers
  });
});
