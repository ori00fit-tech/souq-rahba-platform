export function normalizeMarketplaceCategory(category) {
  if (!category || typeof category !== "object") {
    return {
      id: "",
      slug: "",
      name: "فئة",
      description: "تصفح المنتجات داخل هذه الفئة",
      icon: "📦",
      raw: category ?? null
    };
  }

  return {
    id: category.id || "",
    slug: category.slug || "",
    name: category.name_ar || category.name || "فئة",
    description:
      category.description_ar ||
      category.description ||
      "تصفح المنتجات داخل هذه الفئة",
    icon: category.icon || "📦",
    raw: category
  };
}

export function normalizeMarketplaceCategories(categories) {
  return Array.isArray(categories)
    ? categories.map(normalizeMarketplaceCategory)
    : [];
}
