import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { getOptimizedShopifyImage, getLocalSrcSet } from "@/lib/shopify";

export function Reviews({ customImages }: { customImages?: Array<{ url: string; altText?: string | null }> }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!api) return;
    
    setCurrent(api.selectedScrollSnap());
    setScrollSnaps(api.scrollSnapList());
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!customImages || customImages.length === 0) return null;
  const reviewImages = customImages;

  return (
    <section 
      ref={sectionRef}
      className={`pt-[36px] pb-24 md:pb-32 bg-[#F8F5EF] transition-all duration-[800ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto px-0 md:px-4">
        
        {/* Minimal Editorial Header */}
        <div className={`flex flex-col items-center text-center mb-6 transition-all duration-[800ms] ease-out delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-[#C9A34E] text-[18px] tracking-[0.2em] mb-5">★★★★★</div>
          <h2 className="font-serif text-[34px] font-bold text-[#102A43] leading-tight mb-3">
            آراء عملائنا
          </h2>
          <p className="text-[14px] text-[#6B7280] font-medium max-w-[300px]">
            تجارب حقيقية بعد استلام الطلب
          </p>
        </div>

        {/* Compact Single-Line Rating */}
        <div className={`flex items-center justify-center gap-2 mb-12 transition-all duration-[800ms] ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-[#C9A34E] text-[16px] tracking-widest mt-0.5">★★★★★</div>
          <span className="text-[#102A43] font-bold text-[16px] mr-1">4.9/5</span>
          <span className="text-[#102A43]/20 mx-1.5">•</span>
          <span className="text-[#6B7280] text-[15px]">+850 تقييم</span>
        </div>

        {/* Carousel */}
        <div dir="ltr" className={`relative w-full max-w-5xl mx-auto group transition-all duration-[1000ms] ease-out delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: false,
              skipSnaps: false,
              containScroll: false,
              direction: "ltr",
              duration: 32
            }}
            className="w-full overflow-hidden"
          >
            <CarouselContent className="-ml-4 md:-ml-5 flex flex-row w-full">
              {reviewImages.map((imgObj, i) => {
                const isActive = current === i;
                return (
                  <CarouselItem 
                    key={imgObj.url || `review-${i}`} 
                    className="pl-4 md:pl-5 min-w-0 shrink-0 grow-0 basis-[88%] sm:basis-[75%] md:basis-[60%] lg:basis-[50%]"
                  >
                    <div 
                      className={`w-full bg-white rounded-[24px] p-[12px] transition-all duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                        isActive 
                          ? "scale-100 opacity-100 shadow-[0_12px_35px_rgba(16,42,67,0.08)]" 
                          : "scale-[0.94] opacity-65 shadow-none"
                      }`}
                    >
                      <img 
                        src={getOptimizedShopifyImage(imgObj.url, 800)} 
                        srcSet={getLocalSrcSet(imgObj.url) || `${getOptimizedShopifyImage(imgObj.url, 400)} 400w, ${getOptimizedShopifyImage(imgObj.url, 800)} 800w`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        alt={imgObj.altText || `Review ${i + 1}`} 
                        loading="lazy" 
                        decoding="async"
                        width={600}
                        height={600} 
                        className="w-full h-auto object-cover rounded-[16px]" 
                      />
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            {/* Navigation Arrows */}
            <CarouselPrevious 
              onClick={() => api?.scrollPrev()} 
              className="absolute left-2 md:-left-4 lg:-left-6 z-10 w-[44px] h-[44px] border border-transparent shadow-[0_4px_20px_rgba(16,42,67,0.08)] text-[#102A43] bg-white hover:bg-[#FDFCF9] transition-all duration-300 flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 opacity-100 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-0" 
            />
            <CarouselNext 
              onClick={() => api?.scrollNext()} 
              className="absolute right-2 md:-right-4 lg:-right-6 z-10 w-[44px] h-[44px] border border-transparent shadow-[0_4px_20px_rgba(16,42,67,0.08)] text-[#102A43] bg-white hover:bg-[#FDFCF9] transition-all duration-300 flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 opacity-100 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-0" 
            />
          </Carousel>
        </div>

        {/* Pagination Dots */}
        <div dir="ltr" className={`flex justify-center items-center gap-2.5 mt-10 transition-all duration-[1000ms] ease-out delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`rounded-full transition-all duration-[300ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                index === current 
                  ? "w-2.5 h-2.5 bg-[#C9A34E]" 
                  : "w-2 h-2 bg-[#C9A34E]/30 hover:bg-[#C9A34E]/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
