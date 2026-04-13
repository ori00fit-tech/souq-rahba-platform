export function normalizeMarketplaceSeller(seller) {
  if (!seller || typeof seller !== "object") {
    return {
      id: "",
      slug: "",
      name: "متجر",
      city: "المغرب",
      rating: 0,
      verified: false,
      kyc_status: "",
      products_count: 0,
      raw: seller ?? null
    };
  }

  return {
    id: seller.id || "",
    slug: seller.slug || "",
    name: seller.display_name || seller.name || "متجر",
    city: seller.city || "المغرب",
    rating: Number(seller.rating || seller.rating_avg || 0),
    verified: Boolean(
      seller.verified ??
        seller.is_verified ??
        seller.kyc_status === "approved"
    ),
    kyc_status: seller.kyc_status || "",
    products_count: Number(seller.products_count || 0),
    raw: seller
  };
}

export function normalizeMarketplaceSellers(sellers) {
  return Array.isArray(sellers)
    ? sellers.map(normalizeMarketplaceSeller)
    : [];
}
