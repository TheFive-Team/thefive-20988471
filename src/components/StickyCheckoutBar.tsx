import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/shopify";
import type { ShopifyMoney } from "@/lib/shopify";

export function StickyCheckoutBar({ price }: { price?: ShopifyMoney }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past the form
      const formEl = document.getElementById("checkout-form");
      if (formEl) {
        const rect = formEl.getBoundingClientRect();
        // If the form is above the viewport (scrolled past it)
        setIsVisible(rect.bottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
          className="flex-1 bg-zinc-900 text-white font-bold py-4 px-6 text-sm tracking-widest hover:bg-zinc-800 transition-colors uppercase"
        >
          اطلب الآن - الدفع عند الاستلام
        </button>
      </div>
    </div>
  );
}
