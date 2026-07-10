import { Package, Truck, Zap, Flame, Star, Award } from "lucide-react";
import { formatMoney } from "@/lib/shopify";

interface ScarcityConfig {
  enableLowStockWarning: boolean;
  enableDiscountMessage: boolean;
  featuredLabelText: string;
  enableFastShipping: boolean;
  enableSizeScarcity: boolean;
  sizeLowStockThreshold: number;
}

interface UrgencySignalsProps {
  scarcityConfig?: ScarcityConfig;
  totalStock: number;
  basePrice: string;
  comparePrice?: string;
  currencyCode?: string;
}

export function UrgencySignals({ 
  scarcityConfig, 
  totalStock, 
  basePrice, 
  comparePrice, 
  currencyCode = "DZD" 
}: UrgencySignalsProps) {
  if (!scarcityConfig) return null;

  const signals = [];

  // 1. Featured Label
  if (scarcityConfig.featuredLabelText && scarcityConfig.featuredLabelText.trim() !== "") {
    signals.push(
      <div key="featured" className="flex items-center gap-2 bg-[#FDFBF7] border border-[#D7AE57]/30 px-3 py-1.5 rounded-[10px] w-fit">
        <Award className="w-[14px] h-[14px] text-[#D7AE57]" strokeWidth={2.5} />
        <span className="text-[12px] font-bold text-[#102A43] leading-none mt-[2px]">{scarcityConfig.featuredLabelText}</span>
      </div>
    );
  }

  // 2. Low Stock Warning
  if (scarcityConfig.enableLowStockWarning && totalStock <= 15 && totalStock > 0) {
    if (totalStock <= 5) {
      signals.push(
        <div key="stock-critical" className="flex items-center gap-2 bg-[#FFFDF8] border border-[#E8E0D2] px-3 py-1.5 rounded-[10px] w-fit shadow-[0_2px_8px_rgba(16,42,67,0.03)]">
          <Zap className="w-[14px] h-[14px] text-[#D7AE57]" strokeWidth={2.5} />
          <span className="text-[12px] font-bold text-[#102A43] leading-none mt-[2px]">لم يتبق سوى {totalStock} قطع.</span>
        </div>
      );
    } else {
      signals.push(
        <div key="stock-low" className="flex items-center gap-2 bg-[#FFFDF8] border border-[#E8E0D2] px-3 py-1.5 rounded-[10px] w-fit shadow-[0_2px_8px_rgba(16,42,67,0.03)]">
          <Package className="w-[14px] h-[14px] text-[#D7AE57]" strokeWidth={2} />
          <span className="text-[12px] font-bold text-[#102A43] leading-none mt-[2px]">الكمية محدودة، اطلب قبل نفادها.</span>
        </div>
      );
    }
  }

  // 3. Discount Message
  if (scarcityConfig.enableDiscountMessage && comparePrice) {
    const bPrice = parseFloat(basePrice);
    const cPrice = parseFloat(comparePrice);
    if (cPrice > bPrice) {
      const difference = formatMoney({ amount: (cPrice - bPrice).toString(), currencyCode });
      signals.push(
        <div key="discount" className="flex items-center gap-2 bg-[#FFFDF8] border border-[#E8E0D2] px-3 py-1.5 rounded-[10px] w-fit shadow-[0_2px_8px_rgba(16,42,67,0.03)]">
          <Flame className="w-[14px] h-[14px] text-[#D7AE57]" strokeWidth={2.5} />
          <span className="text-[12px] font-bold text-[#102A43] leading-none mt-[2px]">وفر {difference} مع هذا العرض.</span>
        </div>
      );
    }
  }

  // 4. Fast Shipping
  if (scarcityConfig.enableFastShipping) {
    signals.push(
      <div key="shipping" className="flex items-center gap-2 bg-[#FFFDF8] border border-[#E8E0D2] px-3 py-1.5 rounded-[10px] w-fit shadow-[0_2px_8px_rgba(16,42,67,0.03)]">
        <Truck className="w-[14px] h-[14px] text-[#D7AE57]" strokeWidth={2} />
        <span className="text-[12px] font-bold text-[#102A43] leading-none mt-[2px]">يتم تجهيز الطلبات خلال 24–48 ساعة.</span>
      </div>
    );
  }

  if (signals.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4" dir="rtl">
      {signals}
    </div>
  );
}
