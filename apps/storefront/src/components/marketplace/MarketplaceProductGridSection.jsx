import MarketplaceProductCard from "./MarketplaceProductCard";

export default function MarketplaceProductGridSection({
  title,
  subtitle,
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  productBasePath = "/products",
}) {
  return (
    <section className="py-6 lg:py-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          {title ? (
            <h2 className="text-xl font-bold tracking-tight text-slate-900 lg:text-2xl">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {products.map((product) => (
            <MarketplaceProductCard
              key={product.id || product.slug}
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlistIds.includes(product.id)}
              productBasePath={productBasePath}
            />
          ))}
        </div>
      )}
    </section>
  );
}
