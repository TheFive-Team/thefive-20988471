import { Star } from "lucide-react";

export function Reviews() {
  // TODO: Replace these placeholder image URLs with your actual GemPages review pictures URLs
  const reviewImages = [
    "https://placehold.co/600x400/eeeeee/999999?text=Review+Image+1",
    "https://placehold.co/600x400/eeeeee/999999?text=Review+Image+2",
    "https://placehold.co/600x400/eeeeee/999999?text=Review+Image+3",
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
