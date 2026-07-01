import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const { tr, lang, setLang } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex justify-center items-center px-4 py-5 sm:px-8 sm:py-8">
        {/* Center: logo */}
        <div className="flex items-center justify-center py-2 select-none">
          <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-[0.2em] text-secondary uppercase">
            The Five A
          </span>
        </div>
      </div>

      {/* Promo bar */}
      <div className="border-t border-border bg-secondary py-1.5 text-center text-[0.6rem] uppercase tracking-[0.25em] text-secondary-foreground/90 sm:text-[0.65rem] sm:tracking-[0.3em]">
        <span className="px-3">{tr("ship.f2")}</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden px-3 sm:inline">{tr("ship.f1")}</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden px-3 sm:inline">{tr("ship.f3")}</span>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { tr } = useI18n();
  return (
    <footer className="mt-20 border-t border-border bg-secondary text-secondary-foreground sm:mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 sm:gap-12 sm:px-10 sm:py-16 lg:grid-cols-3">
        <div>
          <span className="font-serif text-3xl sm:text-4xl font-medium tracking-[0.2em] text-white uppercase">
            The Five A
          </span>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-background/70">
            Vêtements raffinés pour enfants. Confectionnés avec soin, livrés partout en Algérie.
          </p>
        </div>

        <div>
          <p className="eyebrow text-background/60">{tr("footer.care")}</p>
          <ul className="mt-4 space-y-2 text-sm text-background/85">
            <li><Link to="/contact" className="hover:text-accent">{tr("nav.contact")}</Link></li>

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
