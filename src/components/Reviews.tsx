import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { getOptimizedShopifyImage, getLocalSrcSet } from "@/lib/shopify";

export function Reviews({ customImages }: { customImages?: Array<{ url: string; altText?: string | null }> }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
    <section className="py-20 md:py-28 bg-[#F6F1E8]" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Editorial Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="text-[#C9A34E] text-[18px] tracking-[0.2em] mb-3">★★★★★</div>
          <div className="font-serif text-[20px] font-bold text-[#102A43] mb-2">4.9 / 5</div>
          <div className="text-[13px] font-bold text-[#C9A34E] tracking-wider mb-5">+850 عميل سعيد</div>
          <h2 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#102A43] leading-tight max-w-[400px]">
            آراء حقيقية من عملائنا بعد استلام الطلب.
          </h2>
        </div>

        {/* Premium Rating Card */}
        <div className="bg-white rounded-[18px] p-6 shadow-[0_8px_30px_rgba(16,42,67,0.06)] border border-[#E8E0D2]/50 max-w-[320px] mx-auto mb-16 flex flex-col items-center justify-center">
          <div className="flex gap-1 text-[#C9A34E] mb-3">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <div className="font-sans font-bold text-[#102A43] text-[26px] mb-1 leading-none">4.9 من 5</div>
          <p className="text-[#6B7280] text-[13px] font-medium mt-1">بناءً على أكثر من 850 تقييم حقيقي.</p>
        </div>

        {/* Carousel */}
        <div className="relative w-full max-w-5xl mx-auto">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-8">
              {reviewImages.map((imgObj, i) => {
                const isActive = current === i;
                return (
                  <CarouselItem key={i} className="pl-4 md:pl-8 basis-[85%] sm:basis-[60%] md:basis-[45%] lg:basis-[35%]">
                    <div 
                      className={`w-full bg-white rounded-[20px] p-3 shadow-[0_10px_40px_rgba(16,42,67,0.06)] border border-[#E8E0D2]/60 transition-all duration-500 ease-out ${
                        isActive ? "scale-100 opacity-100" : "scale-[0.93] opacity-75"
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
            <CarouselPrevious className="absolute left-2 md:-left-8 lg:-left-12 z-10 w-12 h-12 border border-[#E8E0D2] shadow-xl text-[#102A43] bg-white/90 backdrop-blur hover:bg-white transition-all duration-300" />
            <CarouselNext className="absolute right-2 md:-right-8 lg:-right-12 z-10 w-12 h-12 border border-[#E8E0D2] shadow-xl text-[#102A43] bg-white/90 backdrop-blur hover:bg-white transition-all duration-300" />
          </Carousel>
        </div>

        {/* Bottom Trust Statement */}
        <div className="mt-16 text-center">
          <p className="text-[13px] text-[#6B7280] font-medium tracking-wide">
            انضم إلى آلاف العملاء الذين اختاروا The Five A
          </p>
        </div>

      </div>
    </section>
  );
}
