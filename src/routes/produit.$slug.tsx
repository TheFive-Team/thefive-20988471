import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { useI18n } from "@/lib/i18n";
import { productQueryOptions } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, getOptimizedShopifyImage, getLocalSrcSet } from "@/lib/shopify";
import { MobileImageGallery } from "@/components/MobileImageGallery";
import { CodForm } from "@/components/CodForm";
import { LazySection } from "@/components/LazySection";

const WhyChooseUs = lazy(() => import("@/components/WhyChooseUs").then(m => ({ default: m.WhyChooseUs })));
const Reviews = lazy(() => import("@/components/Reviews").then(m => ({ default: m.Reviews })));
const StickyCheckoutBar = lazy(() => import("@/components/StickyCheckoutBar").then(m => ({ default: m.StickyCheckoutBar })));

const numericId = (gid: string) => gid.split("/").pop() ?? gid;
import { trackViewContent, trackAddToCart } from "@/lib/metaPixel";

export const Route = createFileRoute("/produit/$slug")({
  loader: async ({ context, params }) => {
    const t0 = performance.now();
    const data = await context.queryClient.ensureQueryData(productQueryOptions(params.slug));
    const duration = (performance.now() - t0).toFixed(2);
    console.log(`[TTFB] Loader execution for ${params.slug}: ${duration}ms (Includes JSON parse & lookup)`);
    return data;
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
          imageSrcSet: getLocalSrcSet(mainImg.url) || `${getOptimizedShopifyImage(mainImg.url, 400)} 400w, ${getOptimizedShopifyImage(mainImg.url, 800)} 800w`,
          imageSizes: "(max-width: 768px) 100vw, 50vw",
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
  const totalStock = variants.reduce((sum: number, v: any) => sum + (v.node.quantityAvailable || 10), 0);
  
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

  const pricingConfig = (p as any)?.pricingConfig || {
    enabled: false,
    quantityRequired: 2,
    discountType: "fixed",
    discountValue: 0,
    badgeText: "",
    maxQuantity: 10
  };
  
  const basePrice = p?.priceRange?.minVariantPrice?.amount ?? "0";
  const comparePrice = p?.compareAtPriceRange?.minVariantPrice?.amount;



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
    <div className="mx-auto max-w-7xl py-8 sm:px-10 sm:py-24 overflow-x-clip">
      <div className="grid gap-0 md:grid-cols-2 md:gap-10 lg:gap-12">
        
        {/* Mobile View: Gallery first, then Text */}
        <div className="block md:hidden mb-6">
          
          {/* 1. Gallery (Mobile) */}
          <div className="mb-5 sm:-mx-6">
            <MobileImageGallery images={images} />
          </div>

          {/* 2. Text Details below gallery */}
          <div className="flex flex-col items-start text-left bg-[#FCFCFC] rounded-[20px] p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100/80 mb-3 w-[calc(100dvw-16px)] max-w-[480px] min-w-0 mx-auto box-border">
            
            {/* Collection Label */}
            <div className="mb-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#D4AF37]">
                NOUVELLE COLLECTION
              </span>
            </div>
            
            {/* Product Name */}
            <h1 className="font-serif font-bold text-[#1A2530] text-[22px] sm:text-2xl leading-[1.25] text-left line-clamp-2 drop-shadow-sm mb-2 w-full" dir="ltr">
              {p.title}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex text-[#D4AF37] text-[11px] tracking-wider">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <span className="text-[10px] font-medium text-[#1A2530]/60 mt-0.5">4.9</span>
            </div>
            
            {/* Price Row */}
            <div className="flex items-center w-full">
              {(() => {
                const currentPrice = offers[0]?.price;
                const compPrice = offers[0]?.comparePrice;
                
                if (compPrice && parseFloat(compPrice) > parseFloat(currentPrice)) {
                  const discount = Math.round(((parseFloat(compPrice) - parseFloat(currentPrice)) / parseFloat(compPrice)) * 100);
                  return (
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl font-bold tracking-tight text-[#1A2530] leading-none">
                        {formatMoney({ amount: currentPrice, currencyCode: "DZD" })}
                      </span>
                      <span className="text-sm text-slate-400 line-through font-medium leading-none">
                        {formatMoney({ amount: compPrice, currencyCode: "DZD" })}
                      </span>
                      <span className="bg-[#1A2530] text-[#D4AF37] text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide leading-none ml-1">
                        وفر {discount}%
                      </span>
                    </div>
                  );
                }
                return (
                  <span className="text-3xl font-bold tracking-tight text-[#1A2530] leading-none">
                    {formatMoney({ amount: currentPrice ?? 0, currencyCode: "DZD" })}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Desktop View Gallery */}
        <div className="hidden md:block">
          <div className="bg-[#FCFCFC] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            {image && (
              <img 
                src={getOptimizedShopifyImage(image.url, 800)} 
                srcSet={getLocalSrcSet(image.url) || `${getOptimizedShopifyImage(image.url, 400)} 400w, ${getOptimizedShopifyImage(image.url, 800)} 800w, ${getOptimizedShopifyImage(image.url, 1200)} 1200w`}
                sizes="(max-width: 768px) 100vw, 50vw"
                alt={image.altText ?? p.title} 
                width={800} height={1000} 
                className="h-full w-full object-cover aspect-[4/5]" 
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
                  className={`aspect-square rounded-xl overflow-hidden transition-all duration-300 ${i === activeImg ? "border-2 border-[#D4AF37] shadow-sm scale-[1.02]" : "border-2 border-transparent hover:border-slate-200 opacity-70 hover:opacity-100"}`}
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

        {/* Desktop Details + COD Form */}
        <div className="mt-2 md:mt-0">
          
          {/* Desktop Only Details (Hidden on Mobile) */}
          <div className="hidden md:block mb-4 bg-[#FCFCFC] rounded-[22px] p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100/80">
            
            {/* Collection Label */}
            <div className="mb-2">
              <span className="text-[11px] uppercase font-bold tracking-[0.15em] text-[#D4AF37]">
                NOUVELLE COLLECTION
              </span>
            </div>
            
            {/* Product Name */}
            <h1 className="font-serif font-bold text-[#1A2530] text-3xl md:text-4xl leading-[1.2] text-left line-clamp-2 drop-shadow-sm mb-3 w-full" dir="ltr">
              {p.title}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-[#D4AF37] text-xs tracking-widest">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <span className="text-[11px] font-medium text-[#1A2530]/60 mt-0.5">4.9</span>
            </div>
            
            {/* Price Row */}
            <div className="flex items-center w-full">
              {(() => {
                const currentPrice = offers[0]?.price;
                const comparePrice = offers[0]?.comparePrice;
                
                if (comparePrice && parseFloat(comparePrice) > parseFloat(currentPrice)) {
                  const discount = Math.round(((parseFloat(comparePrice) - parseFloat(currentPrice)) / parseFloat(comparePrice)) * 100);
                  return (
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold tracking-tight text-[#1A2530] leading-none">
                        {formatMoney({ amount: currentPrice, currencyCode: "DZD" })}
                      </span>
                      <span className="text-lg text-slate-400 line-through font-medium leading-none">
                        {formatMoney({ amount: comparePrice, currencyCode: "DZD" })}
                      </span>
                      <span className="bg-[#1A2530] text-[#D4AF37] text-xs font-bold px-2 py-0.5 rounded-sm tracking-wide leading-none ml-2">
                        وفر {discount}%
                      </span>
                    </div>
                  );
                }
                return (
                  <span className="text-4xl font-bold tracking-tight text-[#1A2530] leading-none">
                    {formatMoney({ amount: currentPrice ?? 0, currencyCode: "DZD" })}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* 8 & 9: Size / Quantity / COD Form */}
          <div className="w-[calc(100dvw-16px)] max-w-[480px] min-w-0 mx-auto box-border">
            <CodForm 
              productName={p?.title}
              offers={offers}
              variants={variants}
              pricingConfig={pricingConfig}
              scarcityConfig={(p as any).scarcityConfig}
              basePrice={basePrice}
              comparePrice={comparePrice}
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

      <div className="mt-8 mb-4">
        <LazySection minHeight="128px">
          <Suspense fallback={<div className="h-32 w-full animate-pulse bg-secondary/30 mt-8 rounded-2xl" />}>
            <WhyChooseUs />
          </Suspense>
        </LazySection>
      </div>

      <LazySection minHeight="400px">
        <Suspense fallback={<div className="h-32 w-full animate-pulse bg-secondary/30 mt-16 rounded-2xl" />}>
          <Reviews customImages={p.reviewImages?.edges.map(e => e.node) || []} />
        </Suspense>
      </LazySection>

      <LazySection minHeight="60px">
        <Suspense fallback={null}>
          <StickyCheckoutBar price={p?.priceRange?.minVariantPrice} />
        </Suspense>
      </LazySection>
    </div>
  );
}
