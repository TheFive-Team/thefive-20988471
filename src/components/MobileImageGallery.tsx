import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

const mainGalleryImages = [
  "https://q1hpq2-aq.myshopify.com/cdn/shop/files/dc564e89-ec79-425e-8cee-543e153a2d31.png?v=1782761681",
  "https://q1hpq2-aq.myshopify.com/cdn/shop/files/85b1d44b-bae3-47b8-a440-6442076ea4d9.png?v=1782761707",
  "https://q1hpq2-aq.myshopify.com/cdn/shop/files/0c40ef4f-7885-4824-b0de-95ae0a1ba963.png?v=1782761721",
  "https://q1hpq2-aq.myshopify.com/cdn/shop/files/f4a79b56-6341-4c0c-b925-b4a992c0dd60.png?v=1782761734"
];

const stackedImages = [
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/Screenshot_2026-06-23_000240.png?width=1379",
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/dc564e89-ec79-425e-8cee-543e153a2d31.png?width=1379",
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/85b1d44b-bae3-47b8-a440-6442076ea4d9.png?width=735",
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/f4a79b56-6341-4c0c-b925-b4a992c0dd60.png?width=735"
];

const instagramImages = [
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/Instagram-post-9.webp",
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/Instagram-post-10.webp",
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/Instagram-post-11.webp",
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/Instagram-post-12.webp",
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/Instagram-post-13.webp",
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/Instagram-post-16.webp",
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/Instagram-post-18.webp",
  "https://cdn.shopify.com/s/files/1/0692/0863/7488/files/Instagram-post-14.webp"
];

export function MobileImageGallery() {
  const [mainRef, mainApi] = useEmblaCarousel({ loop: true });
  const [thumbRef, thumbApi] = useEmblaCarousel({ containScroll: "keepSnaps", dragFree: true });
  const [socialRef] = useEmblaCarousel({ align: "start", dragFree: true });
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

  return (
    <div className="w-full max-w-md mx-auto bg-white flex flex-col gap-8 pb-12">
      
      {/* 1. MAIN GALLERY (Top Carousel + Thumbnails) */}
      <section className="w-full">
        <div className="overflow-hidden" ref={mainRef}>
          <div className="flex">
            {mainGalleryImages.map((src, idx) => (
              <div className="flex-[0_0_100%] min-w-0" key={idx}>
                <img src={src} alt={`Product view ${idx + 1}`} className="w-full h-auto object-cover aspect-[4/5]" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Thumbnails */}
        <div className="mt-2 px-2 overflow-hidden" ref={thumbRef}>
          <div className="flex gap-2">
            {mainGalleryImages.map((src, idx) => (
              <div 
                key={idx} 
                className={`flex-[0_0_22%] min-w-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${idx === selectedIndex ? 'border-zinc-900 opacity-100' : 'border-transparent opacity-60'}`}
                onClick={() => onThumbClick(idx)}
              >
                <img src={src} alt={`Thumbnail ${idx + 1}`} className="w-full h-auto object-cover aspect-square" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. DETAILS SECTION (Vertically Stacked Images) */}
      <section className="w-full flex flex-col">
        {stackedImages.map((src, idx) => (
          <img 
            key={idx} 
            src={src} 
            alt={`Detail view ${idx + 1}`} 
            className="w-full h-auto object-cover" 
          />
        ))}
      </section>

      {/* 3. SOCIAL GALLERY (Bottom Carousel) */}
      <section className="w-full overflow-hidden px-2 pt-4" ref={socialRef}>
        <div className="flex gap-3">
          {instagramImages.map((src, idx) => (
            <div className="flex-[0_0_40%] min-w-0" key={idx}>
              <div className="aspect-square rounded-lg overflow-hidden border border-zinc-100">
                <img src={src} alt={`Social feed ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
