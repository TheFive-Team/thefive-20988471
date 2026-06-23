import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const { tr, lang, setLang } = useI18n();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4 sm:px-8">
        <nav className="hidden items-center gap-7 text-xs uppercase tracking-[0.22em] text-foreground/80 lg:flex">
          <Link to="/boutique" search={{ cat: "all" }} className="hover:text-accent transition-colors">{tr("nav.shop")}</Link>
          <Link to="/boutique" search={{ cat: "boys" }} className="hover:text-accent transition-colors">{tr("nav.boys")}</Link>
          <Link to="/boutique" search={{ cat: "girls" }} className="hover:text-accent transition-colors">{tr("nav.girls")}</Link>
          <Link to="/maison" className="hover:text-accent transition-colors">{tr("nav.about")}</Link>
        </nav>
        <Link to="/" className="flex flex-col items-center justify-self-center text-center">
          <span className="font-serif text-2xl tracking-[0.18em] sm:text-3xl">THE FIVE A</span>
          <span className="eyebrow mt-1 text-[0.6rem] text-muted-foreground">Maison · Algérie</span>
        </Link>
        <div className="flex items-center justify-end gap-5 text-xs uppercase tracking-[0.22em]">
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
          <Link to="/contact" className="hidden hover:text-accent md:inline">{tr("nav.contact")}</Link>
          <Link to="/panier" className="relative hover:text-accent transition-colors">
            {tr("nav.cart")}
            {count > 0 && (
              <span className="ms-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[0.65rem] tracking-normal text-background">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="border-t border-border bg-foreground py-2 text-center text-[0.65rem] uppercase tracking-[0.3em] text-background/90">
        {tr("ship.f2")} · {tr("ship.f1")} · {tr("ship.f3")}
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { tr } = useI18n();
  return (
    <footer className="mt-24 border-t border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 sm:px-10">
        <div>
          <p className="font-serif text-2xl tracking-[0.18em]">THE FIVE A</p>
          <p className="eyebrow mt-2 text-background/60">Maison · Algérie</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-background/70">
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
            <li className="text-background/70">Livraison · 48 wilayas</li>
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
      <div className="border-t border-background/15 py-5 text-center text-[0.65rem] uppercase tracking-[0.3em] text-background/55">
        © {new Date().getFullYear()} The Five A · {tr("footer.rights")}
      </div>
    </footer>
  );
}
