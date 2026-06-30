import { Star } from "lucide-react";

export function Reviews() {
  const reviews = [
    {
      name: "أحمد م.",
      date: "منذ يومين",
      text: "جودة مذهلة، التوصيل كان سريعاً والخامة ممتازة جداً. أنصح به بشدة!",
      rating: 5,
      img: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=400&q=80"
    },
    {
      name: "كريم ل.",
      date: "منذ أسبوع",
      text: "طريقة الدفع عند الاستلام مريحة جداً، والمنتج يطابق الصور تماماً.",
      rating: 5,
      img: "https://images.unsplash.com/photo-1550614000-4b95d415d183?w=400&q=80"
    },
    {
      name: "سمير و.",
      date: "منذ أسبوعين",
      text: "التصميم فخم والمقاس مضبوط. سأقوم بالشراء مرة أخرى بالتأكيد.",
      rating: 5,
      img: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&q=80"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">تقييمات عملائنا</h2>
          <div className="flex justify-center items-center gap-2 text-amber-500 mb-2">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <p className="text-zinc-500">4.9/5 بناءً على 128 تقييم</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col h-full">
              <div className="flex text-amber-500 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-zinc-300'}`} />
                ))}
              </div>
              <h4 className="font-bold text-zinc-900 mb-1">{review.name}</h4>
              <p className="text-xs text-zinc-400 mb-3" dir="rtl">{review.date} • مشتري مؤكد</p>
              <p className="text-zinc-600 text-sm leading-relaxed mb-4 flex-grow" dir="rtl">"{review.text}"</p>
              {review.img && (
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mt-auto">
                  <img src={review.img} alt={`Review from ${review.name}`} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
