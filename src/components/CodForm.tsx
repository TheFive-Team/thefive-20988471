import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function CodForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to Shopify API or a webhook
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-2xl font-bold text-green-900 mb-2">Order Confirmed!</h3>
        <p className="text-green-800">
          Thank you for your purchase. We will contact you shortly to arrange your Cash on Delivery.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden" id="checkout-form">
      <div className="bg-zinc-900 px-6 py-4">
        <h3 className="text-xl font-semibold text-white">Complete Your Order</h3>
        <p className="text-zinc-400 text-sm">Pay in cash when you receive the product.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700">Full Name</label>
          <input 
            type="text" 
            id="name"
            required
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
            placeholder="John Doe"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-zinc-700">Phone Number</label>
          <input 
            type="tel" 
            id="phone"
            required
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
            placeholder="+1 (555) 000-0000"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium text-zinc-700">Delivery Address</label>
          <textarea 
            id="address"
            required
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none"
            placeholder="123 Main St, City, Country"
          />
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] text-lg flex items-center justify-center gap-2"
          >
            Place Order (Cash on Delivery)
          </button>
          <p className="text-center text-xs text-zinc-500 mt-3 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Secure Checkout
          </p>
        </div>
      </form>
    </div>
  );
}
