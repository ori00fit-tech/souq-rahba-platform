export function presentProductFull(data: unknown) {
  return {
    ok: true,
    data
  };
}

export function presentProductNotFound() {
  return {
    ok: false,
    code: "NOT_FOUND",
    message: "Product not found"
  };
}

export function presentProductServerError() {
  return {
    ok: false,
    code: "SERVER_ERROR",
    message: "Failed to load full product page data"
  };
}
