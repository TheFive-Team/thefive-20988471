import { ShieldCheck, Truck, Banknote, RotateCcw, PhoneCall, HeadphonesIcon, CheckCircle2, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function WhyChooseUs() {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
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
      icon: <ShieldCheck className="w-[18px] h-[18px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "جودة استثنائية",
      desc: "نختار أجود الخامات بعناية لتمنح طفلك الراحة والأناقة طوال اليوم.",
    },
    {
      icon: <Truck className="w-[18px] h-[18px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "توصيل سريع وآمن",
      desc: "نوصل إلى جميع ولايات الجزائر مع متابعة طلبك خطوة بخطوة.",
    },
    {
      icon: <Banknote className="w-[18px] h-[18px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "الدفع عند الاستلام",
      desc: "ادفع فقط بعد استلام طلبك بكل راحة واطمئنان.",
    },
    {
      icon: <RotateCcw className="w-[18px] h-[18px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "استبدال وإرجاع سهل",
      desc: "نوفر خدمة الاستبدال أو الإرجاع إذا لم يكن المنتج مناسبًا.",
    },
    {
      icon: <PhoneCall className="w-[18px] h-[18px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "تأكيد قبل الشحن",
      desc: "نتصل بك لتأكيد جميع تفاصيل الطلب قبل تجهيز الشحنة.",
    },
    {
      icon: <HeadphonesIcon className="w-[18px] h-[18px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "خدمة عملاء مميزة",
      desc: "فريقنا جاهز للإجابة عن استفساراتك قبل وبعد الطلب.",
    },
  ];

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section 
      ref={sectionRef}
      className={`w-full bg-[#F8F5EF] border-t border-[#E4DAC7] pt-[60px] pb-0 px-4 sm:px-6 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Editorial Header */}
        <div className={`flex flex-col items-center w-full mb-[40px] transition-all duration-[350ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 mb-[16px]">
            <div className="w-8 sm:w-10 h-[1px] bg-[#C9A34E]/60"></div>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#C9A34E]"></div>
            <div className="w-8 sm:w-10 h-[1px] bg-[#C9A34E]/60"></div>
          </div>
          <span className="font-serif uppercase font-medium text-[22px] sm:text-[26px] text-[#C9A34E] tracking-[0.2em] text-center mb-[18px] ml-[0.2em]">
            THE FIVE A
          </span>
          <h2 className="font-serif text-[36px] sm:text-[42px] font-bold text-[#102A43] text-center leading-[1.15] mb-[16px]">
            تسوّق بثقة
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#6B7280] text-center leading-[1.9] max-w-[320px]">
            نختار كل تفصيل بعناية لنمنحك تجربة شراء راقية ومنتجًا بجودة تستحق ثقتك.
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="flex flex-col gap-[10px] w-full">
          {features.map((feature, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`group bg-[#FFFDF8] rounded-[16px] border border-[#E8E0D2] overflow-hidden transition-all duration-300 ease-out shadow-[0_4px_12px_rgba(16,42,67,0.02)] hover:shadow-[0_6px_16px_rgba(16,42,67,0.04)] cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${idx * 40}ms` }}
                onClick={() => toggleItem(idx)}
              >
                {/* Header (Always visible) */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 min-h-[56px] select-none">
                  <div className="flex items-center gap-3.5">
                    <div className="w-[36px] h-[36px] rounded-full bg-[#F8F5EF] flex items-center justify-center shrink-0 border border-[#E8E0D2]/50 transition-colors duration-300 group-hover:bg-[#F2EFE8]">
                      {feature.icon}
                    </div>
                    <h3 className="font-serif text-[15px] sm:text-[16px] font-bold text-[#102A43] leading-none mt-0.5">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <div className="shrink-0 mr-4">
                    <ChevronDown 
                      className={`w-[18px] h-[18px] text-[#D7AE57] transition-transform duration-[250ms] ease-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                      strokeWidth={2}
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                <div 
                  className={`grid transition-all duration-[250ms] ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="pb-4 pt-0 pl-4 pr-[66px] sm:pl-5 sm:pr-[70px] text-right">
                      <p className="font-sans text-[13px] font-medium text-[#7D7D7D] leading-[1.6]">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
