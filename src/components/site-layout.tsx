import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import logoAsset from "@/assets/five-a-logo.png.asset.json";

export function SiteHeader() {
  const { tr, lang, setLang } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex justify-center items-center px-4 py-3 sm:px-8 sm:py-4">
        {/* Center: logo */}
        <Link to="/" className="flex items-center justify-center">
          <img
            src={logoAsset.url}
            alt="The Five A — Algeria"
            width={320}
            height={320}
            className="h-12 w-auto sm:h-16 md:h-20"
          />
        </Link>
      </div>

      {/* Promo bar */}
      <div className="border-t border-border bg-foreground py-2 text-center text-[0.6rem] uppercase tracking-[0.25em] text-background/90 sm:text-[0.65rem] sm:tracking-[0.3em]">
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
