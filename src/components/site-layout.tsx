import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import logoAsset from "@/assets/five-a-logo.png.asset.json";

export function SiteHeader() {
  const { tr, lang, setLang } = useI18n();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const navLinks = (
    <>
      <Link to="/boutique" search={{ cat: "all" }} onClick={() => setOpen(false)} className="hover:text-accent transition-colors">{tr("nav.shop")}</Link>
      <Link to="/boutique" search={{ cat: "boys" }} onClick={() => setOpen(false)} className="hover:text-accent transition-colors">{tr("nav.boys")}</Link>
      <Link to="/boutique" search={{ cat: "girls" }} onClick={() => setOpen(false)} className="hover:text-accent transition-colors">{tr("nav.girls")}</Link>
      <Link to="/maison" onClick={() => setOpen(false)} className="hover:text-accent transition-colors">{tr("nav.about")}</Link>
      <Link to="/contact" onClick={() => setOpen(false)} className="hover:text-accent transition-colors">{tr("nav.contact")}</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-8 sm:py-4">
        {/* Left: burger (mobile) + nav (desktop) */}
        <div className="flex items-center">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="lg:hidden flex h-9 w-9 items-center justify-center text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M3 7h18M3 12h18M3 17h18" /></>}
            </svg>
          </button>
          <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-[0.22em] text-foreground/80">
            <Link to="/boutique" search={{ cat: "all" }} className="hover:text-accent transition-colors">{tr("nav.shop")}</Link>
            <Link to="/boutique" search={{ cat: "boys" }} className="hover:text-accent transition-colors">{tr("nav.boys")}</Link>
            <Link to="/boutique" search={{ cat: "girls" }} className="hover:text-accent transition-colors">{tr("nav.girls")}</Link>
            <Link to="/maison" className="hover:text-accent transition-colors">{tr("nav.about")}</Link>
          </nav>
        </div>

        {/* Center: logo */}
        <Link to="/" className="flex items-center justify-self-center" onClick={() => setOpen(false)}>
          <img
            src={logoAsset.url}
            alt="The Five A — Algeria"
            width={320}
            height={320}
            className="h-12 w-auto sm:h-16 md:h-20"
          />
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] sm:gap-5">
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => setLang("fr")}
              className={`transition-colors ${lang === "fr" ? "text-accent" : "text-foreground/60 hover:text-foreground"}`}
            >FR</button>
            <span className="text-border">/</span>
            <button
              onClick={() => setLang("ar")}
              className={`transition-colors ${lang === "ar" ? "text-accent" : "text-foreground/60 hover:text-foreground"}`}
            >AR</button>
          </div>
          <Link to="/panier" className="relative hover:text-accent transition-colors">
            <span className="hidden sm:inline">{tr("nav.cart")}</span>
            <svg className="sm:hidden h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 7h12l-1.5 11a2 2 0 01-2 1.8h-5a2 2 0 01-2-1.8L6 7z" />
              <path d="M9 7V5a3 3 0 016 0v2" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-2 -end-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] tracking-normal text-accent-foreground sm:static sm:ms-2 sm:h-5 sm:min-w-5 sm:bg-foreground sm:text-background">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Promo bar */}
      <div className="border-t border-border bg-foreground py-2 text-center text-[0.6rem] uppercase tracking-[0.25em] text-background/90 sm:text-[0.65rem] sm:tracking-[0.3em]">
        <span className="px-3">{tr("ship.f2")}</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden px-3 sm:inline">{tr("ship.f1")}</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden px-3 sm:inline">{tr("ship.f3")}</span>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-6 py-5 gap-4 text-sm uppercase tracking-[0.22em] text-foreground/85">
            {navLinks}
            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <button onClick={() => setLang("fr")} className={lang === "fr" ? "text-accent" : "text-foreground/60"}>FR</button>
              <span className="text-border">/</span>
              <button onClick={() => setLang("ar")} className={lang === "ar" ? "text-accent" : "text-foreground/60"}>AR</button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { tr } = useI18n();
  return (
    <footer className="mt-20 border-t border-border bg-foreground text-background sm:mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 sm:gap-12 sm:px-10 sm:py-16 lg:grid-cols-4">
        <div>
          <img src={logoAsset.url} alt="The Five A" width={240} height={240} className="h-14 w-auto brightness-0 invert" loading="lazy" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/70">
            Vêtements raffinés pour enfants. Confectionnés avec soin, livrés partout en Algérie.
          </p>
        </div>
        <div>
          <p className="eyebrow text-background/60">{tr("footer.shop")}</p>
          <ul className="mt-4 space-y-2 text-sm text-background/85">
            <li><Link to="/boutique" search={{ cat: "boys" }} className="hover:text-accent">{tr("nav.boys")}</Link></li>
            <li><Link to="/boutique" search={{ cat: "girls" }} className="hover:text-accent">{tr("nav.girls")}</Link></li>
            <li><Link to="/boutique" search={{ cat: "all" }} className="hover:text-accent">{tr("nav.shop")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-background/60">{tr("footer.care")}</p>
          <ul className="mt-4 space-y-2 text-sm text-background/85">
            <li><Link to="/contact" className="hover:text-accent">{tr("nav.contact")}</Link></li>
            <li><Link to="/maison" className="hover:text-accent">{tr("nav.about")}</Link></li>
            <li className="text-background/70">Livraison · 58 wilayas</li>
            <li className="text-background/70">Paiement à la livraison</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-background/60">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-background/85">
            <li>Alger, Algérie</li>
            <li>+213 555 00 00 00</li>
            <li>bonjour@thefivea.dz</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/15 py-5 text-center text-[0.6rem] uppercase tracking-[0.25em] text-background/55 sm:text-[0.65rem] sm:tracking-[0.3em]">
        © {new Date().getFullYear()} The Five A · {tr("footer.rights")}
      </div>
    </footer>
  );
}
