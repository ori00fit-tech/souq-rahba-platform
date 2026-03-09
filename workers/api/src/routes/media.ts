import { Hono } from "hono";

const mediaRouter = new Hono();

mediaRouter.get("/media/*", async (c) => {

  const key = c.req.path.replace("/media/", "");

  const object = await c.env.MEDIA.get(key);

  if (!object) {
    return c.text("Not found", 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    headers
  });

});

export { mediaRouter };
