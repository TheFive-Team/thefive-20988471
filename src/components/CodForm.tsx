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
  scarcityConfig,
  basePrice,
  comparePrice
}: { 
  productName?: string;
  offers?: any[];
  variants?: any[];
  pricingConfig?: any;
  scarcityConfig?: any;
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

  const inputClasses = "w-full px-3 h-[46px] bg-[#FCFAF6] border border-[#DDD7CB] rounded-[10px] text-[#102A43] text-sm focus:ring-[3px] focus:ring-[#D7AE57]/15 focus:border-[#D7AE57] transition-all duration-300 outline-none shadow-none placeholder:text-[#B0B4BA]";
  const labelClasses = "block text-[12px] font-semibold text-[#20364B] mb-[5px] tracking-wide";

  return (
    <div className="bg-[#FFFDF8] rounded-[20px] shadow-[0_8px_24px_rgba(13,35,56,0.06)] border border-[#E8E0D2] p-[20px_16px] sm:p-6 font-arabic transition-all duration-500 w-full box-border overflow-hidden" id="checkout-form" dir="rtl">
      
      {formError && (
        <div className="mb-[22px] p-4 bg-[#B94A48]/10 border border-[#B94A48]/20 rounded-xl flex items-center gap-2 text-[#B94A48] text-xs sm:text-sm font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-0" onFocus={handleFormInteraction} onClick={handleFormInteraction}>
        
        {/* Section 1: Quantity */}
        <section className="animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-[10px]">
            <div className="flex flex-col">
              <h3 className="text-[17px] font-bold text-[#102A43] flex items-center gap-2.5">
                <span className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#102A43] text-[#D7AE57] font-serif text-[12px] pt-[1px]">1</span>
                الكمية
              </h3>
              <p className="text-[11px] sm:text-[12px] font-medium text-[#9A9A9A] mt-1 mr-8">اختر عدد القطع التي تحتاجها</p>
            </div>
            
            <div className="flex items-center gap-[14px]">
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-[36px] h-[36px] rounded-full bg-[#FFFFFF] border border-[#D8DDE3] flex items-center justify-center text-xl font-medium text-[#617080] hover:bg-slate-50 transition-all duration-300 active:scale-[0.98]">-</button>
              <span className="text-[18px] font-bold text-[#0B1F33] w-4 text-center">{quantity}</span>
              <button type="button" onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} className="w-[36px] h-[36px] rounded-full bg-[#102A43] text-[#D7AE57] flex items-center justify-center text-xl font-medium hover:bg-[#102A43]/90 transition-all duration-300 active:scale-[0.98]">+</button>
            </div>
          </div>
        </section>
        <div className="h-px bg-[#EEE8DE] my-[22px]"></div>

        {/* Section 2: Sizes */}
        {variants.length > 1 && (
          <>
            <section id="size-selector" className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col mb-[10px]">
                <h3 className="text-[17px] font-bold text-[#102A43] flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#102A43] text-[#D7AE57] font-serif text-[12px] pt-[1px]">2</span>
                  {quantity === 1 ? 'المقاس' : 'المقاسات'}
                  {sizeError && <span className="text-[#B94A48] normal-case font-bold text-[10px] mr-2 animate-pulse">* يرجى الاختيار</span>}
                </h3>
                <p className="text-[11px] sm:text-[12px] font-medium text-[#9A9A9A] mt-1 mr-8">اختر المقاس المناسب لكل قطعة</p>
              </div>
              
              <div className="space-y-4 pr-8">
                {Array.from({ length: quantity }).map((_, pieceIndex) => (
                  <div key={pieceIndex} className="flex flex-col gap-2 animate-in fade-in duration-300">
                    {quantity > 1 && (
                      <p className="font-bold text-[11px] text-[#9A9A9A] pr-1">القطعة {pieceIndex + 1}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v: any) => {
                        const isAvailable = isVariantAvailable(v.node, pieceIndex);
                        const isSelected = selectedSizes[pieceIndex] === v.node.id;
                        const qty = v.node.quantityAvailable ?? 10;
                        const showScarcity = scarcityConfig?.enableSizeScarcity && isAvailable && qty <= (scarcityConfig.sizeLowStockThreshold || 3) && qty > 0;
                        
                        return (
                          <div key={v.node.id} className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSizeForPiece(pieceIndex, v.node.id)}
                              disabled={!isAvailable && !isSelected}
                              className={`rounded-[9px] min-w-[42px] h-[38px] px-3 text-[13px] transition-all duration-300 font-bold ${
                                !isAvailable && !isSelected
                                  ? "opacity-35 border border-[#F2F2F2] bg-[#F2F2F2] text-[#A6A6A6] cursor-not-allowed line-through" 
                                  : isSelected
                                    ? "bg-[#D7AE57] text-[#0B1F33] border border-[#D7AE57]"
                                    : "border border-[#D9DEE5] text-[#243B53] hover:bg-[#FCFAF6] bg-[#FFFFFF] active:scale-[0.98]"
                              }`}
                            >
                               {v.node.title}
                            </button>
                            {showScarcity && (
                              <span className="text-[9px] font-bold text-[#D7AE57]">
                                {qty === 1 ? "آخر قطعة" : `متبقي ${qty}`}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <div className="h-px bg-[#EEE8DE] my-[22px]"></div>
          </>
        )}

        {/* Section 3: Customer Info */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col mb-[10px]">
            <h3 className="text-[17px] font-bold text-[#102A43] flex items-center gap-2.5">
              <span className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#102A43] text-[#D7AE57] font-serif text-[12px] pt-[1px]">
                 {variants.length > 1 ? '3' : '2'}
              </span>
              معلومات العميل
            </h3>
            <p className="text-[11px] sm:text-[12px] font-medium text-[#9A9A9A] mt-1 mr-8">سنستخدمها فقط لتأكيد الطلب</p>
          </div>
          
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-[10px] pr-8">
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
                   className={`${inputClasses} appearance-none pr-4`}
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
                   className={`${inputClasses} appearance-none pr-4 ${!form.wilaya ? 'bg-slate-50 opacity-70 cursor-not-allowed' : ''}`}
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
        <section id="shipping-method" className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="h-px bg-[#EEE8DE] my-[22px]"></div>
          <div className="flex flex-col mb-[10px]">
            <h3 className="text-[17px] font-bold text-[#102A43] flex items-center gap-2.5">
              <span className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#102A43] text-[#D7AE57] font-serif text-[12px] pt-[1px]">
                 {variants.length > 1 ? '4' : '3'}
              </span>
              طريقة التوصيل
              {shippingError && <span className="text-[#B94A48] normal-case font-bold text-[10px] mr-2 animate-pulse">* يرجى الاختيار</span>}
            </h3>
            <p className="text-[11px] sm:text-[12px] font-medium text-[#9A9A9A] mt-1 mr-8">اختر طريقة التوصيل المفضلة</p>
          </div>
          
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-[10px] pr-8">
            <label className={`relative flex items-center px-4 h-[52px] border rounded-[11px] cursor-pointer transition-all duration-300 min-w-0 ${form.shippingMethod === 'home' ? 'border-[#D7AE57] border-[1.5px] bg-[#FFF8E8]' : 'border-[#DDE2E7] hover:bg-slate-50 bg-[#FFFFFF]'}`}>
              <input type="radio" name="shippingMethod" value="home" checked={form.shippingMethod === 'home'} onChange={() => { setForm({...form, shippingMethod: 'home'}); setShippingError(false); }} className="sr-only" />
              <div className="flex items-center gap-3 w-full min-w-0">
                 <div className={`w-[14px] h-[14px] rounded-full border transition-colors duration-300 flex items-center justify-center shrink-0 ${form.shippingMethod === 'home' ? 'border-[#D7AE57] bg-[#D7AE57]' : 'border-[#DDE2E7] bg-white'}`}>
                    {form.shippingMethod === 'home' && <Check className="w-2.5 h-2.5 text-[#102A43]" strokeWidth={3} />}
                 </div>
                 <div className="flex flex-col min-w-0 overflow-hidden">
                    <span className={`text-[13px] font-semibold flex items-center gap-1.5 transition-colors duration-300 truncate ${form.shippingMethod === 'home' ? 'text-[#102A43]' : 'text-[#68737F]'}`}>
                       توصيل للمنزل
                    </span>
                 </div>
              </div>
            </label>

            <label className={`relative flex items-center px-4 h-[52px] border rounded-[11px] cursor-pointer transition-all duration-300 min-w-0 ${form.shippingMethod === 'stopdesk' ? 'border-[#D7AE57] border-[1.5px] bg-[#FFF8E8]' : 'border-[#DDE2E7] hover:bg-slate-50 bg-[#FFFFFF]'}`}>
              <input type="radio" name="shippingMethod" value="stopdesk" checked={form.shippingMethod === 'stopdesk'} onChange={() => { setForm({...form, shippingMethod: 'stopdesk'}); setShippingError(false); }} className="sr-only" />
              <div className="flex items-center gap-3 w-full min-w-0">
                 <div className={`w-[14px] h-[14px] rounded-full border transition-colors duration-300 flex items-center justify-center shrink-0 ${form.shippingMethod === 'stopdesk' ? 'border-[#D7AE57] bg-[#D7AE57]' : 'border-[#DDE2E7] bg-white'}`}>
                    {form.shippingMethod === 'stopdesk' && <Check className="w-2.5 h-2.5 text-[#102A43]" strokeWidth={3} />}
                 </div>
                 <div className="flex flex-col min-w-0 overflow-hidden">
                    <span className={`text-[13px] font-semibold flex items-center gap-1.5 transition-colors duration-300 truncate ${form.shippingMethod === 'stopdesk' ? 'text-[#102A43]' : 'text-[#68737F]'}`}>
                       استلام من المكتب
                    </span>
                 </div>
              </div>
            </label>
          </div>
        </section>

        {/* Section 5: Order Summary */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-500 bg-[#FBF8F2] border border-[#E8E0D2] rounded-[14px] p-[14px] mt-4">
          <div className="flex flex-col mb-[10px]">
            <h3 className="text-[17px] font-bold text-[#102A43] flex items-center gap-2.5">
              <span className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#102A43] text-[#D7AE57] font-serif text-[12px] pt-[1px]">
                 {variants.length > 1 ? '5' : '4'}
              </span>
              ملخص الطلب
            </h3>
          </div>
          
          <div className="space-y-0">
             <div className="flex justify-between items-center h-[28px] text-[12px] font-semibold text-[#68737F]">
               <span>الكمية</span>
               <span className="text-[#102A43] font-bold">{quantity}</span>
             </div>

             {variants.length > 1 && selectedSizes.some(s => s !== "") && (
               <div className="flex justify-between items-center h-[28px] text-[12px] font-semibold text-[#68737F]">
                 <span>المقاسات</span>
                 <span className="text-[#102A43] font-bold dir-ltr">
                   {selectedSizes.map(id => variants.find((v: any) => v.node.id === id)?.node.title || "").filter(Boolean).join(" • ")}
                 </span>
               </div>
             )}

             <div className="flex justify-between items-center h-[28px] text-[12px] font-semibold text-[#68737F]">
               <span>المنتجات</span>
               <span className="font-sans font-bold tracking-tight dir-ltr text-[#102A43]">
                 {discountAmount > 0 ? (
                   <>
                     <span className="line-through text-[#9A9A9A] mr-2 font-medium">{subtotal.toLocaleString()} د.ج</span>
                     <span>{(subtotal - discountAmount).toLocaleString()} د.ج</span>
                   </>
                 ) : (
                   <span>{subtotal.toLocaleString()} د.ج</span>
                 )}
               </span>
             </div>

             <div className="flex justify-between items-center h-[28px] text-[12px] font-semibold text-[#68737F]">
               <span>التوصيل</span>
               <span className="font-sans font-bold tracking-tight dir-ltr text-[#102A43]">
                 {form.wilaya && form.shippingMethod ? (
                   `${(form.shippingMethod === 'home' ? selectedWilayaObj?.home : selectedWilayaObj?.stop)?.toLocaleString()} د.ج`
                 ) : (
                   "يحدد لاحقاً"
                 )}
               </span>
             </div>
             
             <div className="h-px bg-[#E4DAC7] my-[10px]"></div>
             
             <div className="flex justify-between items-center mt-2">
               <span className="text-[16px] font-bold text-[#102A43]">المجموع الكلي</span>
               <span className="font-sans tracking-tight dir-ltr text-[#C99B37] text-[25px] font-extrabold leading-none">
                 {form.wilaya && form.shippingMethod ? (
                   `${(finalProductTotal + ((form.shippingMethod === 'home' ? selectedWilayaObj?.home : selectedWilayaObj?.stop) || 0)).toLocaleString()} د.ج`
                 ) : (
                   `${finalProductTotal.toLocaleString()} د.ج`
                 )}
               </span>
             </div>
          </div>
        </section>

        {/* Trust Badges */}
        <div className="flex justify-center gap-4 pt-5 pb-3">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D7AE57]" strokeWidth={3} />
            <span className="text-[11px] font-bold text-[#102A43]">الدفع عند الاستلام</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D7AE57]" strokeWidth={3} />
            <span className="text-[11px] font-bold text-[#102A43]">توصيل سريع</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D7AE57]" strokeWidth={3} />
            <span className="text-[11px] font-bold text-[#102A43]">استبدال متاح</span>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#102A43] text-[#F2C75C] h-[52px] rounded-[12px] shadow-[0_8px_18px_rgba(16,42,67,0.18)] transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.985]"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-[#F2C75C]/30 border-t-[#F2C75C] rounded-full animate-spin"></span>
            ) : (
              <span className="text-[15px] font-bold tracking-wide">اطلب الآن · الدفع عند الاستلام</span>
            )}
          </button>
          <div className="mt-3.5 w-full">
             <div className="flex items-center justify-center gap-[8px] bg-[#F9F6EF] border border-[#E9DDC8] rounded-full py-[8px] px-[12px] w-full max-w-none shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
               <ShieldCheck className="w-[18px] h-[18px] text-[#C9A34A] shrink-0" strokeWidth={1.8} />
               <span className="text-[14px] font-semibold text-[#102A43] leading-[1.3] max-[339px]:whitespace-normal whitespace-nowrap">
                 الاستبدال والإرجاع متاح لضمان تجربة تسوق مريحة.
               </span>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
}
