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


