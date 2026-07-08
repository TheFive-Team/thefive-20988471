import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/shopify";

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
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const subtotal = items.reduce((a, b) => a + parseFloat(b.price.amount) * b.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "DZD";

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (typeof window !== "undefined") {
      const w = window as unknown as { fbq?: (...args: unknown[]) => void };
      const contentIds = items.map((i) => i.variantId.split("/").pop() ?? i.variantId);
      const contents = items.map((i) => ({ id: i.variantId.split("/").pop() ?? i.variantId, quantity: i.quantity }));
      w.fbq?.("track", "InitiateCheckout", {
        value: subtotal,
        currency,
        content_ids: contentIds,
        contents,
        content_type: "product",
        num_items: items.reduce((a, b) => a + b.quantity, 0),
      });
    }
    navigate({ to: "/commande" });
  };


  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
      <div className="text-center">
        <p className="eyebrow text-accent">{lang === "ar" ? "خطوة 1 من 2" : "Étape 1 / 2"}</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{tr("cart.title")}</h1>
        <div className="hairline mx-auto mt-5 w-24" />
      </div>

      {items.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="text-muted-foreground">{tr("cart.empty")}</p>
          <Link to="/boutique" search={{ cat: "all" }} className="mt-8 inline-block border border-foreground px-7 py-3 text-xs uppercase tracking-[0.28em] hover:bg-foreground hover:text-background">
            {tr("cart.continue")}
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-border border-y border-border">
            {items.map((l) => (
              <div key={l.variantId} className="grid grid-cols-[88px_1fr_auto] items-center gap-4 py-6 sm:grid-cols-[110px_1fr_auto] sm:gap-6">
                <Link to="/produit/$slug" params={{ slug: l.productHandle }} className="block aspect-[4/5] overflow-hidden bg-secondary">
                  {l.image && <img src={l.image} alt={l.productTitle} loading="lazy" decoding="async" width={200} height={250} className="h-full w-full object-cover" />}
                </Link>
                <div className="min-w-0">
                  <Link to="/produit/$slug" params={{ slug: l.productHandle }} className="font-serif text-lg leading-tight hover:text-accent">
                    {l.productTitle}
                  </Link>
                  {l.variantTitle && l.variantTitle !== "Default Title" && (
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{l.variantTitle}</p>
                  )}
                  <p className="mt-2 text-sm text-foreground/80">{formatMoney(l.price)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center border border-border">
                      <button aria-label={tr("cart.decrease", "إنقاص الكمية")} disabled={isLoading} onClick={() => updateQuantity(l.variantId, l.quantity - 1)} className="px-3 py-1 text-foreground/70 hover:text-foreground disabled:opacity-50">−</button>
                      <span className="w-8 text-center text-sm">{l.quantity}</span>
                      <button aria-label={tr("cart.increase", "زيادة الكمية")} disabled={isLoading} onClick={() => updateQuantity(l.variantId, l.quantity + 1)} className="px-3 py-1 text-foreground/70 hover:text-foreground disabled:opacity-50">+</button>
                    </div>
                    <button aria-label={tr("cart.remove", "حذف المنتج")} disabled={isLoading} onClick={() => removeItem(l.variantId)} className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive disabled:opacity-50">
                      {tr("cart.remove")}
                    </button>
                  </div>
                </div>
                <div className="text-end font-serif text-lg">
                  {formatMoney({ amount: String(parseFloat(l.price.amount) * l.quantity), currencyCode: l.price.currencyCode })}
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit border border-border bg-secondary p-7">
            <h2 className="font-serif text-2xl">{lang === "ar" ? "ملخص الطلب" : "Récapitulatif"}</h2>
            <div className="hairline my-5 w-16" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt>{tr("cart.subtotal")}</dt><dd>{formatMoney({ amount: String(subtotal), currencyCode: currency })}</dd></div>
              <div className="flex justify-between text-muted-foreground">
                <dt>{tr("cart.shipping")}</dt>
                <dd className="text-xs">{lang === "ar" ? "تحسب عند الدفع" : "calculée au checkout"}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-serif text-xl">
                <dt>{tr("cart.total")}</dt>
                <dd>{formatMoney({ amount: String(subtotal), currencyCode: currency })}</dd>
              </div>
            </dl>
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="mt-6 block w-full bg-foreground py-4 text-center text-xs uppercase tracking-[0.28em] text-background hover:bg-accent disabled:opacity-50"
            >
              {tr("cart.checkout")}
            </button>
            <p className="mt-4 text-center text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
              ◆ {tr("checkout.cod")}
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
