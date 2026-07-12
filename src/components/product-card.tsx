import { Link } from "@tanstack/react-router";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const p = product.node;
  const img = p.images?.edges?.[0]?.node;
  const tagLabel = p.productType || p.tags?.[0] || "";
  return (
    <Link
      to="/produit/$slug"
      params={{ slug: p.handle }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {img && (
          <img
            src={img.url}
            alt={img.altText ?? p.title}
            loading="lazy"
            width={800}
            height={1000}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
        )}
        {tagLabel && (
          <span className="absolute left-3 top-3 bg-background/95 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.25em] text-foreground/80">
            {tagLabel}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1 text-center">
        <h3 className="font-serif text-lg leading-tight">{p.title}</h3>
        <p className="text-sm tracking-wide text-muted-foreground">
          {p.priceRange?.minVariantPrice ? formatMoney(p.priceRange.minVariantPrice) : ""}
        </p>
      </div>
    </Link>
  );
}
