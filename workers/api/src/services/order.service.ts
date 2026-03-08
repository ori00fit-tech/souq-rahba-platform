export async function createOrder(payload: Record<string, unknown>) {
  return { success: true, data: payload };
}

export async function getOrder(id: string) {
  return { success: true, data: { id } };
}

export async function listOrders() {
  return { success: true, data: [] };
}
