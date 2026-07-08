import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { useI18n } from "@/lib/i18n";
import { useShopifyProduct, productQueryOptions } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, getOptimizedShopifyImage } from "@/lib/shopify";
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
          imagesrcset: `${getOptimizedShopifyImage(mainImg.url, 400)} 400w, ${getOptimizedShopifyImage(mainImg.url, 800)} 800w`,
          imagesizes: "100vw",
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
  const { data: product } = useShopifyProduct(slug);
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const variants = product?.node.variants.edges ?? [];
  const selectedVariant = useMemo(
    () => {
      if (variants.length === 1) return variants[0]?.node;
      return variants.find((v) => v.node.id === variantId)?.node;
    },
    [variantId, variants],
  );

  useEffect(() => {
    if (selectedVariant) setSizeError(false);
  }, [selectedVariant]);

  const images = product?.node.images.edges.map((e) => e.node) ?? [];
  const [activeImg, setActiveImg] = useState(0);
  const image = images[activeImg] ?? images[0];

  // Meta Pixel — ViewContent
  useEffect(() => {
    if (!product) return;
    const variantForPixel = selectedVariant ?? product.node.variants.edges[0]?.node;
    if (!variantForPixel) return;
    trackViewContent({
      productName: product.node.title,
      productId: numericId(variantForPixel.id),
      price: parseFloat(variantForPixel.price.amount),
      currency: variantForPixel.price.currencyCode,
    });
  }, [product, selectedVariant]);


  if (!product) {
    return (
      <div className="px-6 py-32 text-center">
        <h1 className="font-serif text-3xl">Article introuvable</h1>
        <Link to="/boutique" search={{ cat: "all" }} className="mt-6 inline-block underline">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const p = product.node;
  const handleAdd = async () => {
    if (!selectedVariant) return;
    await addItem({
      variantId: selectedVariant.id,
      productHandle: p.handle,
      productTitle: p.title,
      variantTitle: selectedVariant.title,
      image: image?.url ?? null,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    trackAddToCart({
      productName: p.title,
      productId: numericId(selectedVariant.id),
      price: parseFloat(selectedVariant.price.amount),
      currency: selectedVariant.price.currencyCode,
    });
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
                srcSet={`${getOptimizedShopifyImage(image.url, 400)} 400w, ${getOptimizedShopifyImage(image.url, 800)} 800w`}
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
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-xl overflow-hidden shadow-sm bg-secondary border ${i === activeImg ? "border-primary" : "border-transparent hover:border-accent"}`}
                >
                  <img 
                    src={getOptimizedShopifyImage(img.url, 200)} 
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
          <p className="mt-1 text-2xl sm:text-3xl font-medium tracking-wide text-primary">
            {selectedVariant ? formatMoney(selectedVariant.price) : formatMoney(p.priceRange.minVariantPrice)}
          </p>
          <div className="hairline my-6 w-16" />


          {variants.length > 1 && (
            <div id="size-selector" className="mt-6">
              <p className={`font-bold text-lg mb-3 flex items-center gap-2 transition-colors ${sizeError ? 'text-red-600' : 'text-foreground'}`}>
                {tr("product.size")} {sizeError && <span className="text-red-500 normal-case font-bold text-sm ml-2 animate-pulse">* يرجى الاختيار / Required</span>}
              </p>
              <div className="flex flex-wrap gap-3">
                {variants.map((v) => (
                  <button
                    key={v.node.id}
                    onClick={() => setVariantId(v.node.id)}
                    disabled={!v.node.availableForSale}
                    className={`rounded-xl min-w-16 border-2 px-5 py-3 text-base uppercase tracking-wider transition-all disabled:opacity-40 font-bold ${
                      selectedVariant?.id === v.node.id
                        ? "border-primary bg-background shadow-md text-foreground scale-105"
                        : "border-foreground/40 text-foreground/80 hover:border-foreground/60 hover:bg-accent/20 bg-background/50"
                    }`}
                  >{v.node.title}</button>
                ))}
              </div>
            </div>
          )}

          {/* COD Form Checkout Section Moved Here (Right after variants) */}
          <div id="checkout-form" className="mt-12 bg-transparent -mx-6 px-4 sm:mx-0 sm:px-0">
            <CodForm 
              productPriceAmount={selectedVariant?.price?.amount ?? p.priceRange.minVariantPrice.amount} 
              productName={p.title}
              variantTitle={selectedVariant?.title}
              requireSize={variants.length > 1 && !selectedVariant}
              onSizeError={() => setSizeError(true)}
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

      {/* Mobile Stacked Big Images (moved to bottom) */}
      {images.length > 1 && (
        <section className="block md:hidden w-full flex flex-col items-center justify-center mt-16 space-y-4">
          {images.slice(1).map((img, idx) => (
            <img 
              key={idx} 
              src={getOptimizedShopifyImage(img.url, 800)} 
              srcSet={`${getOptimizedShopifyImage(img.url, 400)} 400w, ${getOptimizedShopifyImage(img.url, 800)} 800w`}
              sizes="100vw"
              alt={img.altText || `${p.title} detail view ${idx + 1}`} 
              className="w-full max-w-2xl h-auto object-cover rounded-2xl shadow-md" 
              loading="lazy"
              decoding="async"
              width={800} height={1000}
            />
          ))}
        </section>
      )}

      <Suspense fallback={<div className="h-32 w-full animate-pulse bg-secondary/30 mt-16 rounded-2xl" />}>
        <Reviews />
      </Suspense>

      <Suspense fallback={null}>
        <StickyCheckoutBar price={selectedVariant?.price ?? p.priceRange.minVariantPrice} />
      </Suspense>
    </div>
  );
}
