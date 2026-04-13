export function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return `https://api.rahba.site${url}`;
  if (url.startsWith("media/")) return `https://api.rahba.site/${url}`;
  return url;
}

export function normalizeMarketplaceProduct(product) {
  if (!product || typeof product !== "object") {
    return {
      id: "",
      slug: "",
      name: "منتج",
      title: "منتج",
      price: 0,
      price_mad: 0,
      compare_at_price: null,
      seller_id: null,
      seller: "RAHBA",
      seller_verified: false,
      city: "",
      rating: 0,
      reviews: 0,
      stock: 0,
      stock_status: "out_of_stock",
      badge: "",
      badges: [],
      description: "",
      image_url: "",
      shipping_label: "",
      qty: 1,
      quantity: 1,
      raw: product ?? null
    };
  }

  const price = Number(product.price_mad ?? product.price ?? 0);
  const compareAtPrice = Number(
    product.compare_at_price ??
      product.original_price ??
      product.old_price ??
      0
  );

  const stock = Number(
    product.stock ??
      product.stock_quantity ??
      product.inventory_quantity ??
      0
  );

  const stockStatus =
    product.stock_status ??
    (stock <= 0 ? "out_of_stock" : stock <= 3 ? "low_stock" : "in_stock");

  const normalized = {
    id: product.id ?? "",
    slug: product.slug ?? "",
    name: product.title_ar || product.name || product.title || "",
    title: product.title_ar || product.name || product.title || "",
    price,
    price_mad: price,
    compare_at_price: compareAtPrice > price ? compareAtPrice : null,
    seller_id: product.seller_id || null,
    seller:
      product.seller_name ||
      product.seller ||
      product.brand ||
      product.store_name ||
      "RAHBA",
    seller_verified:
      product.seller_verified ??
      product.seller?.is_verified ??
      product.is_verified ??
      false,
    city: product.city || product.seller?.city || product.location || "",
    rating: Number(product.rating_avg ?? product.rating ?? product.avg_rating ?? 0),
    reviews: Number(
      product.reviews_count ?? product.reviews ?? product.rating_count ?? 0
    ),
    stock,
    stock_status: stockStatus,
    badge: product.featured ? "مميز" : product.status || product.badge || "",
    badges: Array.isArray(product.badges) ? product.badges : [],
    description: product.description_ar || product.description || "",
    image_url: resolveImageUrl(
      product.image_url ||
        product.image ||
        product.thumbnail ||
        product.featured_image ||
        ""
    ),
    shipping_label: product.shipping_label || product.delivery_time || "",
    qty: Number(product.qty || product.quantity || 1),
    quantity: Number(product.quantity || product.qty || 1),
    raw: product
  };

  return normalized;
}

export function normalizeMarketplaceProducts(products) {
  return Array.isArray(products)
    ? products.map(normalizeMarketplaceProduct)
    : [];
}
