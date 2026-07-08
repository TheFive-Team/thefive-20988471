import { Star, ChevronRight, Check } from "lucide-react";

export function ProductHero() {
  const scrollToCheckout = () => {
    document.getElementById("checkout-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Product Images */}
        <div className="relative rounded-2xl overflow-hidden bg-zinc-100 aspect-[4/5] shadow-lg group">
          <img 
            src="/lux-product.png" 
            alt="Vetement Lux - Premium Black Jacket"
            width={800}
            height={1000}
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
            Limited Edition
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-500">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-zinc-500">(128 Reviews)</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight">Vetement Lux</h1>
            <p className="text-lg text-zinc-500">The Ultimate Premium Jacket</p>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-zinc-900">$129.00</span>
            <span className="text-xl text-zinc-400 line-through mb-1">$250.00</span>
            <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded mb-1">Save 48%</span>
          </div>

          <p className="text-zinc-600 leading-relaxed">
            Experience unparalleled comfort and style. Crafted with precision and premium materials, the Vetement Lux is designed for those who appreciate the finer things in life. Perfect for any occasion.
          </p>

          <ul className="space-y-3 pt-2">
            {[
              "Premium Italian Fabric",
              "Tailored Modern Fit",
              "Water-Resistant Coating",
              "Breathable & Lightweight"
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-zinc-700">
                <div className="bg-green-100 rounded-full p-1">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <div className="pt-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
              <span className="text-amber-800 font-medium text-sm">🔥 High Demand! Only 14 left in stock.</span>
            </div>
            
            <button 
              onClick={scrollToCheckout}
              className="w-full bg-zinc-900 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:bg-zinc-800 hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Order Now - Pay on Delivery <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
