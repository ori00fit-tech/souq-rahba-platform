export const ok = <T>(data: T, init?: ResponseInit) => Response.json({ ok: true, data }, init);
export const fail = (code: string, message: string, status = 400) =>
  Response.json({ ok: false, code, message }, { status });
