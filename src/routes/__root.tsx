import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { useCartSync } from "@/hooks/useCartSync";

function PromoBar() {
  const item = (
    <span className="mx-8 inline-block whitespace-nowrap text-[0.65rem] font-medium uppercase tracking-[0.3em] text-background/90">
      LIVRAISON 58 WILAYAS &nbsp;&nbsp;·&nbsp;&nbsp; PAIEMENT À LA RÉCEPTION &nbsp;&nbsp;·&nbsp;&nbsp; VÉRIFICATION AVANT PAIEMENT &nbsp;&nbsp;·&nbsp;&nbsp; ÉCHANGES SOUS 48H
    </span>
  );
  return (
    <div className="overflow-hidden border-b border-border bg-foreground py-2 text-background" dir="ltr">
      <style>{`
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-scroll-right {
          animation: scroll-right 30s linear infinite;
        }
      `}</style>
      <div className="flex animate-scroll-right w-max">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    </div>
  );
}

// Meta Pixel — set your Pixel ID here once Meta gives it to you
const META_PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined) ?? "";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl">404</h1>
        <h2 className="mt-4 font-serif text-xl">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">Cette page n'existe pas ou a été déplacée.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center border border-foreground px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-foreground transition-colors hover:bg-foreground hover:text-background">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-muted-foreground">Veuillez réessayer ou revenir à l'accueil.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="border border-foreground px-5 py-2.5 text-xs uppercase tracking-[0.25em] hover:bg-foreground hover:text-background">
            Réessayer
          </button>
          <a href="/" className="border border-border px-5 py-2.5 text-xs uppercase tracking-[0.25em] hover:bg-secondary">
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Five A — Vêtements raffinés pour enfants · Algérie" },
      { name: "description", content: "Maison algérienne de vêtements raffinés pour enfants. Inspirations old money, livraison à domicile dans les 48 wilayas, paiement à la livraison." },
      { name: "author", content: "The Five A" },
      { property: "og:title", content: "The Five A — Vêtements raffinés pour enfants · Algérie" },
      { property: "og:description", content: "Maison algérienne de vêtements raffinés pour enfants. Inspirations old money, livraison à domicile dans les 48 wilayas, paiement à la livraison." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Five A — Vêtements raffinés pour enfants · Algérie" },
      { name: "twitter:description", content: "Maison algérienne de vêtements raffinés pour enfants. Inspirations old money, livraison à domicile dans les 48 wilayas, paiement à la livraison." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5528501a-2129-446a-a41e-7acb6cf7877c/id-preview-5f34d3cc--0b9f4ea8-04d4-4bfa-bd09-ab2058328a66.lovable.app-1782251916218.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5528501a-2129-446a-a41e-7acb6cf7877c/id-preview-5f34d3cc--0b9f4ea8-04d4-4bfa-bd09-ab2058328a66.lovable.app-1782251916218.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500&family=Amiri:wght@400;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useCartSync();
  const location = useLocation();
  const isProductPage = location.pathname.startsWith("/produit");

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {META_PIXEL_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`,
              }}
            />
            <noscript>
              <img height="1" width="1" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
            </noscript>
          </>
        )}
        <div className="flex min-h-screen flex-col">
          <PromoBar />
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </I18nProvider>
    </QueryClientProvider>
  );
}

