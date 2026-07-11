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
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!customImages || customImages.length === 0) return null;
  const reviewImages = customImages;

  return (
    <section 
      ref={sectionRef}
      className={`py-24 md:py-32 bg-[#F8F5EF] transition-all duration-[800ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Minimal Editorial Header */}
        <div className={`flex flex-col items-center text-center mb-8 transition-all duration-[800ms] ease-out delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-[#C9A34E] text-[18px] tracking-[0.2em] mb-5">★★★★★</div>
          <h2 className="font-serif text-[34px] font-bold text-[#102A43] leading-tight mb-3">
            آراء عملائنا
          </h2>
          <p className="text-[14px] text-[#6B7280] font-medium max-w-[300px]">
            تجارب حقيقية بعد استلام الطلب
          </p>
        </div>

        {/* Compact Single-Line Rating */}
        <div className={`flex items-center justify-center gap-2 mb-16 transition-all duration-[800ms] ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-[#C9A34E] text-[16px] tracking-widest mt-0.5">★★★★★</div>
          <span className="text-[#102A43] font-bold text-[16px] mr-1">4.9/5</span>
          <span className="text-[#102A43]/20 mx-1.5">•</span>
          <span className="text-[#6B7280] text-[15px]">+850 تقييم</span>
        </div>

        {/* Carousel */}
        <div className={`relative w-full max-w-5xl mx-auto transition-all duration-[1000ms] ease-out delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-5 md:-ml-6">
              {reviewImages.map((imgObj, i) => {
                const isActive = current === i;
                return (
                  <CarouselItem key={i} className="pl-5 md:pl-6 basis-[85%] sm:basis-[60%] md:basis-[45%] lg:basis-[35%]">
                    <div 
                      className={`w-full bg-white rounded-[22px] p-[12px] shadow-[0_8px_30px_rgba(16,42,67,0.04)] border border-[#E8E0D2]/40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isActive ? "scale-100 opacity-100" : "scale-[0.92] opacity-75"
                      }`}
                    >
                      <img 
                        src={getOptimizedShopifyImage(imgObj.url, 800)} 
                        srcSet={getLocalSrcSet(imgObj.url) || `${getOptimizedShopifyImage(imgObj.url, 400)} 400w, ${getOptimizedShopifyImage(imgObj.url, 800)} 800w`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        alt={imgObj.altText || `Review ${i + 1}`} 
                        loading="lazy" 
                        decoding="async"
                        width={400}
                        height={400} 
                        className="w-full h-auto object-cover rounded-[14px]" 
                      />
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 md:-left-6 lg:-left-12 z-10 w-[44px] h-[44px] border border-transparent shadow-[0_4px_20px_rgba(16,42,67,0.08)] text-[#102A43] bg-white hover:bg-[#FDFCF9] transition-all duration-300 flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4" />
            <CarouselNext className="absolute right-2 md:-right-6 lg:-right-12 z-10 w-[44px] h-[44px] border border-transparent shadow-[0_4px_20px_rgba(16,42,67,0.08)] text-[#102A43] bg-white hover:bg-[#FDFCF9] transition-all duration-300 flex items-center justify-center [&_svg]:w-4 [&_svg]:h-4" />
          </Carousel>
        </div>

      </div>
    </section>
  );
}
