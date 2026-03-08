export async function createVendor(payload: Record<string, unknown>) {
  return { success: true, data: payload };
}

export async function getVendorProfile(id: string) {
  return { success: true, data: { id } };
}

export async function updateVendor(id: string, payload: Record<string, unknown>) {
  return { success: true, data: { id, ...payload } };
}
