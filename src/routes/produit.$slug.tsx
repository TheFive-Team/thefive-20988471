import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { useI18n } from "@/lib/i18n";
import { productQueryOptions } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, getOptimizedShopifyImage, getLocalSrcSet } from "@/lib/shopify";
import { MobileImageGallery } from "@/components/MobileImageGallery";
import { CodForm } from "@/components/CodForm";

const Reviews = lazy(() => import("@/components/Reviews").then(m => ({ default: m.Reviews })));
const StickyCheckoutBar = lazy(() => import("@/components/StickyCheckoutBar").then(m => ({ default: m.StickyCheckoutBar })));

const numericId = (gid: string) => gid.split("/").pop() ?? gid;
import { trackViewContent, trackAddToCart } from "@/lib/metaPixel";

export const Route = createFileRoute("/produit/$slug")({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(productQueryOptions(params.slug));
  },
  head: ({ loaderData, params }) => {
    const images = (loaderData as any)?.node?.images?.edges?.map((e: any) => e.node) ?? [];
    const mainImg = images[0];
    const optimizedUrl = mainImg ? getOptimizedShopifyImage(mainImg.url, 800) : undefined;

    return {
      meta: [
        { title: `${params.slug} — The Five A` },
        { property: "og:title", content: `${params.slug} — The Five A` },
      ],
      links: mainImg ? [
        { 
          rel: "preload", 
          as: "image", 
          href: mainImg.url,
          fetchPriority: "high" 
        }
      ] : []
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { tr } = useI18n();
  const product = Route.useLoaderData();
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);
  const p = product?.node;
  const variants = p?.variants?.edges ?? [];
  
  const rawOffersList = Array.isArray((p as any)?.offers) ? (p as any).offers : [];
  const rawOffers = rawOffersList.filter((o: any) => o && o.active !== false);
  
  const offers = useMemo(() => {
    if (rawOffers.length > 0) return rawOffers;
    return [{
      id: "default-1",
      title: "قطعة واحدة",
      price: p?.priceRange?.minVariantPrice?.amount ?? "0",
      comparePrice: p?.compareAtPriceRange?.minVariantPrice?.amount,
      pieces: 1,
      badge: ""
    }];
  }, [rawOffers, p]);



  const images = product?.node?.images?.edges.map((e: any) => e.node) ?? [];
  const [activeImg, setActiveImg] = useState(0);
  const image = images[activeImg] ?? images[0];

  // Meta Pixel — ViewContent
  useEffect(() => {
    if (!product || offers.length === 0) return;
    trackViewContent({
      productName: product.node.title,
      productId: product.node.id,
      price: parseFloat(offers[0].price || 0),
      currency: "DZD",
    });
  }, [product, offers]);


  if (!product || !p) {
    return (
      <div className="px-6 py-32 text-center">
        <h1 className="font-serif text-3xl">Article introuvable</h1>
        <Link to="/boutique" search={{ cat: "all" }} className="mt-6 inline-block underline">
          Retour à la boutique
        </Link>
      </div>
    );
  }


  const handleAdd = async () => {
    // Legacy handleAdd, not fully used anymore with COD directly but kept for cart consistency
  };

  const scrollToCheckout = () => {
    document.getElementById("checkout-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-24">
      <div className="grid gap-0 md:grid-cols-2 md:gap-10 lg:gap-12">
        <div className="block md:hidden -mx-6 sm:-mx-10">
          {/* Dynamic gallery from Shopify */}
          <MobileImageGallery images={images} />
        </div>
        <div className="hidden md:block">
          <div className="bg-secondary rounded-2xl overflow-hidden shadow-xl shadow-secondary/5">
            {image && (
              <img 
                src={getOptimizedShopifyImage(image.url, 800)} 
                srcSet={getLocalSrcSet(image.url) || `${getOptimizedShopifyImage(image.url, 400)} 400w, ${getOptimizedShopifyImage(image.url, 800)} 800w, ${getOptimizedShopifyImage(image.url, 1200)} 1200w`}
                sizes="(max-width: 768px) 100vw, 50vw"
                alt={image.altText ?? p.title} 
                width={800} height={1000} 
                className="h-full w-full object-cover" 
                fetchPriority="high" loading="eager" decoding="sync" 
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  aria-label={img.altText ?? `الصورة ${i + 1} لـ ${p.title}`}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-xl overflow-hidden shadow-sm bg-secondary border ${i === activeImg ? "border-primary" : "border-transparent hover:border-accent"}`}
                >
                  <img 
                    src={img.url.endsWith("-800w.webp") ? img.url.replace("-800w.webp", "-160w.webp") : getOptimizedShopifyImage(img.url, 200)} 
                    alt={img.altText ?? `${p.title} ${i + 1}`} 
                    className="h-full w-full object-cover" 
                    loading="lazy" decoding="async" 
                    width={200} height={200}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {p.productType && <p className="eyebrow text-accent">{p.productType}</p>}
          <h1 className="font-serif font-bold text-secondary text-3xl leading-tight sm:text-5xl">{p.title}</h1>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-2xl sm:text-3xl font-medium tracking-wide text-primary">
              {formatMoney({ amount: offers[0]?.price ?? 0, currencyCode: "DZD" })}
            </p>
            {(() => {
              const currentPrice = offers[0]?.price;
              const comparePrice = offers[0]?.comparePrice;
              
              if (comparePrice && parseFloat(comparePrice) > parseFloat(currentPrice)) {
                const discount = Math.round(((parseFloat(comparePrice) - parseFloat(currentPrice)) / parseFloat(comparePrice)) * 100);
                return (
                  <>
                    <p className="text-xl sm:text-2xl text-slate-400 line-through">
                      {formatMoney({ amount: comparePrice, currencyCode: "DZD" })}
                    </p>
                    <span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-1 rounded-md">
                      -{discount}%
                    </span>
                  </>
                );
              }
              return null;
            })()}
          </div>
          <div className="hairline my-6 w-16" />



          {/* COD Form Checkout Section Moved Here (Right after variants) */}
          <div id="checkout-form" className="mt-12 bg-transparent -mx-6 px-4 sm:mx-0 sm:px-0">
            <CodForm 
              productName={p?.title}
              offers={offers}
              variants={variants}
            />
          </div>


        </div>
      </div>

      {p.descriptionHtml && (
        <section className="mt-16 sm:mt-24 w-full">
          <div
            className="shopify-rte mx-auto max-w-3xl text-foreground/85 text-center [&_img]:!block [&_img]:!mx-auto [&_img]:!my-10 [&_img]:!w-full [&_img]:!max-w-2xl [&_img]:!rounded-2xl [&_img]:!shadow-md [&_img]:!object-cover [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h1]:mt-10 [&_h2]:mt-10 [&_h3]:mt-8 [&_h1]:mb-4 [&_h2]:mb-4 [&_h3]:mb-3 [&_p]:my-4 [&_p]:leading-relaxed [&_ul]:my-4 [&_ul]:list-none [&_ul]:p-0 [&_li]:py-2 [&_li]:border-b [&_li]:border-border/50 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_iframe]:mx-auto [&_iframe]:my-6 [&_iframe]:w-full [&_iframe]:max-w-2xl [&_iframe]:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: p.descriptionHtml }}
          />
        </section>
      )}

      {/* Middle Detail Images */}
      {p.detailImages?.edges && p.detailImages.edges.length > 0 && (
        <section className="w-full flex flex-col items-center justify-center mt-16 space-y-4">
          {p.detailImages.edges.map((e, idx) => (
            <img 
              key={idx} 
              src={getOptimizedShopifyImage(e.node.url, 800)} 
              srcSet={getLocalSrcSet(e.node.url) || `${getOptimizedShopifyImage(e.node.url, 400)} 400w, ${getOptimizedShopifyImage(e.node.url, 800)} 800w`}
              sizes="100vw"
              alt={e.node.altText || `${p.title} detail view ${idx + 1}`} 
              className="w-full max-w-2xl h-auto object-cover rounded-2xl shadow-md" 
              loading="lazy"
              decoding="async"
              width={800} height={1000}
            />
          ))}
        </section>
      )}

      <Suspense fallback={<div className="h-32 w-full animate-pulse bg-secondary/30 mt-16 rounded-2xl" />}>
        <Reviews customImages={p.reviewImages?.edges.map(e => e.node) || []} />
      </Suspense>

      <Suspense fallback={null}>
        <StickyCheckoutBar price={p?.priceRange?.minVariantPrice} />
      </Suspense>
    </div>
  );
}
