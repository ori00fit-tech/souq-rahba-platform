export async function listProducts() {
  return { success: true, data: [] };
}

export async function getProductBySlug(slug: string) {
  return { success: true, data: { slug } };
}

export async function createProduct(payload: Record<string, unknown>) {
  return { success: true, data: payload };
}
