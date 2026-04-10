import { ok, fail } from "../utils/response";

export function presentProductFull(data: unknown) {
  return ok(data);
}

export function presentProductNotFound() {
  return fail("NOT_FOUND", "Product not found");
}

export function presentProductServerError() {
  return fail("SERVER_ERROR", "Failed to load full product page data");
}
