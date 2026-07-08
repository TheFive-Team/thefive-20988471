import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — The Five A" },
      { name: "description", content: "Une question, une commande spéciale ? Notre équipe vous répond." },
      { property: "og:title", content: "Contact — The Five A" },
      { property: "og:description", content: "Écrivez-nous, nous vous répondons sous 24 h." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { tr, lang } = useI18n();
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-28">
      <div className="text-center">
        <p className="eyebrow text-accent">{lang === "ar" ? "كتابتنا" : "Écrivez-nous"}</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-6xl">{tr("contact.title")}</h1>
        <div className="hairline mx-auto mt-5 w-24" />
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {lang === "ar"
            ? "هل عندك سؤال عن مقاس، أو طلب خاص لمناسبة؟ نجيبك خلال 24 ساعة."
            : "Une question de taille, une commande pour une occasion ? Nous vous répondons sous 24 heures."}
        </p>
      </div>

      <div className="mt-14 grid gap-12 md:grid-cols-[1fr_320px]">
        {sent ? (
          <div className="border border-accent bg-accent/5 px-8 py-14 text-center">
            <p className="eyebrow text-accent">✓ {lang === "ar" ? "تم الإرسال" : "Envoyé"}</p>
            <h2 className="mt-4 font-serif text-3xl">{lang === "ar" ? "شكراً لكم" : "Merci"}</h2>
            <p className="mt-3 text-sm text-foreground/70">{lang === "ar" ? "سنرد عليك في أقرب وقت." : "Nous vous répondons très vite."}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <input required aria-label={tr("checkout.fullname")} placeholder={tr("checkout.fullname")} className={inputCls} />
              <input required type="tel" aria-label={tr("checkout.phone")} placeholder={tr("checkout.phone")} className={inputCls} />
            </div>
            <input required aria-label={lang === "ar" ? "الموضوع" : "Sujet"} placeholder={lang === "ar" ? "الموضوع" : "Sujet"} className={inputCls} />
            <textarea required rows={6} aria-label={lang === "ar" ? "رسالتك…" : "Votre message…"} placeholder={lang === "ar" ? "رسالتك…" : "Votre message…"} className={inputCls} />
            <button className="bg-foreground px-8 py-4 text-xs uppercase tracking-[0.28em] text-background hover:bg-accent">

              {lang === "ar" ? "إرسال" : "Envoyer"}
            </button>
          </form>
        )}

        <aside className="space-y-7 border-t border-border pt-8 md:border-l md:border-t-0 md:ps-10 md:pt-0">
          <Info label={lang === "ar" ? "الدار" : "Adresse"} v="Alger Centre, Algérie" />
          <Info label={lang === "ar" ? "الهاتف" : "Téléphone"} v="+213 555 00 00 00" />
          <Info label={lang === "ar" ? "ساعات العمل" : "Horaires"} v={lang === "ar" ? "السبت — الخميس · 9h — 18h" : "Sam — Jeu · 9h — 18h"} />
        </aside>
      </div>
    </div>
  );
}

const inputCls = "w-full border border-border bg-background px-4 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none";

function Info({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-lg">{v}</p>
    </div>
  );
}
