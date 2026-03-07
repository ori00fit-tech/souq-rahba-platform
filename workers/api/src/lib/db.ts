import type { Bindings } from "../types";

export async function all<T>(env: Bindings, sql: string, ...bindings: unknown[]) {
  const stmt = env.DB.prepare(sql).bind(...bindings);
  const result = await stmt.all<T>();
  return result.results;
}

export async function first<T>(env: Bindings, sql: string, ...bindings: unknown[]) {
  const stmt = env.DB.prepare(sql).bind(...bindings);
  const result = await stmt.first<T>();
  return result;
}
