import { useState } from "react";
import { CheckCircle2, Truck, ShieldCheck, Clock } from "lucide-react";

export function CodForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call for premium feel
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="bg-white border border-zinc-200 rounded-none p-10 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CheckCircle2 className="w-16 h-16 text-zinc-900 mb-6" strokeWidth={1} />
        <h3 className="text-3xl font-serif text-zinc-900 mb-3 tracking-wide" dir="rtl">تم تأكيد طلبك بنجاح</h3>
        <p className="text-zinc-500 mb-8 max-w-sm leading-relaxed" dir="rtl">
          شكراً لثقتك بنا. سيقوم أحد ممثلي خدمة العملاء بالاتصال بك قريباً لتأكيد موعد التوصيل.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="text-xs uppercase tracking-widest border-b border-zinc-900 pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors"
        >
          العودة للتسوق
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white" id="checkout-form" dir="rtl">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-serif text-zinc-900 mb-3">إتمام الطلب</h2>
        <p className="text-sm text-zinc-500 tracking-wide">الدفع عند الاستلام - بكل أمان وسهولة</p>
        <div className="w-12 h-[1px] bg-zinc-300 mx-auto mt-6"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Input: Name */}
        <div className="relative">
          <input 
            type="text" 
            id="name"
            required
            className="peer w-full px-0 py-4 bg-transparent border-0 border-b border-zinc-200 text-zinc-900 focus:ring-0 focus:border-zinc-900 placeholder-transparent transition-colors"
            placeholder="الاسم الكامل"
          />
          <label 
            htmlFor="name" 
            className="absolute right-0 -top-3.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-zinc-900"
          >
            الاسم الكامل
          </label>
        </div>
        
        {/* Input: Phone */}
        <div className="relative">
          <input 
            type="tel" 
            id="phone"
            required
            dir="ltr"
            className="peer w-full px-0 py-4 bg-transparent border-0 border-b border-zinc-200 text-zinc-900 text-right focus:ring-0 focus:border-zinc-900 placeholder-transparent transition-colors"
            placeholder="رقم الهاتف"
          />
          <label 
            htmlFor="phone" 
            className="absolute right-0 -top-3.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-zinc-900"
          >
            رقم الهاتف
          </label>
        </div>
        
        {/* Grid: Wilaya & Commune */}
        <div className="grid grid-cols-2 gap-6">
          <div className="relative">
            <input 
              type="text" 
              id="wilaya"
              required
              className="peer w-full px-0 py-4 bg-transparent border-0 border-b border-zinc-200 text-zinc-900 focus:ring-0 focus:border-zinc-900 placeholder-transparent transition-colors"
              placeholder="الولاية"
            />
            <label 
              htmlFor="wilaya" 
              className="absolute right-0 -top-3.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-zinc-900"
            >
              الولاية
            </label>
          </div>
          <div className="relative">
            <input 
              type="text" 
              id="commune"
              required
              className="peer w-full px-0 py-4 bg-transparent border-0 border-b border-zinc-200 text-zinc-900 focus:ring-0 focus:border-zinc-900 placeholder-transparent transition-colors"
              placeholder="البلدية"
            />
            <label 
              htmlFor="commune" 
              className="absolute right-0 -top-3.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-zinc-900"
            >
              البلدية
            </label>
          </div>
        </div>

        {/* Input: Address */}
        <div className="relative">
          <textarea 
            id="address"
            required
            rows={2}
            className="peer w-full px-0 py-4 bg-transparent border-0 border-b border-zinc-200 text-zinc-900 focus:ring-0 focus:border-zinc-900 placeholder-transparent transition-colors resize-none"
            placeholder="العنوان بالتفصيل"
          />
          <label 
            htmlFor="address" 
            className="absolute right-0 -top-3.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-400 peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-zinc-900"
          >
            العنوان بالتفصيل
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-8">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-5 px-6 tracking-widest transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="text-sm font-bold">تأكيد الطلب الآن</span>
            )}
          </button>
        </div>
        
        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 pt-6 text-zinc-400">
          <div className="flex flex-col items-center gap-2">
            <Truck className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] uppercase">توصيل سريع</span>
          </div>
          <div className="w-px h-8 bg-zinc-200"></div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] uppercase">دفع آمن عند الاستلام</span>
          </div>
          <div className="w-px h-8 bg-zinc-200"></div>
          <div className="flex flex-col items-center gap-2">
            <Clock className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] uppercase">خدمة 24/7</span>
          </div>
        </div>
      </form>
    </div>
  );
}
