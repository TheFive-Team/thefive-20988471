import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ProductHero } from '../components/ProductHero';
import { TrustBadges } from '../components/TrustBadges';
import { Features } from '../components/Features';
import { Reviews } from '../components/Reviews';
import { CodForm } from '../components/CodForm';
import { StickyCheckoutBar } from '../components/StickyCheckoutBar';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Five A — Vêtements raffinés pour enfants · Algérie" },
      { name: "description", content: "Maison algérienne de vêtements pour enfants, inspirée des grandes maisons. Livraison dans 48 wilayas, paiement à la livraison." },
      { property: "og:title", content: "The Five A — Maison de vêtements pour enfants" },
      { property: "og:description", content: "L'élégance se transmet, jamais ne s'achète." },
    ],
  }),
  component: LandingPage,
});

function Index() {
  const { tr, lang } = useI18n();
  const { data: products = [] } = useShopifyProducts();
  const featured = products.slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[68vh] min-h-[480px] w-full overflow-hidden sm:h-[78vh] sm:min-h-[560px]">
          <img src={hero} alt="The Five A — collection enfants" width={1600} height={1100} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-foreground/20 to-foreground/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-end px-5 pb-12 text-center text-background sm:px-6 sm:pb-24">
            <p className="eyebrow text-background/85 text-[0.6rem] sm:text-[0.7rem]">{tr("hero.eyebrow")}</p>
            <h1 className="mt-4 max-w-3xl whitespace-pre-line font-serif text-3xl leading-[1.1] sm:mt-5 sm:text-6xl md:text-7xl">
              {tr("hero.title")}
            </h1>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-background/85 sm:mt-6 sm:text-base">
              {tr("hero.sub")}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-9">
              <Link to="/boutique" search={{ cat: "all" }} className="bg-background px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                {tr("hero.cta")}
              </Link>
              <Link to="/maison" className="border border-background/70 px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.28em] text-background transition-colors hover:bg-background hover:text-foreground">
                {tr("hero.cta2")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE BAND */}
      <section className="border-y border-border bg-secondary py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-2 px-6 text-center text-[0.65rem] uppercase tracking-[0.28em] text-foreground/70">
          <span>· Maison algérienne ·</span>
          <span>Laine · Cachemire · Coton</span>
          <span>Petites séries</span>
          <span>Livraison 48 wilayas</span>
          <span>Paiement à la livraison</span>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
        <div className="mb-14 text-center">
          <p className="eyebrow text-accent">{tr("nav.collections")}</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{tr("feat.title")}</h2>
          <div className="hairline mx-auto mt-5 w-24" />
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">{tr("feat.sub")}</p>
        </div>
        {featured.length === 0 ? (
          <p className="text-center text-muted-foreground">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>
        )}
        <div className="mt-14 text-center">
          <Link to="/boutique" search={{ cat: "all" }} className="inline-block border-b border-foreground pb-1 text-[0.7rem] uppercase tracking-[0.3em] hover:border-accent hover:text-accent">
            {tr("feat.view")}
          </Link>
        </div>
      </section>

      {/* SPLIT EDITORIAL */}
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-0 px-0 md:grid-cols-2">
          <div className="aspect-[4/5] overflow-hidden">
            <img src={edit1} alt="" loading="lazy" width={1200} height={1500} className="h-full w-full object-cover" />
          </div>
          <div className="px-8 py-16 sm:px-14 md:py-24">
            <p className="eyebrow text-accent">Édition · {lang === "ar" ? "خريف" : "Automne"}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-5xl">
              {lang === "ar" ? "ميراث صغير،\nأناقة كبيرة." : "Un petit héritage,\nune grande allure."}
            </h2>
            <div className="hairline my-7 w-20" />
            <p className="text-sm leading-relaxed text-foreground/75 sm:text-base">
              {lang === "ar"
                ? "نختار خاماتنا من أنبل المصانع، ونقصّ كل قطعة على مهل. ملابس تُحبّ، تُحفظ، وتنتقل بين الإخوة كأنها رسالة عائلية."
                : "Nous choisissons nos étoffes dans les plus belles filatures, puis taillons chaque pièce sans hâte. Des vêtements qu'on aime, qu'on garde, qu'on transmet entre frères et sœurs comme une lettre de famille."}
            </p>
            <Link to="/boutique" search={{ cat: "girls" }} className="mt-9 inline-block border border-foreground px-7 py-3 text-[0.7rem] uppercase tracking-[0.28em] hover:bg-foreground hover:text-background">
              {tr("nav.girls")}
            </Link>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <div className="grid gap-12 sm:grid-cols-3">
          {(["heritage", "fabric", "made"] as const).map((k) => (
            <div key={k} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent/60 text-accent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-6 w-6">
                  {k === "heritage" && <path d="M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7l8-4z" />}
                  {k === "fabric" && <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="0.8" /><circle cx="16" cy="12" r="0.8" /></>}
                  {k === "made" && <><path d="M5 21V9l7-6 7 6v12" /><path d="M9 21v-7h6v7" /></>}
                </svg>
              </div>
              <h3 className="mt-5 font-serif text-2xl">{tr(`values.${k}.t`)}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{tr(`values.${k}.d`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHIPPING / COD */}
      <section className="border-y border-border bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl items-stretch gap-0 md:grid-cols-2">
          <div className="px-8 py-16 sm:px-14 md:py-24">
            <p className="eyebrow text-accent">Algérie · DZ</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-5xl">{tr("ship.title")}</h2>
            <div className="my-7 h-px w-20 bg-accent" />
            <p className="max-w-md text-sm leading-relaxed text-background/80 sm:text-base">{tr("ship.sub")}</p>
            <ul className="mt-9 space-y-3 text-sm text-background/90">
              <li className="flex items-center gap-3"><span className="text-accent">◆</span>{tr("ship.f1")}</li>
              <li className="flex items-center gap-3"><span className="text-accent">◆</span>{tr("ship.f2")}</li>
              <li className="flex items-center gap-3"><span className="text-accent">◆</span>{tr("ship.f3")}</li>
            </ul>
          </div>
          <div className="aspect-[4/5] overflow-hidden md:aspect-auto">
            <img src={edit2} alt="" loading="lazy" width={1200} height={1500} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}
