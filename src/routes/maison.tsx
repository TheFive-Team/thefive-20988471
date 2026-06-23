import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import edit1 from "@/assets/editorial-1.jpg";

export const Route = createFileRoute("/maison")({
  head: () => ({
    meta: [
      { title: "La Maison — The Five A" },
      { name: "description", content: "L'histoire et les valeurs de The Five A, maison algérienne de vêtements raffinés pour enfants." },
      { property: "og:title", content: "La Maison — The Five A" },
      { property: "og:description", content: "Cinq lettres, une promesse : transmettre l'élégance." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { tr, lang } = useI18n();
  return (
    <div>
      <section className="border-b border-border bg-secondary px-6 py-24 text-center sm:py-32">
        <p className="eyebrow text-accent">Est. 2026 · Alger</p>
        <h1 className="mt-4 font-serif text-5xl sm:text-7xl">{tr("about.title")}</h1>
        <div className="hairline mx-auto mt-6 w-24" />
        <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-foreground/75 sm:text-lg">
          {lang === "ar"
            ? "خمسة أحرف، وعد واحد: أن ننقل الأناقة من جيل إلى جيل. The Five A دار جزائرية تصمم ملابس راقية للأطفال، مستوحاة من تقاليد البيوت الأوروبية الكبرى ومن ذوق الأمهات اللواتي يعرفن ما يدوم."
            : "Cinq lettres, une promesse : transmettre l'élégance d'une génération à l'autre. The Five A est une maison algérienne qui dessine des vêtements raffinés pour enfants, dans la tradition des grandes maisons européennes et dans le goût des mères qui savent ce qui dure."}
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-10 md:grid-cols-2 md:py-28">
        <div className="aspect-[4/5] overflow-hidden bg-secondary">
          <img src={edit1} alt="" loading="lazy" width={1200} height={1500} className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="eyebrow text-accent">{lang === "ar" ? "فلسفتنا" : "Notre philosophie"}</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl">
            {lang === "ar" ? "أقل قطعاً، أجود خامة." : "Moins de pièces, de plus belles matières."}
          </h2>
          <div className="hairline my-7 w-16" />
          <p className="text-sm leading-relaxed text-foreground/75 sm:text-base">
            {lang === "ar"
              ? "نرفض الموضة السريعة. كل موسم نصمم تشكيلة صغيرة من الكلاسيكيات: بليزر، قميص أكسفورد، تريكو من الصوف، تنورة بطيّات. قطع تكبر مع طفلك، ثم تنتقل إلى الإخوة الأصغر، ثم تُحفظ كذكرى."
              : "Nous refusons la mode jetable. Chaque saison, nous dessinons une petite collection de classiques : blazer, oxford, maille en laine, jupe plissée. Des pièces qui grandissent avec votre enfant, passent au cadet, puis se gardent comme un souvenir."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 text-center sm:px-10">
        <div className="grid gap-10 border-y border-border py-14 sm:grid-cols-3">
          <Stat n="48" l={lang === "ar" ? "ولاية" : "wilayas livrées"} />
          <Stat n="100%" l={lang === "ar" ? "خامات طبيعية" : "matières naturelles"} />
          <Stat n="7j" l={lang === "ar" ? "استبدال" : "échange offert"} />
        </div>
        <Link to="/boutique" search={{ cat: "all" }} className="mt-12 inline-block bg-foreground px-8 py-4 text-xs uppercase tracking-[0.28em] text-background hover:bg-accent">
          {tr("hero.cta")}
        </Link>
      </section>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <p className="font-serif text-5xl text-accent">{n}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">{l}</p>
    </div>
  );
}
