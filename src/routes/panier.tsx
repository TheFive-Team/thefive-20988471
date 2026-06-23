import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { products, formatDZD } from "@/lib/products";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title: "Panier — The Five A" },
      { name: "description", content: "Votre panier — The Five A." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { tr, lang } = useI18n();
  const { items, remove, setQty } = useCart();

  const lines = items.map((it) => {
    const p = products.find((x) => x.slug === it.slug);
    return p ? { ...it, product: p, subtotal: p.price * it.qty } : null;
  }).filter(Boolean) as Array<{ slug: string; size: string; qty: number; product: typeof products[number]; subtotal: number }>;

  const subtotal = lines.reduce((a, b) => a + b.subtotal, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
      <div className="text-center">
        <p className="eyebrow text-accent">{lang === "ar" ? "خطوة 1 من 2" : "Étape 1 / 2"}</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{tr("cart.title")}</h1>
        <div className="hairline mx-auto mt-5 w-24" />
      </div>

      {lines.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="text-muted-foreground">{tr("cart.empty")}</p>
          <Link to="/boutique" search={{ cat: "all" }} className="mt-8 inline-block border border-foreground px-7 py-3 text-xs uppercase tracking-[0.28em] hover:bg-foreground hover:text-background">
            {tr("cart.continue")}
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-border border-y border-border">
            {lines.map((l) => (
              <div key={l.slug + l.size} className="grid grid-cols-[88px_1fr_auto] items-center gap-4 py-6 sm:grid-cols-[110px_1fr_auto] sm:gap-6">
                <Link to="/produit/$slug" params={{ slug: l.slug }} className="block aspect-[4/5] overflow-hidden bg-secondary">
                  <img src={l.product.image} alt={l.product.name[lang]} loading="lazy" className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0">
                  <Link to="/produit/$slug" params={{ slug: l.slug }} className="font-serif text-lg leading-tight hover:text-accent">
                    {l.product.name[lang]}
                  </Link>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{tr("product.size")} · {l.size}</p>
                  <p className="mt-2 text-sm text-foreground/80">{formatDZD(l.product.price)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center border border-border">
                      <button onClick={() => setQty(l.slug, l.size, l.qty - 1)} className="px-3 py-1 text-foreground/70 hover:text-foreground">−</button>
                      <span className="w-8 text-center text-sm">{l.qty}</span>
                      <button onClick={() => setQty(l.slug, l.size, l.qty + 1)} className="px-3 py-1 text-foreground/70 hover:text-foreground">+</button>
                    </div>
                    <button onClick={() => remove(l.slug, l.size)} className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive">
                      {tr("cart.remove")}
                    </button>
                  </div>
                </div>
                <div className="text-end font-serif text-lg">{formatDZD(l.subtotal)}</div>
              </div>
            ))}
          </div>

          <aside className="h-fit border border-border bg-secondary p-7">
            <h2 className="font-serif text-2xl">{lang === "ar" ? "ملخص الطلب" : "Récapitulatif"}</h2>
            <div className="hairline my-5 w-16" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt>{tr("cart.subtotal")}</dt><dd>{formatDZD(subtotal)}</dd></div>
              <div className="flex justify-between text-muted-foreground">
                <dt>{tr("cart.shipping")}</dt>
                <dd className="text-xs">{lang === "ar" ? "تحسب عند الدفع" : "calculée au checkout"}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-serif text-xl">
                <dt>{tr("cart.total")}</dt><dd>{formatDZD(subtotal)}</dd>
              </div>
            </dl>
            <Link to="/commande" className="mt-6 block bg-foreground py-4 text-center text-xs uppercase tracking-[0.28em] text-background hover:bg-accent">
              {tr("cart.checkout")}
            </Link>
            <p className="mt-4 text-center text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
              ◆ {tr("checkout.cod")}
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
