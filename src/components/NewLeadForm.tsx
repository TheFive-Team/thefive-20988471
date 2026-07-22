import { useState, useMemo } from "react";
import { CheckCircle2, Truck, ShieldCheck, Clock, MapPin, Building2, AlertCircle, ShoppingBag } from "lucide-react";
import { submitOrderFn } from "@/actions/submitOrder.server";
import { wilayas } from "@/lib/wilayas";
import { communesByWilaya } from "@/lib/communes";
import { formatMoney } from "@/lib/shopify";
import { supabase } from "@/lib/supabase";

export interface NewLeadFormProps {
  productName?: string;
  offers?: any[];
  variants?: any[];
  pricingConfig?: any;
  scarcityConfig?: any;
  basePrice?: string;
  comparePrice?: string;
  selectedQuantity?: number;
  selectedSizes?: string[];
  onOrderSuccess?: () => void;
}

export function NewLeadForm({
  productName = "Product",
  offers = [],
  variants = [],
  pricingConfig,
  scarcityConfig,
  basePrice = "0",
  comparePrice,
  selectedQuantity = 1,
  selectedSizes = [""],
  onOrderSuccess
}: NewLeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [communeName, setCommuneName] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"" | "home" | "stopdesk">("");

  // Location completion check
  const isLocationComplete = Boolean(wilayaCode && communeName);

  // Errors for field highlighting
  const [errors, setErrors] = useState<{
    fullname?: boolean;
    phone?: boolean;
    wilaya?: boolean;
    commune?: boolean;
    shippingMethod?: boolean;
  }>({});

  const quantity = Math.max(1, Number(selectedQuantity) || 1);

  // Selected Wilaya Object safely with fallback
  const selectedWilayaObj = useMemo(() => {
    if (!wilayaCode) return null;
    const codeNum = Number(wilayaCode);
    if (isNaN(codeNum)) return null;
    return wilayas?.find(w => w?.code === codeNum) ?? null;
  }, [wilayaCode]);

  // Communes list for selected Wilaya safely with fallback
  const availableCommunes = useMemo(() => {
    if (!wilayaCode) return [];
    const codeNum = Number(wilayaCode);
    if (isNaN(codeNum)) return [];
    return communesByWilaya[codeNum] ?? [];
  }, [wilayaCode]);

  // Pricing calculations safely with nullish coalescing
  const basePriceNum = Number(basePrice || 0) || 0;
  const subtotal = basePriceNum * quantity;
  
  let discountAmount = 0;
  if (pricingConfig?.enabled && quantity >= (Number(pricingConfig.quantityRequired) || 2)) {
    if (pricingConfig.discountType === "fixed") {
      discountAmount = Number(pricingConfig.discountValue || 0) || 0;
    } else if (pricingConfig.discountType === "percentage") {
      discountAmount = (subtotal * (Number(pricingConfig.discountValue || 0) || 0)) / 100;
    }
  }
  const finalProductTotal = Math.max(0, subtotal - discountAmount);

  // Home & Stop desk delivery fees safely
  const homeFee = Number(selectedWilayaObj?.home ?? 0) || 0;
  const stopFee = Number(selectedWilayaObj?.stop ?? selectedWilayaObj?.home ?? 0) || 0;

  // Delivery fee calculation (0 until isLocationComplete & shippingMethod selected)
  const deliveryFee = useMemo(() => {
    if (!isLocationComplete || !selectedWilayaObj || !shippingMethod) return 0;
    const fee = shippingMethod === "home" ? selectedWilayaObj?.home : (selectedWilayaObj?.stop ?? selectedWilayaObj?.home);
    return Number(fee ?? 0) || 0;
  }, [isLocationComplete, selectedWilayaObj, shippingMethod]);

  const grandTotal = finalProductTotal + deliveryFee;

  // Handle Wilaya change & collapse delivery options
  const handleWilayaChange = (code: string) => {
    setWilayaCode(code);
    setCommuneName("");
    setShippingMethod("");
    setErrors(prev => ({ ...prev, wilaya: false, commune: false, shippingMethod: false }));
  };

  // Handle Commune change & collapse delivery options if cleared
  const handleCommuneChange = (name: string) => {
    setCommuneName(name);
    if (!name) {
      setShippingMethod("");
    }
    setErrors(prev => ({ ...prev, commune: false, shippingMethod: false }));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // Full name validation
    const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]{3,}$/;
    if (!fullname || !nameRegex.test(fullname.trim())) {
      newErrors.fullname = true;
      isValid = false;
    }

    // Phone validation (10 digits starting with 05, 06, 07)
    const phoneRegex = /^(05|06|07)[0-9]{8}$/;
    const cleanPhone = (phone || "").replace(/\s+/g, "");
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      newErrors.phone = true;
      isValid = false;
    }

    // Wilaya validation
    if (!wilayaCode || !selectedWilayaObj) {
      newErrors.wilaya = true;
      isValid = false;
    }

    // Commune validation
    if (!communeName) {
      newErrors.commune = true;
      isValid = false;
    }

    // Shipping method validation (only if location is complete)
    if (!shippingMethod) {
      newErrors.shippingMethod = true;
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      if (newErrors.fullname) {
        setFormError("يرجى إدخال اسم حقيقي (أحرف فقط، لا يقل عن 3 أحرف).");
      } else if (newErrors.phone) {
        setFormError("يرجى إدخال رقم هاتف صحيح (10 أرقام تبدأ بـ 05، 06، أو 07).");
      } else if (newErrors.wilaya) {
        setFormError("يرجى اختيار الولاية.");
      } else if (newErrors.commune) {
        setFormError("يرجى اختيار البلدية.");
      } else if (newErrors.shippingMethod) {
        setFormError("يرجى اختيار طريقة التوصيل.");
      }
    } else {
      setFormError(null);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    // Check duplicate order rate limit
    const lastOrder = localStorage.getItem("thefive_last_order");
    if (lastOrder && Date.now() - parseInt(lastOrder) < 60000) {
      setFormError("لقد قمت بتقديم طلب للتو. يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.");
      return;
    }

    setIsSubmitting(true);

    try {
      const wilayaName = selectedWilayaObj ? `${selectedWilayaObj.code} - ${selectedWilayaObj.nameAr}` : wilayaCode;
      const finalDeliveryType = shippingMethod === "home" ? "home" : "desk";
      const eventId = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const formattedSizes = Array.isArray(selectedSizes) 
        ? selectedSizes.map(id => variants?.find((v: any) => v?.node?.id === id)?.node?.title ?? "").filter(Boolean).join(" + ")
        : "";

      const supabasePayload = {
        customer_name: (fullname || "").trim(),
        phone: (phone || "").replace(/\s+/g, ""),
        wilaya: wilayaName,
        commune: communeName,
        delivery_type: finalDeliveryType,
        total_price: Number(grandTotal) || 0,
        selected_size: formattedSizes,
        product_name: productName || "Product",
        status: 'pending',
        items: [
          {
            title: productName || "Product",
            size: formattedSizes,
            quantity: quantity,
            price: Number(basePriceNum) || 0
          }
        ]
      };

      console.log('[SUPABASE_SUBMIT_VARIANT_B]', supabasePayload);

      const { error: dbError } = await supabase.from('orders').insert([supabasePayload]);

      if (!dbError) {
        localStorage.setItem("thefive_last_order", Date.now().toString());
        setSubmitted(true);
        onOrderSuccess?.();

        const finalPurchasePayload = {
          value: Number(grandTotal) || 0,
          currency: "DZD",
          content_type: "product",
          content_ids: ["default"],
          contents: [
            {
              id: "default",
              quantity: Number(quantity) || 1,
              item_price: Number(basePriceNum) || 0,
            },
          ],
        };

        if (typeof window !== "undefined") {
          const w = window as unknown as { fbq?: (...args: unknown[]) => void };
          w.fbq?.("track", "Purchase", finalPurchasePayload, { eventID: eventId });
        }
      } else {
        console.error("Supabase insert error:", dbError);
        setFormError("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setFormError("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-10 px-6 bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#E8E0D2] flex flex-col items-center text-center animate-in zoom-in-95 fade-in duration-500 w-full" dir="rtl">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#102A4C] mb-2">
          تم إرسال طلبك بنجاح! 🎉
        </h2>
        <p className="text-slate-600 text-sm max-w-md leading-relaxed mb-6">
          شكراً لك، سيتصل بك فريقنا قريباً لتأكيد معلومات التوصيل وإرسال طلبك.
        </p>
        <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-right space-y-2 text-sm text-slate-700">
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="font-medium">المنتج:</span>
            <span className="font-semibold text-[#102A4C]">{productName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="font-medium">الكمية:</span>
            <span>{quantity} قطعة</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">المبلغ الإجمالي:</span>
            <span className="font-bold text-[#C99A24]">{formatMoney({ amount: grandTotal, currencyCode: "DZD" })}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="new-lead-form" className="w-full bg-white rounded-[22px] p-5 sm:p-7 shadow-[0_8px_30px_rgba(16,42,67,0.06)] border border-[#E8E0D2] box-border animate-in slide-in-from-bottom-4 duration-500" dir="rtl">
      
      {/* Header */}
      <div className="mb-5 text-center sm:text-right border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C99A24]/10 text-[#C99A24] text-xs font-semibold mb-2">
          <Truck size={14} />
          <span>الدفع عند الاستلام — توصيل سريع لجميع الولايات</span>
        </div>
        <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#102A4C]">
          معلومات التوصيل 📦
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          أدخلي معلوماتك أدناه وسنتكفل بالتوصيل السريع مباشرة إلى باب منزلك أو المكتب.
        </p>
      </div>

      {/* Global Error Banner */}
      {formError && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-start gap-2 animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            الاسم الكامل <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="مثال: مريم بن علي"
            value={fullname}
            onChange={(e) => {
              setFullname(e.target.value);
              if (errors.fullname) setErrors(prev => ({ ...prev, fullname: false }));
            }}
            className={`w-full h-12 px-4 rounded-xl border text-sm transition-all outline-none ${
              errors.fullname 
                ? "border-rose-400 bg-rose-50/50 focus:border-rose-500" 
                : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#C99A24] focus:ring-2 focus:ring-[#C99A24]/20"
            }`}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            رقم الهاتف <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            dir="ltr"
            placeholder="0555123456"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors(prev => ({ ...prev, phone: false }));
            }}
            className={`w-full h-12 px-4 rounded-xl border text-sm text-right transition-all outline-none ${
              errors.phone 
                ? "border-rose-400 bg-rose-50/50 focus:border-rose-500" 
                : "border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#C99A24] focus:ring-2 focus:ring-[#C99A24]/20"
            }`}
          />
        </div>

        {/* Wilaya & Commune Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Wilaya Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الولاية <span className="text-rose-500">*</span>
            </label>
            <select
              value={wilayaCode}
              onChange={(e) => handleWilayaChange(e.target.value)}
              className={`w-full h-12 px-3 rounded-xl border text-sm transition-all outline-none bg-slate-50/50 cursor-pointer ${
                errors.wilaya 
                  ? "border-rose-400 bg-rose-50/50 focus:border-rose-500" 
                  : "border-slate-200 focus:bg-white focus:border-[#C99A24] focus:ring-2 focus:ring-[#C99A24]/20"
              }`}
            >
              <option value="">اختر الولاية...</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Commune Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              البلدية <span className="text-rose-500">*</span>
            </label>
            <select
              value={communeName}
              disabled={!wilayaCode}
              onChange={(e) => handleCommuneChange(e.target.value)}
              className={`w-full h-12 px-3 rounded-xl border text-sm transition-all outline-none bg-slate-50/50 cursor-pointer ${
                !wilayaCode ? "opacity-50 cursor-not-allowed" : ""
              } ${
                errors.commune 
                  ? "border-rose-400 bg-rose-50/50 focus:border-rose-500" 
                  : "border-slate-200 focus:bg-white focus:border-[#C99A24] focus:ring-2 focus:ring-[#C99A24]/20"
              }`}
            >
              <option value="">{wilayaCode ? "اختر البلدية..." : "اختر الولاية أولاً"}</option>
              {availableCommunes.map((c, idx) => (
                <option key={idx} value={c.ar}>
                  {c.ar} ({c.fr})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Shipping Method Options — Conditionally revealed ONLY when both Wilaya and Commune are selected */}
        {isLocationComplete && selectedWilayaObj ? (
          <div className="pt-2 animate-in fade-in slide-in-from-top-3 duration-300">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              طريقة التوصيل <span className="text-rose-500">*</span>
              {errors.shippingMethod && (
                <span className="text-rose-600 font-normal mr-2 animate-pulse">* يرجى اختياره لإنهاء الطلب</span>
              )}
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Home Delivery Option */}
              <button
                type="button"
                onClick={() => {
                  setShippingMethod("home");
                  if (errors.shippingMethod) setErrors(prev => ({ ...prev, shippingMethod: false }));
                }}
                className={`p-3.5 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                  shippingMethod === "home"
                    ? "border-[#C99A24] bg-[#C99A24]/5 ring-2 ring-[#C99A24]/30"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  shippingMethod === "home" ? "border-[#C99A24] bg-[#C99A24] text-white" : "border-slate-300 bg-white"
                }`}>
                  {shippingMethod === "home" && <span className="w-2 h-2 rounded-full bg-white block" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#102A4C] flex items-center gap-1">
                      <MapPin size={13} className="text-[#C99A24]" />
                      توصيل للمنزل
                    </span>
                    <span className="text-xs font-extrabold text-[#C99A24]">
                      {homeFee} د.ج
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">توصيل مباشرة إلى عنوانك الشخصي</p>
                </div>
              </button>

              {/* Stop Desk Option */}
              <button
                type="button"
                onClick={() => {
                  setShippingMethod("stopdesk");
                  if (errors.shippingMethod) setErrors(prev => ({ ...prev, shippingMethod: false }));
                }}
                className={`p-3.5 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                  shippingMethod === "stopdesk"
                    ? "border-[#C99A24] bg-[#C99A24]/5 ring-2 ring-[#C99A24]/30"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  shippingMethod === "stopdesk" ? "border-[#C99A24] bg-[#C99A24] text-white" : "border-slate-300 bg-white"
                }`}>
                  {shippingMethod === "stopdesk" && <span className="w-2 h-2 rounded-full bg-white block" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#102A4C] flex items-center gap-1">
                      <Building2 size={13} className="text-[#C99A24]" />
                      استلام من المكتب
                    </span>
                    <span className="text-xs font-extrabold text-[#C99A24]">
                      {stopFee} د.ج
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">استلام من أقرب مكتب ولاية</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-1 text-[11px] text-slate-400 font-medium italic">
            * اختر الولاية والبلدية أولاً لإظهار خيارات وأسعار التوصيل المتاحة.
          </div>
        )}

        {/* Total Summary */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
          <div className="flex justify-between">
            <span>سعر المنتجات ({quantity} قطعة):</span>
            <span className="font-semibold">{formatMoney({ amount: finalProductTotal, currencyCode: "DZD" })}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>مصاريف التوصيل:</span>
            <span className="font-semibold">
              {!isLocationComplete
                ? "اختر البلدية أولاً"
                : !shippingMethod
                ? "اختر طريقة التوصيل"
                : `${deliveryFee} د.ج`}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-[#102A4C]">
            <span>المبلغ الإجمالي عند الاستلام:</span>
            <span className="text-[#C99A24]">{formatMoney({ amount: grandTotal, currencyCode: "DZD" })}</span>
          </div>
        </div>

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 mt-3 bg-[#102A4C] hover:bg-[#0a1e38] text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>جاري إرسال الطلب...</span>
            </div>
          ) : (
            <>
              <ShoppingBag size={20} />
              <span>تأكيد الطلب الآن 🛍️</span>
            </>
          )}
        </button>

        {/* Guarantee Badge */}
        <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-600" />
            ضمان الجودة 100%
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-[#C99A24]" />
            تأكيد هاتفي خلال ساعات
          </span>
        </div>
      </form>
    </div>
  );
}
