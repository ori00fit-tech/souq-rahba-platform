export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json({ ok: false, code: "METHOD_NOT_ALLOWED" }, { status: 405 });
    }
    const event = await request.json().catch(() => null);
    return Response.json({ ok: true, received: event });
  }
};
