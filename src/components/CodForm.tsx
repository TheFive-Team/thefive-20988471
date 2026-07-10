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
  variants = []
}: { 
  productName?: string;
  offers?: any[];
  variants?: any[];
}) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // 1. Offer State
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(offers[0]?.id || null);
  const selectedOffer = useMemo(() => offers.find((o: any) => o.id === selectedOfferId) || offers[0], [selectedOfferId, offers]);

  // 2. Size State
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeError, setSizeError] = useState(false);
  
  useEffect(() => {
    if (selectedOffer) {
      setSelectedSizes(Array(selectedOffer.pieces).fill(""));
      setSizeError(false);
    }
  }, [selectedOffer?.id, selectedOffer?.pieces]);

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
    address: "",
    note: "",
    zrDeskId: "",
    shippingMethod: "" as "" | "home" | "stopdesk"
  });

  const selectedWilayaObj = form.wilaya ? wilayas.find(w => w.code === Number(form.wilaya)) : null;
  const availableDesks = useMemo(() => {
    if (!selectedWilayaObj) return [];
    const targetVille = normalizeStr(selectedWilayaObj.name);
    return (ZR_OFFICES as any[]).filter((office: any) => normalizeStr(office.ville) === targetVille);
  }, [selectedWilayaObj]);

  const checkoutInitiated = useRef(false);

  // Meta Pixel - InitiateCheckout
  const handleFormInteraction = () => {
    if (!checkoutInitiated.current && productName && selectedOffer) {
      checkoutInitiated.current = true;
      trackInitiateCheckout({
        productName: productName,
        productId: selectedOffer.id,
        price: Number(selectedOffer.price || 0),
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
    
    if (form.shippingMethod === 'stopdesk' && availableDesks.length > 0 && !form.zrDeskId) {
       setFormError("يرجى اختيار مكتب التوصيل لتأكيد الطلب");
       document.getElementById("zr-desk-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
       return;
    }

    setIsSubmitting(true);
    
    try {
      const wilayaName = selectedWilayaObj ? `${selectedWilayaObj.code} - ${selectedWilayaObj.nameAr}` : form.wilaya;
      const calculatedDeliveryFee = form.shippingMethod === 'home' ? selectedWilayaObj?.home : selectedWilayaObj?.stop;
      
      const eventId = crypto.randomUUID ? crypto.randomUUID() : `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const finalAddress = form.note ? `${form.address} | ملاحظة: ${form.note}` : form.address;
      let finalDeliveryType = form.shippingMethod === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب (Stop Desk)';
      
      if (form.shippingMethod === 'stopdesk' && form.zrDeskId) {
         const desk = availableDesks.find((d: any) => d.id === form.zrDeskId || d.name === form.zrDeskId);
         if (desk) {
            finalDeliveryType = `${finalDeliveryType} - ${desk.name}`;
         } else {
            finalDeliveryType = `${finalDeliveryType} - ${form.zrDeskId}`;
         }
      }

      const response = await submitOrderFn({
        data: {
          fullname: form.fullname,
          phone: form.phone,
          wilaya: wilayaName,
          commune: form.commune,
          address: finalAddress,
          deliveryType: finalDeliveryType,
          deliveryFee: calculatedDeliveryFee,
          productName,
          offerId: selectedOffer.id,
          offerTitle: selectedOffer.title,
          offerPieces: selectedOffer.pieces,
          offerPrice: selectedOffer.price,
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
          productId: selectedOffer.id,
          value: Number(selectedOffer.price || 0) + (calculatedDeliveryFee || 0),
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

  const inputClasses = "w-full px-4 py-4 bg-[#F8F9FA] border border-slate-200 rounded-2xl text-slate-800 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none";
  const labelClasses = "block text-sm font-bold text-slate-700 mb-2 tracking-wide";
  const sectionTitleClasses = "text-xl sm:text-2xl font-serif font-bold text-secondary mb-4 flex items-center gap-2";

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-5 sm:p-8 font-arabic" id="checkout-form" dir="rtl">
      {/* Header */}
      <div className="text-center mb-10 pb-6 border-b border-slate-100">
        <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-3">أكمل طلبك الآن</h2>
        <p className="text-base text-slate-500 tracking-wide">الرجاء اختيار العرض وإدخال معلوماتك الشخصية</p>
      </div>
      
      {formError && (
        <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10" onFocus={handleFormInteraction} onClick={handleFormInteraction}>
        
        {/* Section 1: Offers */}
        {offers.length > 0 && (
          <section>
            <h3 className={sectionTitleClasses}>
              <span className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              اختر العرض
            </h3>
            <div className="grid gap-4 mt-4">
              {offers.map((offer: any) => {
                const isSelected = selectedOffer?.id === offer.id;
                return (
                  <button
                    type="button"
                    key={offer.id}
                    onClick={() => setSelectedOfferId(offer.id)}
                    className={`relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-right ${
                      isSelected
                        ? "border-[#D4AF37] bg-[#D4AF37]/5 shadow-md scale-[1.01]"
                        : "border-slate-100 bg-[#F8F9FA] hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-slate-300 bg-white'}`}>
                        {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className={`font-bold text-lg ${isSelected ? 'text-[#D4AF37]' : 'text-slate-800'}`}>{offer.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-base font-bold text-slate-700">{formatMoney({ amount: offer.price, currencyCode: "DZD" })}</p>
                          {offer.comparePrice && parseFloat(offer.comparePrice) > parseFloat(offer.price) && (
                             <p className="text-sm text-slate-400 line-through">{formatMoney({ amount: offer.comparePrice, currencyCode: "DZD" })}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {offer.badge && (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 whitespace-nowrap ml-2">
                        {offer.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 2: Sizes */}
        {variants.length > 1 && selectedOffer && (
          <section id="size-selector">
            <h3 className={sectionTitleClasses}>
              <span className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              {selectedOffer.pieces === 1 ? 'اختر المقاس' : 'اختر المقاسات'}
              {sizeError && <span className="text-red-500 normal-case font-bold text-sm ml-2 animate-pulse text-right w-full flex-1">* يرجى اختيار جميع المقاسات</span>}
            </h3>
            
            <div className="space-y-6 mt-4 p-6 bg-[#F8F9FA] rounded-3xl border border-slate-100">
              {Array.from({ length: selectedOffer.pieces }).map((_, pieceIndex) => (
                <div key={pieceIndex} className="space-y-3">
                  {selectedOffer.pieces > 1 && (
                    <p className="font-bold text-sm text-slate-600 bg-white inline-block px-3 py-1 rounded-lg border border-slate-100">القطعة #{pieceIndex + 1}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {variants.map((v: any) => {
                      const isAvailable = isVariantAvailable(v.node, pieceIndex);
                      const isSelected = selectedSizes[pieceIndex] === v.node.id;
                      return (
                        <button
                          type="button"
                          key={v.node.id}
                          onClick={() => setSizeForPiece(pieceIndex, v.node.id)}
                          disabled={!isAvailable && !isSelected}
                          className={`rounded-xl min-w-[4rem] border-2 px-5 py-3 text-base uppercase tracking-wider transition-all font-bold ${
                            !isAvailable && !isSelected
                              ? "opacity-40 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed line-through relative overflow-hidden" 
                              : isSelected
                                ? "border-primary bg-primary text-secondary shadow-md scale-105"
                                : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
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
        <section>
          <h3 className={sectionTitleClasses}>
            <span className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
               {variants.length > 1 ? '3' : '2'}
            </span>
            معلومات العميل
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <div>
              <label htmlFor="fullname" className={labelClasses}>الاسم الكامل</label>
              <input 
                type="text" id="fullname" required
                value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                className={inputClasses} placeholder="أدخل اسمك الكامل"
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
                   value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: e.target.value, commune: "", zrDeskId: "" })}
                   className={`${inputClasses} appearance-none pr-10`}
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
                   className={`${inputClasses} appearance-none pr-10 ${!form.wilaya ? 'bg-slate-100 opacity-60 cursor-not-allowed' : ''}`}
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
        <section id="shipping-method">
          <h3 className={sectionTitleClasses}>
            <span className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
               {variants.length > 1 ? '4' : '3'}
            </span>
            طريقة التوصيل
            {shippingError && <span className="text-red-500 normal-case font-bold text-sm ml-2 animate-pulse">* يرجى الاختيار</span>}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <label className={`relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${form.shippingMethod === 'home' ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
              <input type="radio" name="shippingMethod" value="home" checked={form.shippingMethod === 'home'} onChange={() => { setForm({...form, shippingMethod: 'home'}); setShippingError(false); }} className="sr-only" />
              <div className="flex items-center gap-4">
                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${form.shippingMethod === 'home' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-slate-300 bg-white'}`}>
                    {form.shippingMethod === 'home' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-800 flex items-center gap-2">
                       <Truck className="w-5 h-5 text-slate-600" />
                       توصيل للمنزل
                    </span>
                    {form.wilaya && <span className="text-sm font-bold text-slate-500 mt-1">{selectedWilayaObj?.home} د.ج</span>}
                 </div>
              </div>
            </label>

            <label className={`relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${form.shippingMethod === 'stopdesk' ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
              <input type="radio" name="shippingMethod" value="stopdesk" checked={form.shippingMethod === 'stopdesk'} onChange={() => { setForm({...form, shippingMethod: 'stopdesk'}); setShippingError(false); }} className="sr-only" />
              <div className="flex items-center gap-4">
                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${form.shippingMethod === 'stopdesk' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-slate-300 bg-white'}`}>
                    {form.shippingMethod === 'stopdesk' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-800 flex items-center gap-2">
                       <Building2 className="w-5 h-5 text-slate-600" />
                       الاستلام من المكتب
                    </span>
                    {form.wilaya && <span className="text-sm font-bold text-slate-500 mt-1">{selectedWilayaObj?.stop} د.ج</span>}
                 </div>
              </div>
            </label>
          </div>

          {/* Conditional Delivery Inputs */}
          {form.shippingMethod === 'home' && (
             <div className="mt-5 animate-in fade-in slide-in-from-top-4 duration-300">
               <label htmlFor="address" className={labelClasses}>العنوان بالتفصيل</label>
               <div className="relative">
                  <input 
                    type="text" id="address"
                    value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={`${inputClasses} pr-12`} placeholder="اسم الحي، الشارع، أو أقرب مَعلَم (اختياري)"
                  />
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
               </div>
             </div>
          )}

          {form.shippingMethod === 'stopdesk' && availableDesks.length > 0 && (
             <div className="mt-5 animate-in fade-in slide-in-from-top-4 duration-300" id="zr-desk-selector">
               <label htmlFor="zrDesk" className={labelClasses}>اختر مكتب الاستلام (Yalidine / ZR Express)</label>
               <div className="relative">
                  <select 
                    id="zrDesk"
                    value={form.zrDeskId} onChange={(e) => setForm({ ...form, zrDeskId: e.target.value })}
                    className={`${inputClasses} appearance-none pr-12`}
                  >
                    <option value="" disabled>يرجى تحديد المكتب الأقرب إليك</option>
                    {availableDesks.map((desk: any, i: number) => (
                      <option key={desk.id || i} value={desk.id || desk.name}>{desk.name} - {desk.address}</option>
                    ))}
                  </select>
                  <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
               </div>
             </div>
          )}

          {/* Optional Note */}
          <div className="mt-5">
             <label htmlFor="note" className={labelClasses}>ملاحظة إضافية (اختياري)</label>
             <textarea 
               id="note" rows={2}
               value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
               className={`${inputClasses} resize-none`} placeholder="أي ملاحظات حول الطلب أو التوصيل..."
             />
          </div>
        </section>

        {/* Section 5: Order Summary */}
        {selectedOffer && (
          <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 mt-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">ملخص الطلب</h3>
            
            <div className="space-y-4">
               <div className="flex justify-between items-center text-base font-bold text-slate-700">
                 <span>العرض المحدد</span>
                 <span className="text-primary">{selectedOffer.title} ({selectedOffer.pieces} {selectedOffer.pieces === 1 ? 'قطعة' : 'قطع'})</span>
               </div>
               
               {variants.length > 1 && selectedSizes.some(s => s !== "") && (
                  <div className="flex justify-between items-center text-sm font-bold text-slate-600">
                    <span>المقاسات</span>
                    <span className="text-left dir-ltr">
                       {selectedSizes.map((id, index) => variants.find((v: any) => v.node.id === id)?.node.title || "").filter(Boolean).join("، ")}
                    </span>
                  </div>
               )}

               <div className="flex justify-between items-center text-base font-bold text-slate-600">
                 <span>سعر المنتج</span>
                 <span className="font-sans tracking-tight dir-ltr">{Number(selectedOffer.price).toLocaleString()} د.ج</span>
               </div>

               {selectedOffer.comparePrice && parseFloat(selectedOffer.comparePrice) > parseFloat(selectedOffer.price) && (
                  <div className="flex justify-between items-center text-sm font-bold text-green-600 bg-green-50 p-2 rounded-lg">
                    <span>التخفيض</span>
                    <span className="font-sans tracking-tight dir-ltr">-{(parseFloat(selectedOffer.comparePrice) - parseFloat(selectedOffer.price)).toLocaleString()} د.ج</span>
                  </div>
               )}

               <div className="flex justify-between items-center text-base font-bold text-slate-600">
                 <span>سعر التوصيل</span>
                 <span className="font-sans tracking-tight dir-ltr">
                   {form.wilaya ? (
                     form.shippingMethod ? (
                       `+ ${(form.shippingMethod === 'home' ? selectedWilayaObj?.home : selectedWilayaObj?.stop)?.toLocaleString()} د.ج`
                     ) : (
                       "اختر التوصيل"
                     )
                   ) : (
                     "اختر الولاية"
                   )}
                 </span>
               </div>
               
               <div className="h-px bg-slate-200 my-4"></div>
               
               <div className="flex justify-between items-center text-xl sm:text-2xl font-bold text-secondary">
                 <span>المجموع الكلي</span>
                 <span className="font-sans font-bold tracking-tight dir-ltr text-[#D4AF37]">
                   {form.wilaya && form.shippingMethod ? (
                     `${(Number(selectedOffer.price) + ((form.shippingMethod === 'home' ? selectedWilayaObj?.home : selectedWilayaObj?.stop) || 0)).toLocaleString()} د.ج`
                   ) : (
                     `${Number(selectedOffer.price).toLocaleString()} د.ج`
                   )}
                 </span>
               </div>
            </div>
          </section>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1A2530] hover:bg-[#1A2530]/90 text-white py-5 px-6 rounded-[1.5rem] shadow-xl shadow-[#1A2530]/20 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed border-b-4 border-black/20 hover:translate-y-px hover:border-b-2 active:border-b-0 active:translate-y-1"
          >
            {isSubmitting ? (
              <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="text-xl font-bold tracking-widest uppercase text-[#D4AF37]">تأكيد الطلب الآن</span>
            )}
          </button>
          <p className="text-center text-sm font-bold text-slate-500 mt-4 flex justify-center items-center gap-2">
             <ShieldCheck className="w-4 h-4" /> الدفع يكون عند استلام المنتج
          </p>
        </div>
        
        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-2 py-6 text-slate-600 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm mt-4 px-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <Truck className="w-6 h-6 text-[#D4AF37]" strokeWidth={2} />
            <span className="text-xs font-bold tracking-wider">توصيل سريع</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" strokeWidth={2} />
            <span className="text-xs font-bold tracking-wider">دفع آمن</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <RefreshCw className="w-6 h-6 text-[#D4AF37]" strokeWidth={2} />
            <span className="text-xs font-bold tracking-wider">استبدال واسترجاع</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <Clock className="w-6 h-6 text-[#D4AF37]" strokeWidth={2} />
            <span className="text-xs font-bold tracking-wider">خدمة 24/7</span>
          </div>
        </div>
      </form>
    </div>
  );
}
