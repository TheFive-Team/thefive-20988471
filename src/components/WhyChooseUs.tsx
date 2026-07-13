import { ShieldCheck, Truck, Banknote, RotateCcw } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      icon: <ShieldCheck className="w-[32px] h-[32px] text-[#C9A34A]" strokeWidth={1.5} />,
      title: "ضمان الجودة",
      desc: "خامات مختارة بعناية",
    },
    {
      icon: <Banknote className="w-[32px] h-[32px] text-[#C9A34A]" strokeWidth={1.5} />,
      title: "الدفع عند الاستلام",
      desc: "ادفع فقط عند وصول طلبك",
    },
    {
      icon: <Truck className="w-[32px] h-[32px] text-[#C9A34A]" strokeWidth={1.5} />,
      title: "توصيل سريع",
      desc: "إلى جميع ولايات الجزائر",
    },
    {
      icon: <RotateCcw className="w-[32px] h-[32px] text-[#C9A34A]" strokeWidth={1.5} />,
      title: "استبدال وإرجاع",
      desc: "خدمة سهلة عند الحاجة",
    },
  ];

  return (
    <section 
      className="w-full bg-[#F8F5EF] border-t border-[#E4DAC7] py-[32px] px-[24px] sm:px-[28px]" 
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px]">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-[#FFFDF8] rounded-[18px] border border-[#E9DDC8] p-[24px] min-h-[156px] flex flex-col items-center text-center justify-start shadow-[0_2px_8px_rgba(16,42,67,0.02)] transition-all duration-300 ease-out md:hover:-translate-y-[3px] md:hover:shadow-[0_6px_20px_rgba(16,42,67,0.05)]"
            >
              <div className="w-[56px] h-[56px] rounded-full bg-[#F8F5EF] flex items-center justify-center mb-[18px] border border-[#C9A34A]/30 shrink-0">
                {feature.icon}
              </div>
              <h3 className="font-sans text-[21px] font-extrabold text-[#102A43] mb-[10px] tracking-[-0.02em] leading-[1.15] text-center w-full">
                {feature.title}
              </h3>
              <p className="font-sans text-[14px] font-medium text-[#6E6E6E] leading-[1.45] max-w-[85%] mx-auto text-center line-clamp-2">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
