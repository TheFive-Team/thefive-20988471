import { Star } from "lucide-react";

export function Reviews() {
  const reviewImages = [
    "https://cdn.shopify.com/s/files/1/0819/2180/2539/files/2f3a69a5a415a782b3d3957eb6a6e2cf.png?v=1725615609",
    "https://cdn.shopify.com/s/files/1/0819/2180/2539/files/d5e3da8f85f573efdce199ec82a4d339.png?v=1725615609",
    "https://cdn.shopify.com/s/files/1/0819/2180/2539/files/bb06f0e427774e502c118671609ad74e.png?v=1725615609",
    "https://cdn.shopify.com/s/files/1/0819/2180/2539/files/d675685d6b461878bda70c99f01abdc2.png?v=1725615610",
    "https://cdn.shopify.com/s/files/1/0819/2180/2539/files/42a19d2dbd7fc2af06709d73d61a2936.png?v=1725615610",
    "https://cdn.shopify.com/s/files/1/0819/2180/2539/files/ec5ad62d29cd2677dd3f124c6e938f32.png?v=1725615610",
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

        <div className="flex flex-col gap-6 items-center">
          {reviewImages.map((imgUrl, i) => (
            <div key={i} className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-md border border-zinc-200">
              <img src={imgUrl} alt={`Review ${i + 1}`} className="w-full h-auto object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
