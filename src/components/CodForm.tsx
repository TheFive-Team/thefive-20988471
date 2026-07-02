import { useState, useEffect } from "react";
import { CheckCircle2, Truck, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { submitOrderFn } from "@/actions/submitOrder.server";
import { wilayas } from "@/lib/wilayas";
import { communesByWilaya } from "@/lib/communes";

export function CodForm({ productPriceAmount, productName, variantTitle, requireSize, onSizeError }: { productPriceAmount?: string, productName?: string, variantTitle?: string, requireSize?: boolean, onSizeError?: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [shippingError, setShippingError] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    wilaya: "",
    commune: "",
    shippingMethod: "" as "" | "home" | "stopdesk"
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

    // 4. Require Size
    if (requireSize) {
      if (onSizeError) onSizeError();
      setFormError("يرجى اختيار المقاس لتأكيد الطلب");
      document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // 5. Require Shipping Method
    if (!form.shippingMethod) {
      setShippingError(true);
      setFormError("يرجى اختيار طريقة التوصيل لتأكيد الطلب");
      document.getElementById("shipping-method")?.scrollIntoView({ behavior: "smooth", block: "center" });
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

  useEffect(() => {
    if (submitted) {
      setTimeout(() => {
        document.getElementById("thank-you-message")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [submitted]);

  if (submitted) {
    return (
      <div id="thank-you-message" className="py-12 sm:py-20 flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-700 w-full">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-gradient-to-tr from-green-500 to-emerald-400 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 text-white">
            <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={2.5} />
          </div>
        </div>
        <div className="bg-background border border-border/60 shadow-2xl shadow-foreground/5 rounded-3xl p-8 sm:p-10 max-w-xl w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400"></div>
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-5 tracking-tight leading-tight" dir="rtl">
            تم تأكيد طلبك بنجاح!
          </h3>
          <p className="text-foreground/80 leading-relaxed text-lg sm:text-xl font-medium" dir="rtl">
            شكراً لثقتك بنا. سيتواصل معك فريقنا قريباً لتأكيد الطلب وتحديد موعد التوصيل.
          </p>
        </div>
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
        <div id="shipping-method">
          <label className={`block text-sm font-bold mb-2 tracking-wide flex items-center gap-2 transition-colors ${shippingError ? 'text-red-600' : 'text-secondary'}`}>
            طريقة التوصيل {shippingError && <span className="text-red-500 normal-case font-bold text-sm animate-pulse">* يرجى الاختيار / Required</span>}
          </label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all font-bold ${form.shippingMethod === 'home' ? 'border-primary bg-primary/5 text-primary shadow-md scale-105' : 'border-foreground/30 text-foreground/80 hover:border-foreground/50 hover:bg-accent/20'}`}>
              <input type="radio" name="shippingMethod" value="home" checked={form.shippingMethod === 'home'} onChange={(e) => { setForm({...form, shippingMethod: 'home'}); setShippingError(false); }} className="sr-only" />
              <span className="text-base mt-1">توصيل للمنزل</span>
            </label>
            <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all font-bold ${form.shippingMethod === 'stopdesk' ? 'border-primary bg-primary/5 text-primary shadow-md scale-105' : 'border-foreground/30 text-foreground/80 hover:border-foreground/50 hover:bg-accent/20'}`}>
              <input type="radio" name="shippingMethod" value="stopdesk" checked={form.shippingMethod === 'stopdesk'} onChange={(e) => { setForm({...form, shippingMethod: 'stopdesk'}); setShippingError(false); }} className="sr-only" />
              <span className="text-base mt-1">الاستلام من المكتب</span>
            </label>
          </div>
        </div>

        {/* Price Breakdown */}
        {productPriceAmount && (
          <div className="bg-background border border-border/50 rounded-xl p-5 mt-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-base text-foreground/80">
              <span>سعر المنتج</span>
              <span className="font-sans font-semibold tracking-tight dir-ltr text-lg">{Number(productPriceAmount).toLocaleString()} د.ج</span>
            </div>
            <div className="flex justify-between items-center text-base text-foreground/80">
              <span>سعر التوصيل</span>
              <span className="font-sans font-semibold tracking-tight dir-ltr text-lg">
                {form.wilaya ? (
                  form.shippingMethod ? (
                    `+ ${(form.shippingMethod === 'home' ? wilayas.find(w => w.code === Number(form.wilaya))?.home : wilayas.find(w => w.code === Number(form.wilaya))?.stop)?.toLocaleString()} د.ج`
                  ) : (
                    "اختر طريقة التوصيل"
                  )
                ) : (
                  "اختر الولاية"
                )}
              </span>
            </div>
            <div className="h-px bg-border/50 my-3"></div>
            <div className="flex justify-between items-center text-lg font-bold text-secondary">
              <span>المجموع الكلي</span>
              <span className="font-sans font-bold tracking-tight dir-ltr text-2xl text-primary">
                {form.wilaya && form.shippingMethod ? (
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-2 py-6 text-secondary bg-background rounded-2xl border border-border/50 shadow-sm mt-8 px-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <Truck className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="text-xs font-bold tracking-wider">توصيل سريع</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <ShieldCheck className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="text-xs font-bold tracking-wider">دفع آمن</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <RefreshCw className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="text-xs font-bold tracking-wider">استبدال واسترجاع</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <Clock className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="text-xs font-bold tracking-wider">خدمة 24/7</span>
          </div>
        </div>
      </form>
    </div>
  );
}
