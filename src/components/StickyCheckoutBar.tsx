import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

export function StickyCheckoutBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling down 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
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
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 animate-in slide-in-from-bottom-full md:hidden">
      <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
        <div>
          <p className="text-xs text-zinc-500 font-medium">Limited Offer</p>
          <p className="text-lg font-bold text-zinc-900">$129.00</p>
        </div>
        <button 
          onClick={scrollToCheckout}
          className="flex-1 bg-zinc-900 text-white font-semibold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" /> Buy Now
        </button>
      </div>
    </div>
  );
}
