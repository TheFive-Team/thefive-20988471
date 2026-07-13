import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { getOptimizedShopifyImage, getLocalSrcSet } from "@/lib/shopify";

export function MobileImageGallery({ images }: { images: { url: string; altText?: string | null }[] }) {
  const [mainRef, mainApi] = useEmblaCarousel({ 
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
    skipSnaps: false,
    dragFree: false
  });
  const [thumbRef, thumbApi] = useEmblaCarousel({ containScroll: "keepSnaps", dragFree: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    setSelectedIndex(mainApi.selectedScrollSnap());
    thumbApi.scrollTo(mainApi.selectedScrollSnap());
  }, [mainApi, thumbApi, setSelectedIndex]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
  }, [mainApi, onSelect]);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 box-border bg-transparent flex flex-col pb-2" dir="ltr">
      
      {/* 1. MAIN GALLERY (Top Carousel + Thumbnails) */}
      <section className="w-full">
        <div className="w-full max-w-full overflow-hidden m-0 p-0 relative box-border" ref={mainRef}>
          <div className="flex m-0 p-0 gap-0 touch-pan-y">
            {images.map((img, idx) => (
              <div className="flex-[0_0_100%] w-full min-w-0 max-w-full m-0 p-0 box-border relative" key={idx}>
                <div className="w-full max-w-full overflow-hidden rounded-[18px] box-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 bg-[#FCFCFC] relative">
                  <img 
                    src={getOptimizedShopifyImage(img.url, 800)} 
                    srcSet={getLocalSrcSet(img.url) || `${getOptimizedShopifyImage(img.url, 400)} 400w, ${getOptimizedShopifyImage(img.url, 800)} 800w`}
                    sizes="100vw"
                    alt={img.altText || `Product view ${idx + 1}`} 
                    className="block w-full max-w-full h-auto object-contain object-center" 
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding={idx === 0 ? "sync" : "async"}
                    fetchPriority={idx === 0 ? "high" : "auto"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-3 overflow-hidden px-1 py-1" ref={thumbRef}>
            <div className="flex gap-2.5">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`flex-[0_0_22%] min-w-0 cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${idx === selectedIndex ? 'border-2 border-[#D4AF37] opacity-100 shadow-md scale-105' : 'border-2 border-transparent hover:border-slate-200 opacity-70 hover:opacity-100'}`}
                  onClick={() => onThumbClick(idx)}
                >
                  <img 
                    src={img.url.endsWith("-800w.webp") ? img.url.replace("-800w.webp", "-160w.webp") : getOptimizedShopifyImage(img.url, 200)} 
                    alt={`Thumbnail ${idx + 1}`} 
                    className="w-full h-auto object-cover aspect-[4/5]" 
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding={idx === 0 ? "sync" : "async"}
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    width={200}
                    height={250}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
