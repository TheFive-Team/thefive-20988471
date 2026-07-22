import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { useI18n } from "@/lib/i18n";
import { productQueryOptions } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, getOptimizedShopifyImage, getLocalSrcSet } from "@/lib/shopify";
import { MobileImageGallery } from "@/components/MobileImageGallery";
import { CodForm } from "@/components/CodForm";
import { LazySection } from "@/components/LazySection";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ShieldCheck, Truck, CheckCircle2, RefreshCw } from "lucide-react";

const Reviews = lazy(() => import("@/components/Reviews").then(m => ({ default: m.Reviews })));
const StickyCheckoutBar = lazy(() => import("@/components/StickyCheckoutBar").then(m => ({ default: m.StickyCheckoutBar })));

const numericId = (gid: string) => gid.split("/").pop() ?? gid;
import { trackViewContent, trackAddToCart } from "@/lib/metaPixel";
import { trackViewContentCapiFn } from "@/actions/trackViewContentCapi";

function generateSafeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return ([1e7].toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

import { NewLeadForm } from "@/components/NewLeadForm";
import { trackInitiateCheckout } from "@/lib/metaPixel";

export const Route = createFileRoute("/produit/$slug")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      variant: typeof search.variant === "string" ? search.variant : undefined,
      v: typeof search.v === "string" ? search.v : undefined,
    };
  },
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
          imageSrcSet: getLocalSrcSet(mainImg.url) || `${getOptimizedShopifyImage(mainImg.url, 400)} 400w, ${getOptimizedShopifyImage(mainImg.url, 800)} 800w, ${getOptimizedShopifyImage(mainImg.url, 1200)} 1200w`,
          imageSizes: "(max-width: 768px) 100vw, 50vw",
          fetchPriority: "high" 
        }
      ] : []
    };
  },
  component: ProductPage,
});

const ageMapVariantB: Record<string, string> = {
  "6": "5-6",
  "8": "7-8",
  "10": "9-10",
  "12": "11-12"
};

function ProductPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const { tr } = useI18n();
  const product = Route.useLoaderData();
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);
  const p = product?.node;
  const variants = p?.variants?.edges ?? [];
  const totalStock = variants.reduce((sum: number, v: any) => sum + (v.node.quantityAvailable || 10), 0);
  
  // A/B Testing Variant B detection
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const variantParam = search?.variant || search?.v || urlParams?.get("variant") || urlParams?.get("v") || "";
  const isVariantB = variantParam.toLowerCase() === "b" || variantParam === "2" || (typeof window !== "undefined" && window.location.pathname.endsWith("/v2"));

  // State for Variant B (2-Step Progressive Disclosure Flow)
  const [variantBQty, setVariantBQty] = useState(1);
  const [variantBSizes, setVariantBSizes] = useState<string[]>([""]);
  const [variantBSizeError, setVariantBSizeError] = useState(false);
  const [isStep2Revealed, setIsStep2Revealed] = useState(false);
  const initiateCheckoutFiredRef = useRef(false);

  useEffect(() => {
    setVariantBSizes(Array(variantBQty).fill(""));
    setVariantBSizeError(false);
  }, [variantBQty]);

  const setVariantBSizeForPiece = (index: number, variantId: string) => {
    const newSizes = [...variantBSizes];
    newSizes[index] = variantId;
    setVariantBSizes(newSizes);
    setVariantBSizeError(false);
  };

  const handleStep1CtaClick = () => {
    const requireSize = variants.length > 1 && variantBSizes.some(s => s === "");
    if (requireSize) {
      setVariantBSizeError(true);
      document.getElementById("variantB-size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const sessionKey = `ic_fired_${p?.id || "default"}`;
    const alreadyFiredInSession = typeof window !== "undefined" && sessionStorage.getItem(sessionKey) === "true";

    if (!initiateCheckoutFiredRef.current && !alreadyFiredInSession && p?.title) {
      initiateCheckoutFiredRef.current = true;
      if (typeof window !== "undefined") {
        sessionStorage.setItem(sessionKey, "true");
      }
      try {
        trackInitiateCheckout({
          productName: p.title,
          productId: p.id || "default",
          price: Number(p?.priceRange?.minVariantPrice?.amount ?? 0),
          currency: "DZD"
        });
      } catch (err) {
        console.error("Meta Pixel InitiateCheckout Error:", err);
      }
    }

    setIsStep2Revealed(true);
    setTimeout(() => {
      document.getElementById("new-lead-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const offers = useMemo(() => {
    const rawOffersList = Array.isArray((p as any)?.offers) ? (p as any).offers : [];
    const rawOffers = rawOffersList.filter((o: any) => o && o.active !== false);

    if (rawOffers.length > 0) return rawOffers;
    return [{
      id: "default-1",
      title: "قطعة واحدة",
      price: p?.priceRange?.minVariantPrice?.amount ?? "0",
      comparePrice: p?.compareAtPriceRange?.minVariantPrice?.amount,
      pieces: 1,
      badge: ""
    }];
  }, [(p as any)?.offers, p?.priceRange?.minVariantPrice?.amount, p?.compareAtPriceRange?.minVariantPrice?.amount]);

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

  const images = product?.node?.images?.edges?.map((e: any) => e.node) ?? [];
  const [activeImg, setActiveImg] = useState(0);
  const image = images[activeImg] ?? images[0];

  const trackedProductIdRef = useRef<string | null>(null);

  // Meta Pixel & CAPI — ViewContent
  useEffect(() => {
    const currentProductId = p?.id;
    if (!currentProductId || offers.length === 0) return;
    
    if (trackedProductIdRef.current === currentProductId) return;
    trackedProductIdRef.current = currentProductId;
    
    const eventId = generateSafeId();
    const price = parseFloat(offers[0].price || 0);

    // 1. Frontend Meta Pixel
    try {
      trackViewContent({
        productName: p.title || "Product",
        productId: currentProductId,
        price,
        currency: "DZD",
        eventId,
      });
    } catch (err) {
      console.error("Meta Pixel ViewContent Error:", err);
    }

    // 2. Backend CAPI
    trackViewContentCapiFn({
      data: {
        productName: p.title || "Product",
        productId: currentProductId,
        price,
        currency: "DZD",
        eventId,
        clientUserAgent: navigator.userAgent,
        eventSourceUrl: window.location.href,
      }
    }).catch(err => console.error("Failed to send ViewContent CAPI:", err));

  }, []); // Empty dependency array ensures it only fires once on mount

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

  const handleAdd = async () => {};

  const scrollToCheckout = () => {
    document.getElementById("checkout-form")?.scrollIntoView({ behavior: "smooth" });
  };

  let displayTitle = p?.title || "";
  let displaySubtitle = (p as any)?.subtitle || "";

  if (slug === "Ensemble–d’Été–Fille" && !displaySubtitle) {
    displaySubtitle = "Coton pur & lin naturel • Douceur & confort";
  }

  if (isVariantB) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-10 sm:py-24 w-full box-border">

        <div className="grid gap-0 md:grid-cols-2 md:gap-10 lg:gap-12">
          
          {/* Mobile View */}
          <div className="block md:hidden mb-6 w-full max-w-lg mx-auto flex flex-col gap-5">
            {/* Gallery */}
            <div className="w-full box-border min-w-0">
              <MobileImageGallery images={images} />
            </div>

            {/* Product Details & Step 1 Controls */}
            <div className="w-full box-border">
              <div className="flex flex-col items-start text-left bg-white rounded-[20px] p-[20px_16px] shadow-[0_4px_16px_rgba(16,42,67,0.04)] border border-[#E8E0D2] w-full max-w-full min-w-0 m-0 box-border overflow-hidden">
                <div className="mb-[10px] w-full text-left" dir="ltr">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#C99A24] text-white text-[10px] sm:text-[11px] font-semibold tracking-[1.5px] uppercase shadow-xs">
                    NOUVELLE COLLECTION
                  </span>
                </div>
                <div className="w-full text-left" dir="ltr">
                  <h1 className="font-serif font-bold text-[#102A4C] text-[clamp(32px,8vw,40px)] leading-[1.12] tracking-tight m-0 break-words">
                    {displayTitle}
                  </h1>
                  {displaySubtitle && (
                    <h2 className="font-sans font-medium text-slate-500 text-sm mt-[6px] leading-snug" dir="ltr">
                      {displaySubtitle}
                    </h2>
                  )}
                </div>

                {/* Rating & Social Proof */}
                <div className="mt-3 w-full flex items-center gap-1.5 text-sm text-slate-700 font-medium" dir="ltr">
                  <span className="text-[#D4AF37] font-bold text-sm">★</span>
                  <span className="font-bold text-sm text-slate-800" dir="ltr" style={{ unicodeBidi: "isolate" }}>5/4.9</span>
                  <span className="text-slate-300 mx-0.5">•</span>
                  <span className="text-slate-600 text-xs font-medium">(أكثر من 850 عائلة جزائرية)</span>
                </div>
                
                {/* Price */}
                <div className="flex items-center flex-wrap gap-[8px] mt-[16px] w-full text-left" dir="ltr">
                  {(() => {
                    const currentPrice = offers[0]?.price;
                    const compPrice = offers[0]?.comparePrice;
                    if (compPrice && parseFloat(compPrice) > parseFloat(currentPrice)) {
                      const discount = Math.round(((parseFloat(compPrice) - parseFloat(currentPrice)) / parseFloat(compPrice)) * 100);
                      return (
                        <>
                          <span className="font-sans font-extrabold text-[36px] text-[#102A4C] leading-none whitespace-nowrap">
                            {formatMoney({ amount: currentPrice, currencyCode: "DZD" })}
                          </span>
                          <span className="font-sans font-normal text-[14px] text-slate-400 line-through leading-none whitespace-nowrap">
                            {formatMoney({ amount: compPrice, currencyCode: "DZD" })}
                          </span>
                          <span className="inline-flex items-center h-[22px] px-[9px] rounded-full bg-[#C99A24] text-white text-[11px] font-semibold leading-none whitespace-nowrap shadow-xs">
                            -{discount}%
                          </span>
                        </>
                      );
                    }
                    return (
                      <span className="font-sans font-extrabold text-[36px] text-[#102A4C] leading-none whitespace-nowrap">
                        {formatMoney({ amount: currentPrice ?? 0, currencyCode: "DZD" })}
                      </span>
                    );
                  })()}
                </div>

                {/* Step 1: Size & Quantity Selectors */}
                <div className="w-full mt-5 pt-4 border-t border-slate-100" dir="rtl">
                  {/* Quantity Counter */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-3">
                    <span className="text-sm font-extrabold text-[#102A4C]">الكمية:</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setVariantBQty(Math.max(1, variantBQty - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-base text-[#102A4C] w-6 text-center">{variantBQty}</span>
                      <button
                        type="button"
                        onClick={() => setVariantBQty(Math.min(pricingConfig?.maxQuantity || 10, variantBQty + 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Size Selector */}
                  {variants.length > 1 && (
                    <div id="variantB-size-selector" className="space-y-2 text-right">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-extrabold text-[#102A4C]">
                          اختاري المقاس {variantBQty > 1 ? "(لكل قطعة)" : ""}:
                        </label>
                        {variantBSizeError && (
                          <span className="text-xs font-bold text-rose-600 animate-pulse">
                            يرجى اختيار المقاس
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {Array.from({ length: variantBQty }).map((_, pieceIndex) => (
                          <div key={pieceIndex} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                            {variantBQty > 1 && (
                              <span className="text-[11px] font-bold text-[#102A4C] block mb-1">
                                القطعة {pieceIndex + 1}:
                              </span>
                            )}
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
                              {variants.map((v: any) => {
                                const stock = v.node.quantityAvailable ?? 0;
                                const isAvailable = v.node.availableForSale && stock > 0;
                                const titleClean = v.node.title.replace(/ans/gi, "").trim();
                                const label = ageMapVariantB[titleClean] || v.node.title;
                                const isSelected = variantBSizes[pieceIndex] === v.node.id;

                                return (
                                  <button
                                    key={v.node.id}
                                    type="button"
                                    disabled={!isAvailable}
                                    onClick={() => setVariantBSizeForPiece(pieceIndex, v.node.id)}
                                    className={`w-full h-11 px-0.5 rounded-lg text-[18px] sm:text-[20px] font-bold leading-none transition-all cursor-pointer flex items-center justify-center whitespace-nowrap ${
                                      isSelected
                                        ? "bg-[#C9A227] text-white border border-[#C9A227] shadow-sm ring-2 ring-[#C9A227]/40"
                                        : isAvailable
                                        ? "bg-white text-slate-700 border border-slate-200 hover:border-[#C9A227]"
                                        : "bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed line-through"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Step 1 CTA Button */}
                  <button
                    type="button"
                    onClick={handleStep1CtaClick}
                    className="w-full h-14 mt-4 bg-[#102A4C] hover:bg-[#0a1e38] text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>التالي: أكملي معلومات التوصيل 📦</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
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

          {/* Desktop Right Column: Info & Step 1 CTA & Step 2 Form */}
          <div className="mt-0 md:mt-0 w-full max-w-lg mx-auto md:max-w-none md:mx-0">
            <div className="hidden md:block mb-4 bg-[#FCFCFC] rounded-[22px] p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100/80">
              <div className="mb-2.5">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#C99A24] text-white text-[11px] font-semibold tracking-[1.5px] uppercase shadow-xs">
                  NOUVELLE COLLECTION
                </span>
              </div>
              <div className="mb-3 w-full text-left" dir="ltr">
                <h1 className="font-serif font-bold text-[#102A4C] text-[clamp(40px,4vw,54px)] leading-[1.1] tracking-tight drop-shadow-xs break-words">
                  {displayTitle}
                </h1>
                {displaySubtitle && (
                  <h2 className="font-sans font-medium text-slate-500 text-sm mt-1.5 leading-snug" dir="ltr">
                    {displaySubtitle}
                  </h2>
                )}
              </div>

              {/* Rating & Social Proof */}
              <div className="mt-3 mb-4 w-full flex items-center gap-1.5 text-sm text-slate-700 font-medium" dir="ltr">
                <span className="text-[#D4AF37] font-bold text-sm">★</span>
                <span className="font-bold text-sm text-slate-800" dir="ltr" style={{ unicodeBidi: "isolate" }}>5/4.9</span>
                <span className="text-slate-300 mx-0.5">•</span>
                <span className="text-slate-600 text-xs font-medium">(أكثر من 850 عائلة جزائرية)</span>
              </div>
              <div className="flex items-center w-full mb-5">
                {(() => {
                  const currentPrice = offers[0]?.price;
                  const comparePrice = offers[0]?.comparePrice;
                  if (comparePrice && parseFloat(comparePrice) > parseFloat(currentPrice)) {
                    const discount = Math.round(((parseFloat(comparePrice) - parseFloat(currentPrice)) / parseFloat(comparePrice)) * 100);
                    return (
                      <div className="flex items-center gap-3">
                        <span className="font-sans font-extrabold text-[38px] text-[#102A4C] leading-none">
                          {formatMoney({ amount: currentPrice, currencyCode: "DZD" })}
                        </span>
                        <span className="font-sans font-normal text-[14px] text-slate-400 line-through leading-none">
                          {formatMoney({ amount: comparePrice, currencyCode: "DZD" })}
                        </span>
                        <span className="inline-flex items-center h-[22px] px-[9px] rounded-full bg-[#C99A24] text-white text-[11px] font-semibold leading-none ml-1 shadow-xs">
                          -{discount}%
                        </span>
                      </div>
                    );
                  }
                  return (
                    <span className="font-sans font-extrabold text-[38px] text-[#102A4C] leading-none">
                      {formatMoney({ amount: currentPrice ?? 0, currencyCode: "DZD" })}
                    </span>
                  );
                })()}
              </div>

              {/* Step 1: Desktop Controls */}
              <div className="pt-4 border-t border-slate-200/60" dir="rtl">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-3">
                  <span className="text-sm font-extrabold text-[#102A4C]">الكمية:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setVariantBQty(Math.max(1, variantBQty - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-base text-[#102A4C] w-6 text-center">{variantBQty}</span>
                    <button
                      type="button"
                      onClick={() => setVariantBQty(Math.min(pricingConfig?.maxQuantity || 10, variantBQty + 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {variants.length > 1 && (
                  <div id="variantB-size-selector-desktop" className="space-y-2 text-right mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-extrabold text-[#102A4C]">
                        اختاري المقاس {variantBQty > 1 ? "(لكل قطعة)" : ""}:
                      </label>
                      {variantBSizeError && (
                        <span className="text-xs font-bold text-rose-600 animate-pulse">
                          يرجى اختيار المقاس
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: variantBQty }).map((_, pieceIndex) => (
                        <div key={pieceIndex} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                          {variantBQty > 1 && (
                            <span className="text-[11px] font-bold text-[#102A4C] block mb-1">
                              القطعة {pieceIndex + 1}:
                            </span>
                          )}
                          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
                            {variants.map((v: any) => {
                              const stock = v.node.quantityAvailable ?? 0;
                              const isAvailable = v.node.availableForSale && stock > 0;
                              const titleClean = v.node.title.replace(/ans/gi, "").trim();
                              const label = ageMapVariantB[titleClean] || v.node.title;
                              const isSelected = variantBSizes[pieceIndex] === v.node.id;

                              return (
                                <button
                                  key={v.node.id}
                                  type="button"
                                  disabled={!isAvailable}
                                  onClick={() => setVariantBSizeForPiece(pieceIndex, v.node.id)}
                                  className={`w-full h-11 px-0.5 rounded-lg text-[18px] sm:text-[20px] font-bold leading-none transition-all cursor-pointer flex items-center justify-center whitespace-nowrap ${
                                    isSelected
                                      ? "bg-[#C9A227] text-white border border-[#C9A227] shadow-sm ring-2 ring-[#C9A227]/40"
                                      : isAvailable
                                      ? "bg-white text-slate-700 border border-slate-200 hover:border-[#C9A227]"
                                      : "bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed line-through"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleStep1CtaClick}
                  className="w-full h-14 mt-2 bg-[#102A4C] hover:bg-[#0a1e38] text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>التالي: أكملي معلومات التوصيل 📦</span>
                </button>
              </div>
            </div>

            {/* Step 2 Revealed Component */}
            <div id="new-lead-form-section" className="mb-8 w-full mx-auto max-w-lg min-[553px]:max-w-[520px] min-w-0 relative z-10">
              {isStep2Revealed ? (
                <NewLeadForm 
                  productName={p?.title}
                  offers={offers}
                  variants={variants}
                  pricingConfig={pricingConfig}
                  scarcityConfig={(p as any)?.scarcityConfig}
                  basePrice={basePrice}
                  comparePrice={comparePrice}
                  selectedQuantity={variantBQty}
                  selectedSizes={variantBSizes}
                />
              ) : (
                <div className="p-5 bg-[#F9FAFB] rounded-[16px] border border-[#E5E7EB] text-right shadow-sm mt-2" dir="rtl">
                  <h4 className="text-[#102A4C] font-bold text-[14px] mb-3 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#C99A24]" />
                    تسوقي بثقة وأمان
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Truck size={13} className="text-blue-600" />
                      </div>
                      <p className="text-[13px] text-[#2D3748] font-medium leading-tight">
                        <span className="font-bold text-[#102A4C]">توصيل مع إمكانية المعاينة:</span> افتحي الطرد وتأكدي من الجودة قبل الدفع.
                      </p>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                      </div>
                      <p className="text-[13px] text-[#2D3748] font-medium leading-tight">
                        <span className="font-bold text-[#102A4C]">قماش ممتاز ورطب:</span> ناعم جداً على بشرة الأطفال ومناسب للحر.
                      </p>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                        <RefreshCw size={13} className="text-amber-600" />
                      </div>
                      <p className="text-[13px] text-[#2D3748] font-medium leading-tight">
                        <span className="font-bold text-[#102A4C]">ضمان الاستبدال:</span> تبديل المقاس متوفر وسهل.
                      </p>
                    </li>
                  </ul>
                </div>
              )}
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
          <section className="w-full max-w-lg mx-auto flex flex-col mt-6 mb-6">
            {p.detailImages.edges.map((e, idx) => (
              <img 
                key={idx}
                width={e.node.width || 800}
                height={e.node.height || 1000}
                style={{ 
                  aspectRatio: e.node.width && e.node.height ? `${e.node.width}/${e.node.height}` : 'auto' 
                }}
                src={getOptimizedShopifyImage(e.node.url, 800)} 
                srcSet={getLocalSrcSet(e.node.url) || `${getOptimizedShopifyImage(e.node.url, 400)} 400w, ${getOptimizedShopifyImage(e.node.url, 800)} 800w`}
                sizes="(max-width: 768px) 100vw, 50vw"
                alt={e.node.altText || `${p.title} detail view ${idx + 1}`} 
                className="w-full h-auto rounded-xl object-contain mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
                loading="lazy"
                decoding="async"
              />
            ))}
          </section>
        )}

        <div className="mt-8 mb-4">
          <WhyChooseUs />
        </div>

        <LazySection minHeight="400px">
          <Suspense fallback={<div className="h-32 w-full animate-pulse bg-secondary/30 mt-16 rounded-2xl" />}>
            <Reviews customImages={p.reviewImages?.edges?.map((e: any) => e.node) || []} />
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-10 sm:py-24 w-full box-border">
      <div className="grid gap-0 md:grid-cols-2 md:gap-10 lg:gap-12">
        
        {/* Mobile View: Gallery first, then Text */}
        <div className="block md:hidden mb-6 w-full max-w-lg mx-auto flex flex-col gap-5">
          
          {/* 1. Gallery (Mobile) */}
          <div className="w-full box-border min-w-0">
            <MobileImageGallery images={images} />
          </div>

          {/* 2. Text Details below gallery */}
          <div className="w-full box-border">
            <div className="flex flex-col items-start text-left bg-white rounded-[20px] p-[20px_16px] shadow-[0_4px_16px_rgba(16,42,67,0.04)] border border-[#E8E0D2] w-full max-w-full min-w-0 m-0 box-border overflow-hidden">
            
            {/* Collection Label */}
            <div className="mb-[10px] w-full text-left" dir="ltr">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#C99A24] text-white text-[10px] sm:text-[11px] font-semibold tracking-[1.5px] uppercase shadow-xs">
                NOUVELLE COLLECTION
              </span>
            </div>
            
            {/* Product Name & Subtitle */}
            <div className="w-full text-left" dir="ltr">
              <h1 className="font-serif font-bold text-[#102A4C] text-[clamp(32px,8vw,40px)] leading-[1.12] tracking-tight m-0 break-words">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <h2 className="font-sans font-medium text-slate-500 text-sm mt-[6px] leading-snug" dir="ltr">
                  {displaySubtitle}
                </h2>
              )}
            </div>
            
            {/* Rating & Social Proof */}
            <div className="mt-3 w-full flex items-center gap-1.5 text-sm text-slate-700 font-medium" dir="ltr">
              <span className="text-[#D4AF37] font-bold text-sm">★</span>
              <span className="font-bold text-sm text-slate-800" dir="ltr" style={{ unicodeBidi: "isolate" }}>5/4.9</span>
              <span className="text-slate-300 mx-0.5">•</span>
              <span className="text-slate-600 text-xs font-medium">(أكثر من 850 عائلة جزائرية)</span>
            </div>
            
            {/* Price Row */}
            <div className="flex items-center flex-wrap gap-[8px] mt-[16px] w-full text-left" dir="ltr">
              {(() => {
                const currentPrice = offers[0]?.price;
                const compPrice = offers[0]?.comparePrice;
                
                if (compPrice && parseFloat(compPrice) > parseFloat(currentPrice)) {
                  const discount = Math.round(((parseFloat(compPrice) - parseFloat(currentPrice)) / parseFloat(compPrice)) * 100);
                  return (
                    <>
                      <span className="font-sans font-bold text-[32px] text-[#102A4C] leading-none whitespace-nowrap">
                        {formatMoney({ amount: currentPrice, currencyCode: "DZD" })}
                      </span>
                      <span className="font-sans font-normal text-[14px] text-slate-400 line-through leading-none whitespace-nowrap">
                        {formatMoney({ amount: compPrice, currencyCode: "DZD" })}
                      </span>
                      <span className="inline-flex items-center h-[22px] px-[9px] rounded-full bg-[#C99A24] text-white text-[11px] font-semibold leading-none whitespace-nowrap shadow-xs">
                        -{discount}%
                      </span>
                    </>
                  );
                }
                return (
                  <span className="font-sans font-bold text-[32px] text-[#102A4C] leading-none whitespace-nowrap">
                    {formatMoney({ amount: currentPrice ?? 0, currencyCode: "DZD" })}
                  </span>
                );
              })()}
            </div>
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
        <div className="mt-0 md:mt-0 w-full max-w-lg mx-auto md:max-w-none md:mx-0">
          
          {/* Desktop Only Details (Hidden on Mobile) */}
          <div className="hidden md:block mb-4 bg-[#FCFCFC] rounded-[22px] p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100/80">
            
            {/* Collection Label */}
            <div className="mb-2.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#C99A24] text-white text-[11px] font-semibold tracking-[1.5px] uppercase shadow-xs">
                NOUVELLE COLLECTION
              </span>
            </div>
            
            {/* Product Name & Subtitle */}
            <div className="mb-3 w-full text-left" dir="ltr">
              <h1 className="font-serif font-bold text-[#102A4C] text-[clamp(40px,4vw,54px)] leading-[1.1] tracking-tight drop-shadow-xs break-words">
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <h2 className="font-sans font-medium text-slate-500 text-sm mt-1.5 leading-snug" dir="ltr">
                  {displaySubtitle}
                </h2>
              )}
            </div>
            
            {/* Rating & Social Proof */}
            <div className="mt-3 mb-4 w-full flex items-center gap-1.5 text-sm text-slate-700 font-medium" dir="ltr">
              <span className="text-[#D4AF37] font-bold text-sm">★</span>
              <span className="font-bold text-sm text-slate-800" dir="ltr" style={{ unicodeBidi: "isolate" }}>5/4.9</span>
              <span className="text-slate-300 mx-0.5">•</span>
              <span className="text-slate-600 text-xs font-medium">(أكثر من 850 عائلة جزائرية)</span>
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
                      <span className="font-sans font-bold text-[32px] text-[#102A4C] leading-none">
                        {formatMoney({ amount: currentPrice, currencyCode: "DZD" })}
                      </span>
                      <span className="font-sans font-normal text-[14px] text-slate-400 line-through leading-none">
                        {formatMoney({ amount: comparePrice, currencyCode: "DZD" })}
                      </span>
                      <span className="inline-flex items-center h-[22px] px-[9px] rounded-full bg-[#C99A24] text-white text-[11px] font-semibold leading-none ml-1 shadow-xs">
                        -{discount}%
                      </span>
                    </div>
                  );
                }
                return (
                  <span className="font-sans font-bold text-[32px] text-[#102A4C] leading-none">
                    {formatMoney({ amount: currentPrice ?? 0, currencyCode: "DZD" })}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* 8 & 9: Size / Quantity / COD Form */}
          <div className="mb-8 w-full mx-auto max-w-lg min-[553px]:max-w-[520px] min-w-0 relative z-10">
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
        <section className="w-full max-w-lg mx-auto flex flex-col mt-6 mb-6">
          {p.detailImages.edges.map((e, idx) => (
            <img 
              key={idx}
              width={e.node.width || 800}
              height={e.node.height || 1000}
              style={{ 
                aspectRatio: e.node.width && e.node.height ? `${e.node.width}/${e.node.height}` : 'auto' 
              }}
              src={getOptimizedShopifyImage(e.node.url, 800)} 
              srcSet={getLocalSrcSet(e.node.url) || `${getOptimizedShopifyImage(e.node.url, 400)} 400w, ${getOptimizedShopifyImage(e.node.url, 800)} 800w`}
              sizes="(max-width: 768px) 100vw, 50vw"
              alt={e.node.altText || `${p.title} detail view ${idx + 1}`} 
              className="w-full h-auto rounded-xl object-contain mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
              loading="lazy"
              decoding="async"
            />
          ))}
        </section>
      )}

      <div className="mt-8 mb-4">
        <WhyChooseUs />
      </div>

      <LazySection minHeight="400px">
        <Suspense fallback={<div className="h-32 w-full animate-pulse bg-secondary/30 mt-16 rounded-2xl" />}>
          <Reviews customImages={p.reviewImages?.edges?.map((e: any) => e.node) || []} />
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
