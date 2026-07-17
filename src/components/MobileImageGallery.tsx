import { getOptimizedShopifyImage, getLocalSrcSet } from "@/lib/shopify";

export function MobileImageGallery({ images }: { images: { url: string; altText?: string | null }[] }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col w-full" dir="ltr">
      {images.map((img, idx) => (
        <img 
          key={idx}
          src={getOptimizedShopifyImage(img.url, 800)} 
          srcSet={getLocalSrcSet(img.url) || `${getOptimizedShopifyImage(img.url, 400)} 400w, ${getOptimizedShopifyImage(img.url, 800)} 800w, ${getOptimizedShopifyImage(img.url, 1200)} 1200w`}
          sizes="(max-width: 768px) 100vw, 50vw"
          alt={img.altText || `Product view ${idx + 1}`} 
          className="w-full h-auto rounded-xl object-contain mb-4" 
          loading={idx === 0 ? "eager" : "lazy"}
          decoding={idx === 0 ? "sync" : "async"}
          fetchPriority={idx === 0 ? "high" : "auto"}
          onLoad={() => {
            if (idx === 0 && process.env.NODE_ENV === 'development') {
              performance.mark('hero-img-loaded');
            }
          }}
        />
      ))}
    </div>
  );
}
