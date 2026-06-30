import { Star } from "lucide-react";

export function Reviews() {
  const reviews = [
    {
      name: "Michael T.",
      date: "2 days ago",
      text: "Absolutely stunning quality. It fits perfectly and I've received so many compliments already. Highly recommend!",
      rating: 5,
    },
    {
      name: "David L.",
      date: "1 week ago",
      text: "The cash on delivery option was super convenient. The jacket arrived quickly and the material feels incredibly premium.",
      rating: 5,
    },
    {
      name: "James W.",
      date: "2 weeks ago",
      text: "Worth every penny. The minimalist design is exactly what I was looking for. Very happy with this purchase.",
      rating: 5,
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">Loved by our customers</h2>
          <div className="flex justify-center items-center gap-2 text-amber-500 mb-2">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <p className="text-zinc-500">4.9/5 based on 128 reviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <div className="flex text-amber-500 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-zinc-300'}`} />
                ))}
              </div>
              <h4 className="font-bold text-zinc-900 mb-1">{review.name}</h4>
              <p className="text-xs text-zinc-400 mb-3">{review.date} • Verified Buyer</p>
              <p className="text-zinc-600 text-sm leading-relaxed">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
