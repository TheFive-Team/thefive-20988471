import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { ProductCard } from "@/components/product-card";

const searchSchema = z.object({
  cat: z.enum(["all", "boys", "girls", "outer", "knit"]).catch("all"),
});

export const Route = createFileRoute("/boutique")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Boutique — The Five A" },
      { name: "description", content: "Découvrez la collection complète de vêtements raffinés pour enfants. Livraison dans toute l'Algérie." },
      { property: "og:title", content: "Boutique — The Five A" },
      { property: "og:description", content: "Collection complète : vestes, mailles, chemises, jupes." },
    ],
  }),
  component: ShopPage,
});

function matchCategory(tags: string[], productType: string, cat: string): boolean {
  const all = [...tags.map((t) => t.toLowerCase()), productType.toLowerCase()];
  if (cat === "boys") return all.some((t) => ["boys", "garçons", "garcons", "unisex", "unisexe"].includes(t));
  if (cat === "girls") return all.some((t) => ["girls", "filles", "unisex", "unisexe"].includes(t));
  if (cat === "outer") return all.some((t) => ["outer", "outerwear", "manteau", "manteaux", "veste", "vestes", "coat"].includes(t));
  if (cat === "knit") return all.some((t) => ["knit", "knitwear", "maille", "mailles", "tricot"].includes(t));
  return true;
}

function ShopPage() {
  const { tr } = useI18n();
  const { cat } = Route.useSearch();
  const { data: products = [], isLoading } = useShopifyProducts();

  const filtered = useMemo(() => {
    if (cat === "all") return products;
    return products.filter((p) => matchCategory(p.node.tags, p.node.productType, cat));
  }, [cat, products]);

  const tabs: { key: typeof cat; label: string }[] = [
    { key: "all", label: tr("shop.all") },
    { key: "boys", label: tr("shop.boys") },
    { key: "girls", label: tr("shop.girls") },
    { key: "outer", label: tr("shop.outer") },
    { key: "knit", label: tr("shop.knit") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24">
      <div className="text-center">
        <p className="eyebrow text-accent">Collection · 2026</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-6xl">{tr("shop.title")}</h1>
        <div className="hairline mx-auto mt-5 w-24" />
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-border py-5 text-[0.7rem] uppercase tracking-[0.25em]">
        {tabs.map((t) => (
          <Link
            key={t.key}
            to="/boutique"
            search={{ cat: t.key }}
            className={`transition-colors ${cat === t.key ? "text-accent" : "text-foreground/65 hover:text-foreground"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-20 text-center text-muted-foreground">Chargement…</p>
      ) : (
        <div className="mt-14 grid grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-3">
          {filtered.map((p) => <ProductCard key={p.node.id} product={p} />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="mt-20 text-center text-muted-foreground">No products found.</p>
      )}
    </div>
  );
}
