import { ShieldCheck, Truck, Banknote, RotateCcw, PhoneCall, HeadphonesIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function WhyChooseUs() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#D7AE57]" strokeWidth={2} />,
      title: "جودة مضمونة",
      desc: "خامات مختارة بعناية لتمنح طفلك الراحة والأناقة.",
    },
    {
      icon: <Truck className="w-5 h-5 text-[#D7AE57]" strokeWidth={2} />,
      title: "توصيل سريع",
      desc: "نوصل إلى جميع ولايات الجزائر بسرعة وموثوقية.",
    },
    {
      icon: <Banknote className="w-5 h-5 text-[#D7AE57]" strokeWidth={2} />,
      title: "الدفع عند الاستلام",
      desc: "ادفع فقط عند استلام طلبك.",
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-[#D7AE57]" strokeWidth={2} />,
      title: "استبدال وإرجاع",
      desc: "نوفر خدمة الاستبدال والإرجاع عند الحاجة.",
    },
    {
      icon: <PhoneCall className="w-5 h-5 text-[#D7AE57]" strokeWidth={2} />,
      title: "تأكيد قبل الشحن",
      desc: "نتصل بك لتأكيد الطلب قبل تجهيز الشحنة.",
    },
    {
      icon: <HeadphonesIcon className="w-5 h-5 text-[#D7AE57]" strokeWidth={2} />,
      title: "خدمة عملاء",
      desc: "نرافقك قبل وبعد الطلب للإجابة عن أي استفسار.",
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className={`w-full bg-[#FFFDF8] py-12 px-4 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
      dir="rtl"
    >
      <div className="max-w-xl mx-auto flex flex-col items-center">
        <h2 className="font-serif text-[28px] font-bold text-[#102A43] mb-2 text-center drop-shadow-sm">
          لماذا تختار The Five A؟
        </h2>
        <p className="text-[14px] font-medium text-[#7A7A7A] mb-8 text-center max-w-[280px]">
          نلتزم بتقديم أفضل تجربة تسوق لك ولطفلك بمعايير عالمية.
        </p>

        <div className="flex flex-col gap-3 w-full">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-[18px] border border-[#E9E2D7] p-4 flex items-center gap-4 shadow-[0_4px_16px_rgba(16,42,67,0.03)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(16,42,67,0.06)]`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="w-[42px] h-[42px] rounded-full bg-[#FDFBF7] border border-[#E9E2D7]/50 flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <div className="flex flex-col">
                <h3 className="font-serif text-[15px] font-bold text-[#102A43] leading-tight mb-1">
                  {feature.title}
                </h3>
                <p className="font-sans text-[12px] font-medium text-[#7A7A7A] leading-snug">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
