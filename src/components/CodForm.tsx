import { useState, useEffect, useRef, useMemo } from "react";
import { CheckCircle2, Truck, ShieldCheck, Clock, RefreshCw, Check, MapPin, Building2, AlertCircle } from "lucide-react";
import { submitOrderFn } from "@/actions/submitOrder.server";
import { wilayas } from "@/lib/wilayas";
import { communesByWilaya } from "@/lib/communes";
import { trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";
import { formatMoney } from "@/lib/shopify";
import ZR_OFFICES from "@/lib/zr_offices.json";

const normalizeStr = (str: string) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, "") : "";

export function CodForm({ 
  productName, 
  offers = [],
  variants = [],
  pricingConfig,
  basePrice,
  comparePrice
}: { 
  productName?: string;
  offers?: any[];
  variants?: any[];
  pricingConfig?: any;
  basePrice?: string;
  comparePrice?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // 1. Quantity State
  const maxQty = pricingConfig?.maxQuantity || 10;
  const [quantity, setQuantity] = useState(1);

  // 2. Size State
  const [selectedSizes, setSelectedSizes] = useState<string[]>([""]);
  const [sizeError, setSizeError] = useState(false);
  
  useEffect(() => {
    setSelectedSizes(Array(quantity).fill(""));
    setSizeError(false);
  }, [quantity]);

  // Pricing Logic
  const basePriceNum = Number(basePrice || 0);
  const subtotal = basePriceNum * quantity;
  let discountAmount = 0;
  if (pricingConfig?.enabled && quantity >= pricingConfig.quantityRequired) {
    if (pricingConfig.discountType === "fixed") {
      discountAmount = Number(pricingConfig.discountValue || 0);
    } else if (pricingConfig.discountType === "percentage") {
      discountAmount = (subtotal * Number(pricingConfig.discountValue || 0)) / 100;
    }
  }
  const finalProductTotal = subtotal - discountAmount;

  const setSizeForPiece = (index: number, variantId: string) => {
    const newSizes = [...selectedSizes];
    newSizes[index] = variantId;
    setSelectedSizes(newSizes);
    setSizeError(false);
  };

  const isVariantAvailable = (variant: any, pieceIndex: number) => {
    const stock = variant.quantityAvailable ?? 0;
    if (!variant.availableForSale || stock <= 0) return false;
    const selectedCount = selectedSizes.reduce((count, id, i) => {
      if (i !== pieceIndex && id === variant.id) return count + 1;
      return count;
    }, 0);
    return stock > selectedCount;
  };

  // 3. Customer Info State
  const [shippingError, setShippingError] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    wilaya: "",
    commune: "",
    shippingMethod: "" as "" | "home" | "stopdesk"
  });

  const selectedWilayaObj = form.wilaya ? wilayas.find(w => w.code === Number(form.wilaya)) : null;

  const checkoutInitiated = useRef(false);

  // Meta Pixel - InitiateCheckout
  const handleFormInteraction = () => {
    if (!checkoutInitiated.current && productName) {
      checkoutInitiated.current = true;
      trackInitiateCheckout({
        productName: productName,
        productId: "default",
        price: basePriceNum,
        currency: 'DZD'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]{3,}$/;
    if (!nameRegex.test(form.fullname.trim())) {
      setFormError("يرجى إدخال اسم حقيقي (يحتوي على أحرف فقط ولا يقل عن 3 أحرف).");
      return;
    }

    const phoneRegex = /^(05|06|07)[0-9]{8}$/;
    const phoneClean = form.phone.replace(/\s+/g, '');
    if (!phoneRegex.test(phoneClean)) {
      setFormError("يرجى إدخال رقم هاتف صحيح يتكون من 10 أرقام (مثال: 0555123456).");
      return;
    }

    const lastOrder = localStorage.getItem("thefive_last_order");
    if (lastOrder && Date.now() - parseInt(lastOrder) < 60000) {
      setFormError("لقد قمت بتقديم طلب للتو. يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.");
      return;
    }

    const requireSize = variants.length > 1 && selectedSizes.some(s => s === "");
    if (requireSize) {
      setSizeError(true);
      setFormError("يرجى اختيار المقاس لتأكيد الطلب");
      document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!form.shippingMethod) {
      setShippingError(true);
      setFormError("يرجى اختيار طريقة التوصيل لتأكيد الطلب");
      document.getElementById("shipping-method")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    


    setIsSubmitting(true);
    
    try {
      const wilayaName = selectedWilayaObj ? `${selectedWilayaObj.code} - ${selectedWilayaObj.nameAr}` : form.wilaya;
      const calculatedDeliveryFee = form.shippingMethod === 'home' ? selectedWilayaObj?.home : selectedWilayaObj?.stop;
      
      const eventId = crypto.randomUUID ? crypto.randomUUID() : `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const finalDeliveryType = form.shippingMethod === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب (Stop Desk)';

      const response = await submitOrderFn({
        data: {
          fullname: form.fullname,
          phone: form.phone,
          wilaya: wilayaName,
          commune: form.commune,
          address: "",
          deliveryType: finalDeliveryType,
          deliveryFee: calculatedDeliveryFee,
          productName,
          offerId: "quantity-selector",
          offerTitle: `${quantity} ${quantity === 1 ? 'قطعة' : 'قطع'}`,
          offerPieces: quantity,
          offerPrice: finalProductTotal, // Send final product total as offerPrice for legacy compatibility
          quantity: quantity,
          discountAmount: discountAmount,
          finalProductTotal: finalProductTotal,
          finalTotal: finalProductTotal + (calculatedDeliveryFee || 0),
          selectedSizes: selectedSizes.map(id => variants.find((v: any) => v.node.id === id)?.node.title || ""),
          eventId,
          clientUserAgent: navigator.userAgent,
          eventSourceUrl: window.location.href
        }
      });
      
      if (response.success) {
        localStorage.setItem("thefive_last_order", Date.now().toString());
        setSubmitted(true);
        trackPurchase({
          productName: productName || "Produit inconnu",
          productId: "default",
          value: finalProductTotal + (calculatedDeliveryFee || 0),
          currency: 'DZD',
          eventId
        });
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

  const inputClasses = "w-full px-3 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-1 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all outline-none shadow-sm";
  const labelClasses = "block text-xs sm:text-sm font-bold text-slate-600 mb-1.5 tracking-wide";
  const sectionTitleClasses = "text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2 mb-3";

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-4 sm:p-6 font-arabic" id="checkout-form" dir="rtl">
      {/* Header */}
      <div className="text-center mb-5 pb-4 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-[#1A2530] mb-1">أكمل طلبك الآن</h2>
        <p className="text-xs sm:text-sm text-slate-500">الرجاء إدخال معلوماتك لتأكيد الطلب</p>
      </div>
      
      {formError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs sm:text-sm font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" onFocus={handleFormInteraction} onClick={handleFormInteraction}>
        
        {/* Section 1: Quantity */}
        <section className="border-b border-slate-100 pb-5">
          <h3 className={sectionTitleClasses}>
            <span className="bg-[#1A2530] text-[#D4AF37] w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
            الكمية
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors active:scale-95">-</button>
            <span className="text-xl font-bold text-slate-800 w-8 text-center">{quantity}</span>
            <button type="button" onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} className="w-10 h-10 rounded-full bg-[#1A2530] text-[#D4AF37] flex items-center justify-center text-xl font-bold hover:bg-[#1A2530]/90 transition-colors active:scale-95">+</button>
          </div>
        </section>

        {/* Section 2: Sizes */}
        {variants.length > 1 && (
          <section id="size-selector" className="border-b border-slate-100 pb-5">
            <h3 className={sectionTitleClasses}>
              <span className="bg-[#1A2530] text-[#D4AF37] w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
              {quantity === 1 ? 'المقاس' : 'المقاسات'}
              {sizeError && <span className="text-red-500 normal-case font-bold text-[10px] ml-2 animate-pulse text-right w-full flex-1">* يرجى الاختيار</span>}
            </h3>
            
            <div className="space-y-3 mt-2">
              {Array.from({ length: quantity }).map((_, pieceIndex) => (
                <div key={pieceIndex} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                  {quantity > 1 && (
                    <p className="font-bold text-xs text-slate-500 min-w-[3.5rem]">القطعة {pieceIndex + 1}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v: any) => {
                      const isAvailable = isVariantAvailable(v.node, pieceIndex);
                      const isSelected = selectedSizes[pieceIndex] === v.node.id;
                      return (
                        <button
                          type="button"
                          key={v.node.id}
                          onClick={() => setSizeForPiece(pieceIndex, v.node.id)}
                          disabled={!isAvailable && !isSelected}
                          className={`rounded-lg min-w-[2.5rem] h-10 px-3 text-sm transition-all font-bold ${
                            !isAvailable && !isSelected
                              ? "opacity-40 border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed line-through" 
                              : isSelected
                                ? "bg-[#D4AF37] text-[#1A2530]"
                                : "border border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                          }`}
                        >
                           {v.node.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Customer Info */}
        <section className="border-b border-slate-100 pb-5">
          <h3 className={sectionTitleClasses}>
            <span className="bg-[#1A2530] text-[#D4AF37] w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
               {variants.length > 1 ? '3' : '2'}
            </span>
            معلومات العميل
          </h3>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label htmlFor="fullname" className={labelClasses}>الاسم الكامل</label>
              <input 
                type="text" id="fullname" required
                value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                className={inputClasses} placeholder="الاسم واللقب"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className={labelClasses}>رقم الهاتف</label>
              <input 
                type="tel" id="phone" required dir="ltr"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`${inputClasses} text-right placeholder:text-right`} placeholder="05XX XX XX XX"
              />
            </div>
            
            <div>
              <label htmlFor="wilaya" className={labelClasses}>الولاية</label>
              <div className="relative">
                 <select
                   id="wilaya" required
                   value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: e.target.value, commune: "" })}
                   className={`${inputClasses} appearance-none pr-8`}
                 >
                   <option value="" disabled>اختر الولاية</option>
                   {wilayas.map((w) => (
                     <option key={w.code} value={w.code}>{w.code} - {w.nameAr}</option>
                   ))}
                 </select>
              </div>
            </div>

            <div>
              <label htmlFor="commune" className={labelClasses}>البلدية</label>
              <div className="relative">
                 <select
                   id="commune" required disabled={!form.wilaya}
                   value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })}
                   className={`${inputClasses} appearance-none pr-8 ${!form.wilaya ? 'bg-slate-50 opacity-70 cursor-not-allowed' : ''}`}
                 >
                   <option value="" disabled>اختر البلدية</option>
                   {form.wilaya && (communesByWilaya[Number(form.wilaya)] ?? []).map((c, i) => (
                     <option key={i} value={c.ar}>{c.ar}</option>
                   ))}
                 </select>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Delivery */}
        <section id="shipping-method" className="pb-1">
          <h3 className={sectionTitleClasses}>
            <span className="bg-[#1A2530] text-[#D4AF37] w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
               {variants.length > 1 ? '4' : '3'}
            </span>
            التوصيل
            {shippingError && <span className="text-red-500 normal-case font-bold text-[10px] ml-2 animate-pulse">* يرجى الاختيار</span>}
          </h3>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            <label className={`relative flex items-center px-3 py-3 border rounded-xl cursor-pointer transition-all ${form.shippingMethod === 'home' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
              <input type="radio" name="shippingMethod" value="home" checked={form.shippingMethod === 'home'} onChange={() => { setForm({...form, shippingMethod: 'home'}); setShippingError(false); }} className="sr-only" />
              <div className="flex items-center gap-2.5">
                 <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${form.shippingMethod === 'home' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-slate-300 bg-white'}`}>
                    {form.shippingMethod === 'home' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                       <Truck className="w-3.5 h-3.5 text-slate-500" />
                       للمنزل
                    </span>
                 </div>
              </div>
            </label>

            <label className={`relative flex items-center px-3 py-3 border rounded-xl cursor-pointer transition-all ${form.shippingMethod === 'stopdesk' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
              <input type="radio" name="shippingMethod" value="stopdesk" checked={form.shippingMethod === 'stopdesk'} onChange={() => { setForm({...form, shippingMethod: 'stopdesk'}); setShippingError(false); }} className="sr-only" />
              <div className="flex items-center gap-2.5">
                 <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${form.shippingMethod === 'stopdesk' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-slate-300 bg-white'}`}>
                    {form.shippingMethod === 'stopdesk' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                       <Building2 className="w-3.5 h-3.5 text-slate-500" />
                       للمكتب
                    </span>
                 </div>
              </div>
            </label>
          </div>
        </section>

        {/* Section 5: Order Summary */}
        <section className="bg-[#FAF9F6] border border-slate-200 rounded-xl p-4 mt-2">
          <div className="space-y-2.5 text-sm">
             <div className="flex justify-between items-center font-bold text-slate-600">
               <span>الكمية</span>
               <span className="text-slate-800">{quantity}</span>
             </div>
             
             {variants.length > 1 && selectedSizes.some(s => s !== "") && (
                <div className="flex justify-between items-center font-bold text-slate-600">
                  <span>المقاسات</span>
                  <span className="text-left dir-ltr text-slate-800">
                     {selectedSizes.map((id, index) => variants.find((v: any) => v.node.id === id)?.node.title || "").filter(Boolean).join("، ")}
                  </span>
                </div>
             )}

             <div className="flex justify-between items-center font-bold text-slate-600">
               <span>سعر المنتجات</span>
               <span className="font-sans tracking-tight dir-ltr text-slate-800">
                 {discountAmount > 0 ? (
                   <span className="line-through text-slate-400 ml-1.5">{subtotal.toLocaleString()} د.ج</span>
                 ) : (
                   <span>{subtotal.toLocaleString()} د.ج</span>
                 )}
               </span>
             </div>

             {discountAmount > 0 && (
                <div className="flex justify-between items-center font-bold text-green-600">
                  <span className="flex items-center gap-1.5">التخفيض {pricingConfig?.badgeText && <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded">{pricingConfig.badgeText}</span>}</span>
                  <span className="font-sans tracking-tight dir-ltr">-{discountAmount.toLocaleString()} د.ج</span>
                </div>
             )}

             <div className="flex justify-between items-center font-bold text-slate-600">
               <span>سعر التوصيل</span>
               <span className="font-sans tracking-tight dir-ltr text-slate-800">
                 {form.wilaya ? (
                   form.shippingMethod ? (
                     `${(form.shippingMethod === 'home' ? selectedWilayaObj?.home : selectedWilayaObj?.stop)?.toLocaleString()} د.ج`
                   ) : (
                     "قيد الحساب"
                   )
                 ) : (
                   "اختر الولاية"
                 )}
               </span>
             </div>
             
             <div className="h-px bg-slate-200/80 my-3"></div>
             
             <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
               <span className="text-[#1A2530]">المجموع الكلي</span>
               <span className="font-sans font-bold tracking-tight dir-ltr text-[#D4AF37]">
                 {form.wilaya && form.shippingMethod ? (
                   `${(finalProductTotal + ((form.shippingMethod === 'home' ? selectedWilayaObj?.home : selectedWilayaObj?.stop) || 0)).toLocaleString()} د.ج`
                 ) : (
                   `${finalProductTotal.toLocaleString()} د.ج`
                 )}
               </span>
             </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="pt-1">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1A2530] hover:bg-[#1A2530]/90 text-[#D4AF37] h-[52px] sm:h-[54px] rounded-xl shadow-[0_4px_14px_0_rgba(26,37,48,0.2)] transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></span>
            ) : (
              <span className="text-base sm:text-lg font-bold tracking-wide">اطلب الآن · الدفع عند الاستلام</span>
            )}
          </button>
        </div>
        
        {/* Trust Badges */}
        <div className="flex justify-around items-center pt-2 text-slate-500 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={2.5} />
            <span className="text-[10px] sm:text-xs font-bold tracking-wide">توصيل سريع</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={2.5} />
            <span className="text-[10px] sm:text-xs font-bold tracking-wide">دفع آمن</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={2.5} />
            <span className="text-[10px] sm:text-xs font-bold tracking-wide">استبدال مجاني</span>
          </div>
        </div>
      </form>
    </div>
  );
}
