import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/shopify";
import type { ShopifyMoney } from "@/lib/shopify";

export function StickyCheckoutBar({ price }: { price?: ShopifyMoney }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const formEl = document.getElementById("checkout-form");
    if (!formEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar only if we have scrolled past the form (form is completely above viewport)
        setIsVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      },
      { threshold: 0 }
    );

    observer.observe(formEl);
    return () => observer.disconnect();
  }, []);

  const scrollToCheckout = () => {
    document.getElementById("checkout-form")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-full md:hidden">
      <div className="flex items-center justify-between p-3 gap-4">
        {price && (
          <div className="hidden shrink-0">
            {/* Kept hidden for ultra-minimal look, but available if needed */}
            <p className="text-lg font-serif">{formatMoney(price)}</p>
          </div>
        )}
        <button 
          onClick={scrollToCheckout}
          className="flex-1 font-arabic bg-primary text-[#1D1D1D] font-bold py-4 px-6 text-base tracking-widest hover:bg-secondary hover:text-background transition-all duration-300 uppercase rounded-2xl shadow-lg shadow-primary/20"
        >
          اطلب الآن - الدفع عند الاستلام
        </button>
      </div>
    </div>
  );
}
