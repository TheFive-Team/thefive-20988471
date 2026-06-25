import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/shopify";
import { wilayas } from "@/lib/wilayas";
import { communesByWilaya } from "@/lib/communes";

export const Route = createFileRoute("/commande")({
  head: () => ({
    meta: [
      { title: "Commander — The Five A" },
      { name: "description", content: "Finalisez votre commande — paiement à la livraison." },
    ],
  }),
  component: LeadFormPage,
});

function LeadFormPage() {
  const { tr, lang } = useI18n();
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    wilaya: "",
    commune: "",
    method: "home" as "home" | "stop",
  });

  const subtotal = items.reduce((a, b) => a + parseFloat(b.price.amount) * b.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "DZD";
  const wilayaObj = wilayas.find((w) => String(w.code) === form.wilaya);
  const shipping = wilayaObj ? (form.method === "home" ? wilayaObj.home : wilayaObj.stop) : 0;
  const total = subtotal + shipping;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ref = "FA-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      // Meta Pixel — Lead event
      if (typeof window !== "undefined") {
        const w = window as unknown as { fbq?: (...args: unknown[]) => void };
        w.fbq?.("track", "Lead", { value: total, currency, content_ids: items.map((i) => i.variantId) });
        w.fbq?.("track", "Purchase", { value: total, currency });
      }
      console.log("[Lead]", { ...form, items, ref, total });
      setDone(ref);
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-muted-foreground">{tr("cart.empty")}</p>
        <Link to="/boutique" search={{ cat: "all" }} className="mt-8 inline-block border border-foreground px-7 py-3 text-xs uppercase tracking-[0.28em] hover:bg-foreground hover:text-background">
          {tr("cart.continue")}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="eyebrow text-accent">✓ {tr("checkout.success.t")}</p>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl">{tr("checkout.success.t")}</h1>
        <div className="hairline mx-auto mt-5 w-24" />
        <p className="mt-6 text-sm text-muted-foreground">{tr("checkout.success.d")}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.28em]">{tr("checkout.success.ref")} · {done}</p>
        <button onClick={() => navigate({ to: "/boutique", search: { cat: "all" } })} className="mt-10 border border-foreground px-7 py-3 text-xs uppercase tracking-[0.28em] hover:bg-foreground hover:text-background">
          {tr("checkout.back")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden border-b border-border bg-foreground py-2 text-background">
        <div className="marquee-track whitespace-nowrap text-[0.65rem] uppercase tracking-[0.28em]">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="mx-8 inline-block">
              ✦ {tr("ship.f2")} &nbsp; · &nbsp; {tr("ship.f1")} &nbsp; · &nbsp; {tr("ship.f3")} &nbsp; · &nbsp; {tr("checkout.cod")}
            </span>
          ))}
        </div>
      </div>
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10 sm:py-20">
      <div className="text-center">
        <p className="eyebrow text-accent">{lang === "ar" ? "خطوة 2 من 2" : "Étape 2 / 2"}</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{tr("checkout.title")}</h1>
        <div className="hairline mx-auto mt-5 w-24" />
        <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
          {lang === "ar" ? "املأ معلوماتك وسنتصل بك لتأكيد التسليم." : "Remplissez vos informations, nous vous appellerons pour confirmer."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-12 space-y-5">
        <input required value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} placeholder={tr("checkout.fullname")} className={inputCls} />
        <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={tr("checkout.phone")} className={inputCls} />
        <div className="grid gap-5 sm:grid-cols-2">
          <select required value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: e.target.value, commune: "" })} className={inputCls}>
            <option value="">{tr("checkout.wilaya")}</option>
            {wilayas.map((w) => (
              <option key={w.code} value={w.code}>{w.code} — {lang === "ar" ? w.nameAr : w.name}</option>
            ))}
          </select>
          <select required disabled={!form.wilaya} value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} className={inputCls}>
            <option value="">{tr("checkout.commune")}</option>
            {(communesByWilaya[Number(form.wilaya)] ?? []).map((c) => (
              <option key={c.fr} value={lang === "ar" ? c.ar : c.fr}>{lang === "ar" ? c.ar : c.fr}</option>
            ))}
          </select>
        </div>

        <fieldset className="border border-border p-5">
          <legend className="px-2 text-xs uppercase tracking-[0.28em]">{tr("checkout.method")}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["home", "stop"] as const).map((m) => (
              <label key={m} className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm ${form.method === m ? "border-accent bg-accent/5" : "border-border"}`}>
                <input type="radio" name="method" checked={form.method === m} onChange={() => setForm({ ...form, method: m })} className="accent-accent" />
                <span>{m === "home" ? tr("checkout.home") : tr("checkout.stop")}</span>
                {wilayaObj && <span className="ms-auto text-xs text-muted-foreground">{wilayaObj[m === "home" ? "home" : "stop"]} DA</span>}
              </label>
            ))}
          </div>
        </fieldset>

        

        <div className="border border-border bg-secondary p-5 text-sm">
          <div className="flex justify-between"><span>{tr("cart.subtotal")}</span><span>{formatMoney({ amount: String(subtotal), currencyCode: currency })}</span></div>
          <div className="mt-2 flex justify-between"><span>{tr("cart.shipping")}</span><span>{shipping ? formatMoney({ amount: String(shipping), currencyCode: currency }) : "—"}</span></div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-serif text-lg"><span>{tr("cart.total")}</span><span>{formatMoney({ amount: String(total), currencyCode: currency })}</span></div>
          <p className="mt-3 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">◆ {tr("checkout.cod")}</p>
        </div>

        <button disabled={submitting} className="block w-full bg-foreground py-4 text-xs uppercase tracking-[0.28em] text-background hover:bg-accent disabled:opacity-50">
          {submitting ? "..." : tr("checkout.confirm")}
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full border border-border bg-background px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none";
