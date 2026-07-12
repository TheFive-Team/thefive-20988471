import { ShieldCheck, Truck, Banknote, RotateCcw } from "lucide-react";
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
      icon: <ShieldCheck className="w-[28px] h-[28px] text-[#C9A34A]" strokeWidth={1.5} />,
      title: "ضمان الجودة",
      desc: "خامات مختارة بعناية",
    },
    {
      icon: <Banknote className="w-[28px] h-[28px] text-[#C9A34A]" strokeWidth={1.5} />,
      title: "الدفع عند الاستلام",
      desc: "ادفع فقط عند وصول طلبك",
    },
    {
      icon: <RotateCcw className="w-[28px] h-[28px] text-[#C9A34A]" strokeWidth={1.5} />,
      title: "استبدال وإرجاع",
      desc: "خدمة سهلة عند الحاجة",
    },
    {
      icon: <Truck className="w-[28px] h-[28px] text-[#C9A34A]" strokeWidth={1.5} />,
      title: "توصيل سريع",
      desc: "إلى جميع ولايات الجزائر",
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className={`w-full bg-[#F8F5EF] border-t border-[#E4DAC7] py-[32px] px-[24px] sm:px-[28px] transition-opacity duration-700 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px]">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`bg-[#FFFDF8] rounded-[16px] border border-[#E8E0D2] p-4 sm:p-5 flex flex-col items-center text-center justify-start shadow-[0_2px_8px_rgba(16,42,67,0.03)] transition-all duration-500 ease-out hover:shadow-[0_4px_12px_rgba(16,42,67,0.06)] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: `${idx * 75}ms` }}
            >
              <div className="w-[48px] h-[48px] rounded-full bg-[#F8F5EF] flex items-center justify-center mb-3 border border-[#E8E0D2]/40 shrink-0">
                {feature.icon}
              </div>
              <h3 className="font-serif text-[14px] font-bold text-[#102A43] mb-1.5 leading-tight">
                {feature.title}
              </h3>
              <p className="font-sans text-[11.5px] sm:text-[12px] font-medium text-[#7D7D7D] leading-[1.4] line-clamp-2">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
