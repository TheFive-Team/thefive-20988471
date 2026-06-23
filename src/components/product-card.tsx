import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { formatDZD, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { tr, lang } = useI18n();
  return (
    <Link
      to="/produit/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name[lang]}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 bg-background/95 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.25em] text-foreground/80">
          {product.category === "boys" ? tr("nav.boys") : product.category === "girls" ? tr("nav.girls") : "Unisexe"}
        </span>
      </div>
      <div className="mt-4 space-y-1 text-center">
        <h3 className="font-serif text-lg leading-tight">{product.name[lang]}</h3>
        <p className="text-sm tracking-wide text-muted-foreground">{formatDZD(product.price)}</p>
      </div>
    </Link>
  );
}
