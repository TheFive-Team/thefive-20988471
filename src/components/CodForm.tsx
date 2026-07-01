import { useState } from "react";
import { CheckCircle2, Truck, ShieldCheck, Clock } from "lucide-react";
import { submitOrderFn } from "@/actions/submitOrder.server";
import { wilayas } from "@/lib/wilayas";
import { communesByWilaya } from "@/lib/communes";

export function CodForm({ productPriceAmount }: { productPriceAmount?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    wilaya: "",
    commune: "",
    address: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await submitOrderFn({
        data: {
          ...form,
          productPriceAmount
        }
      });
      
      if (response.success) {
        setSubmitted(true);
      } else {
        alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-transparent p-6 flex flex-col items-center text-center animate-in fade-in duration-700">
        <CheckCircle2 className="w-16 h-16 text-zinc-900 mb-6" strokeWidth={1} />
        <h3 className="text-3xl font-serif text-zinc-900 mb-3 tracking-wide" dir="rtl">تم تأكيد طلبك بنجاح</h3>
        <p className="text-zinc-600 mb-8 max-w-sm leading-relaxed" dir="rtl">
          شكراً لثقتك بنا. سيقوم أحد ممثلي خدمة العملاء بالاتصال بك قريباً لتأكيد موعد التوصيل.
        </p>
      </div>
    );
  }

  const inputClasses = "w-full px-4 py-3.5 bg-white border border-zinc-300 rounded-md text-zinc-900 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none";
  const labelClasses = "block text-xs font-bold text-zinc-700 mb-2 tracking-wide";

  return (
    <div className="bg-transparent" id="checkout-form" dir="rtl">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">معلومات التوصيل</h2>
        <p className="text-xs text-zinc-500 tracking-wide">الرجاء إدخال معلوماتك الشخصية لتوصيل طلبك</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Input: Name */}
        <div>
          <label htmlFor="fullname" className={labelClasses}>الاسم الكامل</label>
          <input 
            type="text" 
            id="fullname"
            required
            value={form.fullname}
            onChange={(e) => setForm({ ...form, fullname: e.target.value })}
            className={inputClasses}
            placeholder="أدخل اسمك الكامل"
          />
        </div>
        
        {/* Input: Phone */}
        <div>
          <label htmlFor="phone" className={labelClasses}>رقم الهاتف</label>
          <input 
            type="tel" 
            id="phone"
            required
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={`${inputClasses} text-right placeholder:text-right`}
            placeholder="05XX XX XX XX"
          />
        </div>
        
        {/* Grid: Wilaya & Commune */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="wilaya" className={labelClasses}>الولاية</label>
            <select
              id="wilaya"
              required
              value={form.wilaya}
              onChange={(e) => setForm({ ...form, wilaya: e.target.value, commune: "" })}
              className={inputClasses}
            >
              <option value="" disabled>اختر الولاية</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.nameAr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="commune" className={labelClasses}>البلدية</label>
            <select
              id="commune"
              required
              disabled={!form.wilaya}
              value={form.commune}
              onChange={(e) => setForm({ ...form, commune: e.target.value })}
              className={`${inputClasses} ${!form.wilaya ? 'bg-zinc-100 opacity-70 cursor-not-allowed' : ''}`}
            >
              <option value="" disabled>اختر البلدية</option>
              {form.wilaya && (communesByWilaya[Number(form.wilaya)] ?? []).map((c, i) => (
                <option key={i} value={c.ar}>
                  {c.ar}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input: Address */}
        <div>
          <label htmlFor="address" className={labelClasses}>العنوان الكامل (اختياري)</label>
          <input
            type="text"
            id="address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={inputClasses}
            placeholder="الحي، الشارع، أو رقم المنزل"
          />
        </div>

        {/* Price Breakdown */}
        {productPriceAmount && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4 mt-2 space-y-2">
            <div className="flex justify-between items-center text-sm text-zinc-600">
              <span>سعر المنتج</span>
              <span className="font-serif dir-ltr">{Number(productPriceAmount).toLocaleString()} د.ج</span>
            </div>
            <div className="flex justify-between items-center text-sm text-zinc-600">
              <span>سعر التوصيل</span>
              <span className="font-serif dir-ltr">
                {form.wilaya ? (
                  `+ ${wilayas.find(w => w.code === Number(form.wilaya))?.home.toLocaleString()} د.ج`
                ) : (
                  "اختر الولاية"
                )}
              </span>
            </div>
            <div className="h-px bg-zinc-200 my-2"></div>
            <div className="flex justify-between items-center text-base font-bold text-zinc-900">
              <span>المجموع الكلي</span>
              <span className="font-serif dir-ltr text-lg text-accent">
                {form.wilaya ? (
                  `${(Number(productPriceAmount) + (wilayas.find(w => w.code === Number(form.wilaya))?.home || 0)).toLocaleString()} د.ج`
                ) : (
                  `${Number(productPriceAmount).toLocaleString()} د.ج`
                )}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-4 px-6 rounded-md shadow-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="text-sm font-bold tracking-wider uppercase">أطلب الآن - الدفع عند الاستلام</span>
            )}
          </button>
        </div>
        
        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 pt-4 pb-2 text-zinc-500">
          <div className="flex flex-col items-center gap-1.5">
            <Truck className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[9px] font-bold uppercase tracking-wider">توصيل سريع</span>
          </div>
          <div className="w-px h-6 bg-zinc-300"></div>
          <div className="flex flex-col items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[9px] font-bold uppercase tracking-wider">دفع آمن</span>
          </div>
          <div className="w-px h-6 bg-zinc-300"></div>
          <div className="flex flex-col items-center gap-1.5">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[9px] font-bold uppercase tracking-wider">خدمة 24/7</span>
          </div>
        </div>
      </form>
    </div>
  );
}
