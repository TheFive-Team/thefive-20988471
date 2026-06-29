import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useShopifyProduct } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/shopify";

const numericId = (gid: string) => gid.split("/").pop() ?? gid;
const fbq = (...args: unknown[]) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...a: unknown[]) => void };
  w.fbq?.(...args);
};

export const Route = createFileRoute("/produit/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — The Five A` },
      { property: "og:title", content: `${params.slug} — The Five A` },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { tr } = useI18n();
  const { data: product, isLoading } = useShopifyProduct(slug);
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const variants = product?.node.variants.edges ?? [];
  const selectedVariant = useMemo(
    () => variants.find((v) => v.node.id === variantId)?.node ?? variants[0]?.node,
    [variantId, variants],
  );
  const images = product?.node.images.edges.map((e) => e.node) ?? [];
  const [activeImg, setActiveImg] = useState(0);
  const image = images[activeImg] ?? images[0];

  // Meta Pixel — ViewContent
  useEffect(() => {
    if (!product || !selectedVariant) return;
    fbq("track", "ViewContent", {
      content_ids: [numericId(selectedVariant.id)],
      content_name: product.node.title,
      content_type: "product",
      value: parseFloat(selectedVariant.price.amount),
      currency: selectedVariant.price.currencyCode,
    });
  }, [product, selectedVariant]);

  if (isLoading) {
    return <div className="px-6 py-32 text-center text-muted-foreground">Chargement…</div>;
  }
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
    fbq("track", "AddToCart", {
      content_ids: [numericId(selectedVariant.id)],
      content_name: p.title,
      content_type: "product",
      value: parseFloat(selectedVariant.price.amount),
      currency: selectedVariant.price.currencyCode,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      <Link to="/boutique" search={{ cat: "all" }} className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground hover:text-accent">
        ← {tr("nav.shop")}
      </Link>
      <div className="mt-8 grid gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <div className="bg-secondary">
            {image && <img src={image.url} alt={image.altText ?? p.title} width={800} height={1000} className="h-full w-full object-cover" />}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden bg-secondary border ${i === activeImg ? "border-foreground" : "border-transparent hover:border-border"}`}
                >
                  <img src={img.url} alt={img.altText ?? `${p.title} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="md:py-6">
          {p.productType && <p className="eyebrow text-accent">{p.productType}</p>}
          <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl">{p.title}</h1>
          <p className="mt-4 text-xl tracking-wide text-foreground/85">
            {selectedVariant ? formatMoney(selectedVariant.price) : formatMoney(p.priceRange.minVariantPrice)}
          </p>
          <div className="hairline my-7 w-20" />


          {variants.length > 1 && (
            <div className="mt-9">
              <p className="eyebrow mb-3 text-foreground/70">{tr("product.size")}</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.node.id}
                    onClick={() => setVariantId(v.node.id)}
                    disabled={!v.node.availableForSale}
                    className={`min-w-16 border px-4 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-40 ${
                      selectedVariant?.id === v.node.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-foreground"
                    }`}
                  >{v.node.title}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAdd}
              disabled={!selectedVariant || isCartLoading || !selectedVariant.availableForSale}
              className="flex-1 border border-foreground bg-background px-6 py-4 text-xs uppercase tracking-[0.28em] text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              {added ? "✓ Ajouté" : selectedVariant?.availableForSale === false ? "Indisponible" : tr("product.add")}
            </button>
          </div>

          <div className="mt-8 space-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
            <p className="flex items-center gap-2"><span className="text-accent">◆</span> {tr("product.cod")}</p>
            <p className="flex items-center gap-2"><span className="text-accent">◆</span> {tr("ship.f1")}</p>
            <p className="flex items-center gap-2"><span className="text-accent">◆</span> {tr("ship.f3")}</p>
          </div>
        </div>
      </div>

      {p.descriptionHtml && (
        <section className="mt-16 sm:mt-24">
          <div
            className="shopify-rte mx-auto max-w-4xl text-foreground/85 [&_img]:mx-auto [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h1]:mt-10 [&_h2]:mt-10 [&_h3]:mt-8 [&_h1]:mb-4 [&_h2]:mb-4 [&_h3]:mb-3 [&_p]:my-4 [&_p]:leading-relaxed [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:underline [&_iframe]:mx-auto [&_iframe]:my-6 [&_iframe]:max-w-full"
            dangerouslySetInnerHTML={{ __html: p.descriptionHtml }}
          />
        </section>
      )}
    </div>
  );
}
