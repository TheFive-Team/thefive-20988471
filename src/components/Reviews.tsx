import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { getOptimizedShopifyImage, getLocalSrcSet } from "@/lib/shopify";

export function Reviews({ customImages }: { customImages?: Array<{ url: string; altText?: string | null }> }) {
  if (!customImages || customImages.length === 0) return null;
  
  const reviewImages = customImages;

  return (
    <section className="py-16 md:py-24 bg-transparent">
      <div className="max-w-6xl mx-auto px-0 md:px-4">
        <div className="text-center mb-8 px-4">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">تقييمات عملائنا</h2>
          <div className="flex justify-center items-center gap-2 text-amber-500 mb-2">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <p className="text-zinc-500">آراء عملائنا بعد تجربة المنتج</p>
        </div>

        <div className="relative w-full">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {reviewImages.map((imgObj, i) => (
                <CarouselItem key={i} className="pl-2 md:pl-4 basis-[90%] sm:basis-[80%] md:basis-1/2 lg:basis-[40%]">
                  <div className="w-full">
                    <img 
                      src={getOptimizedShopifyImage(imgObj.url, 800)} 
                      srcSet={getLocalSrcSet(imgObj.url) || `${getOptimizedShopifyImage(imgObj.url, 400)} 400w, ${getOptimizedShopifyImage(imgObj.url, 800)} 800w`}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      alt={imgObj.altText || `Review ${i + 1}`} 
                      loading="lazy" 
                      decoding="async"
                      width={400}
                      height={400} 
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 rounded-2xl" 
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 md:-left-6 lg:-left-12 z-10 w-10 h-10 md:w-12 md:h-12 border border-zinc-200 shadow-xl text-zinc-700 bg-white/90 backdrop-blur hover:bg-white" />
            <CarouselNext className="absolute right-2 md:-right-6 lg:-right-12 z-10 w-10 h-10 md:w-12 md:h-12 border border-zinc-200 shadow-xl text-zinc-700 bg-white/90 backdrop-blur hover:bg-white" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
