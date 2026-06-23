import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { products, formatDZD } from "@/lib/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/produit/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name.fr ?? "Produit"} — The Five A` },
      { name: "description", content: loaderData?.product.description.fr ?? "" },
      { property: "og:title", content: loaderData?.product.name.fr ?? "" },
      { property: "og:description", content: loaderData?.product.description.fr ?? "" },
      { property: "og:image", content: loaderData?.product.image ?? "" },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="px-6 py-32 text-center">
      <h1 className="font-serif text-3xl">Article introuvable</h1>
      <Link to="/boutique" search={{ cat: "all" }} className="mt-6 inline-block underline">Retour à la boutique</Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { tr, lang } = useI18n();
  const { add } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product.slug, size, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const buyNow = () => {
    add(product.slug, size, 1);
    navigate({ to: "/panier" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      <Link to="/boutique" search={{ cat: "all" }} className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground hover:text-accent">
        ← {tr("nav.shop")}
      </Link>
      <div className="mt-8 grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="bg-secondary">
          <img src={product.image} alt={product.name[lang]} width={800} height={1000} className="h-full w-full object-cover" />
        </div>
        <div className="md:py-6">
          <p className="eyebrow text-accent">
            {product.category === "boys" ? tr("nav.boys") : product.category === "girls" ? tr("nav.girls") : "Unisexe"}
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl">{product.name[lang]}</h1>
          <p className="mt-4 text-xl tracking-wide text-foreground/85">{formatDZD(product.price)}</p>
          <div className="hairline my-7 w-20" />
          <p className="text-sm leading-relaxed text-foreground/75 sm:text-base">{product.description[lang]}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {lang === "ar" ? "القماش: " : "Matière : "}{product.fabric[lang]}
          </p>

          <div className="mt-9">
            <p className="eyebrow mb-3 text-foreground/70">{tr("product.size")}</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-16 border px-4 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors ${
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground"
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleAdd} className="flex-1 border border-foreground bg-background px-6 py-4 text-xs uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-foreground hover:text-background">
              {added ? "✓ Ajouté" : tr("product.add")}
            </button>
            <button onClick={buyNow} className="flex-1 bg-foreground px-6 py-4 text-xs uppercase tracking-[0.28em] text-background transition-colors hover:bg-accent">
              {tr("cart.checkout")}
            </button>
          </div>

          <div className="mt-8 space-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
            <p className="flex items-center gap-2"><span className="text-accent">◆</span> {tr("product.cod")}</p>
            <p className="flex items-center gap-2"><span className="text-accent">◆</span> {tr("ship.f1")}</p>
            <p className="flex items-center gap-2"><span className="text-accent">◆</span> {tr("ship.f3")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
