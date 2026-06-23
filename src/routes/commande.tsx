import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { products, formatDZD } from "@/lib/products";
import { wilayas } from "@/lib/wilayas";

export const Route = createFileRoute("/commande")({
  head: () => ({
    meta: [
      { title: "Commande — The Five A" },
      { name: "description", content: "Finalisez votre commande. Paiement à la livraison dans toute l'Algérie." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { tr, lang } = useI18n();
  const { items, clear } = useCart();
  const navigate = useNavigate();

  const [wilayaCode, setWilayaCode] = useState<number>(16);
  const [method, setMethod] = useState<"home" | "stop">("home");
  const [done, setDone] = useState<{ ref: string } | null>(null);

  const lines = items.map((it) => {
    const p = products.find((x) => x.slug === it.slug);
    return p ? { ...it, product: p, subtotal: p.price * it.qty } : null;
  }).filter(Boolean) as Array<{ slug: string; size: string; qty: number; product: typeof products[number]; subtotal: number }>;

  const wilaya = wilayas.find((w) => w.code === wilayaCode)!;
  const subtotal = lines.reduce((a, b) => a + b.subtotal, 0);
  const shipping = useMemo(() => (lines.length === 0 ? 0 : method === "home" ? wilaya.home : wilaya.stop), [lines.length, method, wilaya]);
  const total = subtotal + shipping;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ref = "5A-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setDone({ ref });
    clear();
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center sm:py-32">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent text-accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8"><path d="M5 12l5 5L20 7" /></svg>
        </div>
        <p className="eyebrow mt-7 text-accent">{lang === "ar" ? "تم" : "Confirmé"}</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{tr("checkout.success.t")}</h1>
        <div className="hairline mx-auto mt-5 w-24" />
        <p className="mt-6 text-foreground/75">{tr("checkout.success.d")}</p>
        <p className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {tr("checkout.success.ref")} · <span className="text-foreground">{done.ref}</span>
        </p>
        <Link to="/boutique" search={{ cat: "all" }} className="mt-10 inline-block border border-foreground px-7 py-3 text-xs uppercase tracking-[0.28em] hover:bg-foreground hover:text-background">
          {tr("checkout.back")}
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center sm:py-32">
        <h1 className="font-serif text-3xl">{tr("cart.empty")}</h1>
        <Link to="/boutique" search={{ cat: "all" }} className="mt-8 inline-block border border-foreground px-7 py-3 text-xs uppercase tracking-[0.28em] hover:bg-foreground hover:text-background">
          {tr("cart.continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
      <div className="text-center">
        <p className="eyebrow text-accent">{lang === "ar" ? "خطوة 2 من 2" : "Étape 2 / 2"}</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{tr("checkout.title")}</h1>
        <div className="hairline mx-auto mt-5 w-24" />
      </div>

      <form onSubmit={onSubmit} className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <Section title={tr("checkout.contact")}>
            <Field label={tr("checkout.fullname")} required><input required name="fullname" className={inputCls} placeholder="Mohamed Amine Benali" /></Field>
            <Field label={tr("checkout.phone")} required><input required name="phone" type="tel" inputMode="tel" pattern="0[567][0-9 ]{8,}" className={inputCls} placeholder="0555 12 34 56" /></Field>
            <Field label={tr("checkout.email")}><input name="email" type="email" className={inputCls} placeholder="exemple@email.dz" /></Field>
          </Section>

          <Section title={tr("checkout.address")}>
            <Field label={tr("checkout.wilaya")} required>
              <select
                required
                value={wilayaCode}
                onChange={(e) => setWilayaCode(parseInt(e.target.value, 10))}
                className={inputCls}
              >
                {wilayas.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code.toString().padStart(2, "0")} — {lang === "ar" ? w.nameAr : w.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={tr("checkout.commune")} required><input required name="commune" className={inputCls} placeholder={lang === "ar" ? "البلدية" : "Bab El Oued, Hydra…"} /></Field>
            <Field label={tr("checkout.street")} required full>
              <textarea required name="street" rows={2} className={inputCls} placeholder={lang === "ar" ? "العنوان الكامل، رقم الشارع، الحي…" : "Adresse complète, numéro de rue, quartier…"} />
            </Field>
          </Section>

          <Section title={tr("checkout.method")}>
            <RadioCard checked={method === "home"} onChange={() => setMethod("home")} title={tr("checkout.home")} desc={`${formatDZD(wilaya.home)} · ${lang === "ar" ? "حسب الولاية" : "selon la wilaya"}`} />
            <RadioCard checked={method === "stop"} onChange={() => setMethod("stop")} title={tr("checkout.stop")} desc={`${formatDZD(wilaya.stop)} · ${lang === "ar" ? "أقل تكلفة" : "tarif réduit"}`} />
          </Section>

          <Section title={tr("checkout.payment")}>
            <div className="border border-accent bg-accent/5 px-5 py-5">
              <div className="flex items-start gap-4">
                <span className="mt-1 h-3.5 w-3.5 rounded-full border-[5px] border-accent" />
                <div>
                  <p className="font-serif text-lg">{tr("checkout.cod")}</p>
                  <p className="mt-1 text-sm text-foreground/70">{tr("checkout.cod.desc")}</p>
                </div>
              </div>
            </div>
          </Section>

          <Section title={tr("checkout.notes")}>
            <Field label="" full><textarea name="notes" rows={3} className={inputCls} placeholder={lang === "ar" ? "ملاحظات للموزع…" : "Instructions pour le livreur…"} /></Field>
          </Section>
        </div>

        <aside className="h-fit border border-border bg-secondary p-7 lg:sticky lg:top-32">
          <h2 className="font-serif text-2xl">{lang === "ar" ? "طلبك" : "Votre commande"}</h2>
          <div className="hairline my-5 w-16" />
          <ul className="space-y-4 border-b border-border pb-5">
            {lines.map((l) => (
              <li key={l.slug + l.size} className="flex gap-3">
                <div className="h-16 w-14 shrink-0 overflow-hidden bg-background">
                  <img src={l.product.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-serif text-base leading-tight">{l.product.name[lang]}</p>
                  <p className="text-xs text-muted-foreground">{l.size} · ×{l.qty}</p>
                </div>
                <p className="text-sm">{formatDZD(l.subtotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between"><dt>{tr("cart.subtotal")}</dt><dd>{formatDZD(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>{tr("cart.shipping")}</dt><dd>{formatDZD(shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-3 font-serif text-xl">
              <dt>{tr("cart.total")}</dt><dd>{formatDZD(total)}</dd>
            </div>
          </dl>
          <button type="submit" className="mt-6 w-full bg-foreground py-4 text-xs uppercase tracking-[0.28em] text-background hover:bg-accent">
            {tr("checkout.confirm")}
          </button>
          <p className="mt-4 text-center text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
            ◆ {tr("product.cod")}
          </p>
        </aside>
      </form>
    </div>
  );
}

const inputCls = "w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="eyebrow mb-5 text-foreground/80">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children, required, full }: { label: string; children: React.ReactNode; required?: boolean; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      {label && (
        <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.2em] text-foreground/70">
          {label}{required && <span className="ms-1 text-accent">*</span>}
        </span>
      )}
      {children}
    </label>
  );
}

function RadioCard({ checked, onChange, title, desc }: { checked: boolean; onChange: () => void; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`sm:col-span-1 flex items-start gap-4 border px-5 py-5 text-start transition-colors ${
        checked ? "border-accent bg-accent/5" : "border-border hover:border-foreground/40"
      }`}
    >
      <span className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-[5px] ${checked ? "border-accent" : "border-border"}`} />
      <span>
        <span className="block font-serif text-lg leading-tight">{title}</span>
        <span className="mt-1 block text-sm text-foreground/70">{desc}</span>
      </span>
    </button>
  );
}
