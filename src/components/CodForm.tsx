import { useState } from "react";
import { CheckCircle2, Truck, ShieldCheck, Clock } from "lucide-react";
import { submitOrderFn } from "@/actions/submitOrder.server";
import { wilayas } from "@/lib/wilayas";
import { communesByWilaya } from "@/lib/communes";

export function CodForm({ productPriceAmount, productName, variantTitle }: { productPriceAmount?: string, productName?: string, variantTitle?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    wilaya: "",
    commune: "",
    shippingMethod: "home" as "home" | "stopdesk"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Name Validation (Letters and spaces only, at least 3 chars)
    const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]{3,}$/;
    if (!nameRegex.test(form.fullname.trim())) {
      setFormError("يرجى إدخال اسم حقيقي (يحتوي على أحرف فقط ولا يقل عن 3 أحرف).");
      return;
    }

    // 2. Phone Validation (Algerian mobile format: 05/06/07 followed by 8 digits)
    const phoneRegex = /^(05|06|07)[0-9]{8}$/;
    const phoneClean = form.phone.replace(/\s+/g, '');
    if (!phoneRegex.test(phoneClean)) {
      setFormError("يرجى إدخال رقم هاتف صحيح يتكون من 10 أرقام (مثال: 0555123456).");
      return;
    }

    // 3. Spam Prevention (Rate Limiting)
    const lastOrder = localStorage.getItem("thefive_last_order");
    if (lastOrder && Date.now() - parseInt(lastOrder) < 60000) {
      setFormError("لقد قمت بتقديم طلب للتو. يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedWilaya = wilayas.find(w => w.code === Number(form.wilaya));
      const wilayaName = selectedWilaya ? `${selectedWilaya.code} - ${selectedWilaya.nameAr}` : form.wilaya;

      const response = await submitOrderFn({
        data: {
          fullname: form.fullname,
          phone: form.phone,
          wilaya: wilayaName,
          commune: form.commune,
          address: form.shippingMethod === 'home' ? 'توصيل للمنزل' : 'الاستلام من المكتب',
          productPriceAmount,
          productName,
          variantTitle
        }
      });
      
      if (response.success) {
        localStorage.setItem("thefive_last_order", Date.now().toString());
        setSubmitted(true);
      } else {
        setFormError("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى");
      }
    } catch (err) {
      console.error(err);
      setFormError("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى");
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

  const inputClasses = "w-full px-4 py-3.5 bg-background border border-border rounded-lg text-foreground text-base focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none shadow-sm";
  const labelClasses = "block text-sm font-bold text-secondary mb-2 tracking-wide";

  return (
    <div className="bg-transparent font-arabic" id="checkout-form" dir="rtl">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secondary mb-3">معلومات التوصيل</h2>
        <p className="text-sm text-foreground/70 tracking-wide">الرجاء إدخال معلوماتك الشخصية لتوصيل طلبك</p>
      </div>
      
      {formError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm font-bold text-center">
          {formError}
        </div>
      )}

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

        {/* Shipping Method Selection */}
        <div>
          <label className={labelClasses}>طريقة التوصيل</label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <label className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${form.shippingMethod === 'home' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border text-foreground/70 hover:border-accent'}`}>
              <input type="radio" name="shippingMethod" value="home" checked={form.shippingMethod === 'home'} onChange={(e) => setForm({...form, shippingMethod: 'home'})} className="sr-only" />
              <span className="text-base font-bold mt-1">توصيل للمنزل</span>
            </label>
            <label className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${form.shippingMethod === 'stopdesk' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border text-foreground/70 hover:border-accent'}`}>
              <input type="radio" name="shippingMethod" value="stopdesk" checked={form.shippingMethod === 'stopdesk'} onChange={(e) => setForm({...form, shippingMethod: 'stopdesk'})} className="sr-only" />
              <span className="text-base font-bold mt-1">الاستلام من المكتب</span>
            </label>
          </div>
        </div>

        {/* Price Breakdown */}
        {productPriceAmount && (
          <div className="bg-background border border-border/50 rounded-xl p-5 mt-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-sm text-foreground/80">
              <span>سعر المنتج</span>
              <span className="font-serif dir-ltr">{Number(productPriceAmount).toLocaleString()} د.ج</span>
            </div>
            <div className="flex justify-between items-center text-sm text-foreground/80">
              <span>سعر التوصيل</span>
              <span className="font-serif dir-ltr">
                {form.wilaya ? (
                  `+ ${(form.shippingMethod === 'home' ? wilayas.find(w => w.code === Number(form.wilaya))?.home : wilayas.find(w => w.code === Number(form.wilaya))?.stop)?.toLocaleString()} د.ج`
                ) : (
                  "اختر الولاية"
                )}
              </span>
            </div>
            <div className="h-px bg-border/50 my-3"></div>
            <div className="flex justify-between items-center text-base font-bold text-secondary">
              <span>المجموع الكلي</span>
              <span className="font-serif dir-ltr text-lg text-primary">
                {form.wilaya ? (
                  `${(Number(productPriceAmount) + ((form.shippingMethod === 'home' ? wilayas.find(w => w.code === Number(form.wilaya))?.home : wilayas.find(w => w.code === Number(form.wilaya))?.stop) || 0)).toLocaleString()} د.ج`
                ) : (
                  `${Number(productPriceAmount).toLocaleString()} د.ج`
                )}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-secondary text-[#1D1D1D] hover:text-background py-4 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="text-base font-bold tracking-wider uppercase">أطلب الآن - الدفع عند الاستلام</span>
            )}
          </button>
        </div>
        
        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 pt-6 pb-6 text-secondary bg-background rounded-2xl border border-border/50 shadow-sm mt-8">
          <div className="flex flex-col items-center gap-2">
            <Truck className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-wider">توصيل سريع</span>
          </div>
          <div className="w-px h-8 bg-border/50"></div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-wider">دفع آمن</span>
          </div>
          <div className="w-px h-8 bg-border/50"></div>
          <div className="flex flex-col items-center gap-2">
            <Clock className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-wider">خدمة 24/7</span>
          </div>
        </div>
      </form>
    </div>
  );
}
