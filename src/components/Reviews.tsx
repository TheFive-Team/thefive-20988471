import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function Reviews() {
  const reviewImages = [
    "/Instagram-post-9.webp",
    "/Instagram-post-10.webp",
    "/Instagram-post-11.webp",
    "/Instagram-post-12.webp",
    "/Instagram-post-13.webp",
    "/Instagram-post-14.webp",
    "/Instagram-post-16.webp",
    "/Instagram-post-18.webp",
  ];

  return (
    <section className="py-16 md:py-24 bg-zinc-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">تقييمات عملائنا</h2>
          <div className="flex justify-center items-center gap-2 text-amber-500 mb-2">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <p className="text-zinc-500">آراء عملائنا بعد تجربة المنتج</p>
        </div>

        <div className="px-10">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {reviewImages.map((imgUrl, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="w-full rounded-2xl overflow-hidden shadow-md border border-zinc-200">
                      <img src={imgUrl} alt={`Review ${i + 1}`} className="w-full h-auto object-cover" />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
