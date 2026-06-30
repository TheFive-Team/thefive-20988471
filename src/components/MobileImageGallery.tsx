import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

export function MobileImageGallery({ images }: { images: { url: string; altText?: string | null }[] }) {
  const [mainRef, mainApi] = useEmblaCarousel({ loop: true });
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
    <div className="w-full max-w-md mx-auto bg-white flex flex-col gap-8 pb-12">
      
      {/* 1. MAIN GALLERY (Top Carousel + Thumbnails) */}
      <section className="w-full">
        <div className="overflow-hidden" ref={mainRef}>
          <div className="flex">
            {images.map((img, idx) => (
              <div className="flex-[0_0_100%] min-w-0" key={idx}>
                <img src={img.url} alt={img.altText || `Product view ${idx + 1}`} className="w-full h-auto object-cover aspect-[4/5]" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-2 px-2 overflow-hidden" ref={thumbRef}>
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`flex-[0_0_22%] min-w-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${idx === selectedIndex ? 'border-zinc-900 opacity-100' : 'border-transparent opacity-60'}`}
                  onClick={() => onThumbClick(idx)}
                >
                  <img src={img.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-auto object-cover aspect-square" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2. DETAILS SECTION (Vertically Stacked Images) */}
      {/* Renders all images stacked for that GemPages look, starting from the second image to avoid immediate duplication of the cover */}
      {images.length > 1 && (
        <section className="w-full flex flex-col">
          {images.slice(1).map((img, idx) => (
            <img 
              key={idx} 
              src={img.url} 
              alt={img.altText || `Detail view ${idx + 1}`} 
              className="w-full h-auto object-cover" 
            />
          ))}
        </section>
      )}

    </div>
  );
}
