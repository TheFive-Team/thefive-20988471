import { ShieldCheck, Truck, Banknote, RotateCcw, PhoneCall, HeadphonesIcon, CheckCircle2 } from "lucide-react";
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
      icon: <ShieldCheck className="w-[26px] h-[26px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "جودة استثنائية",
      desc: "نختار أجود الخامات بعناية لتمنح طفلك الراحة والأناقة طوال اليوم.",
      number: "01"
    },
    {
      icon: <Truck className="w-[26px] h-[26px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "توصيل سريع وآمن",
      desc: "نوصل إلى جميع ولايات الجزائر مع متابعة طلبك خطوة بخطوة.",
      number: "02"
    },
    {
      icon: <Banknote className="w-[26px] h-[26px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "الدفع عند الاستلام",
      desc: "ادفع فقط بعد استلام طلبك بكل راحة واطمئنان.",
      number: "03"
    },
    {
      icon: <RotateCcw className="w-[26px] h-[26px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "استبدال وإرجاع سهل",
      desc: "نوفر خدمة الاستبدال أو الإرجاع إذا لم يكن المنتج مناسبًا.",
      number: "04"
    },
    {
      icon: <PhoneCall className="w-[26px] h-[26px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "تأكيد قبل الشحن",
      desc: "نتصل بك لتأكيد جميع تفاصيل الطلب قبل تجهيز الشحنة.",
      number: "05"
    },
    {
      icon: <HeadphonesIcon className="w-[26px] h-[26px] text-[#D7AE57]" strokeWidth={1.5} />,
      title: "خدمة عملاء مميزة",
      desc: "فريقنا جاهز للإجابة على جميع استفساراتك قبل وبعد الطلب.",
      number: "06"
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className={`w-full bg-[#F8F5EF] py-16 sm:py-24 px-4 sm:px-6 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-12 w-full">
          <div className="w-10 h-1 bg-[#D7AE57] rounded-full mb-5 opacity-80"></div>
          <h2 className="font-serif text-3xl sm:text-[34px] font-bold text-[#102A43] mb-4 text-center leading-tight tracking-tight">
            تسوّق بثقة مع The Five A
          </h2>
          <p className="text-[14px] sm:text-[15px] font-medium text-[#7D7D7D] text-center max-w-[340px] sm:max-w-[420px] leading-relaxed line-clamp-2">
            نهتم بكل تفصيل لنمنحك تجربة شراء مريحة ومنتجًا بجودة تستحق ثقتك.
          </p>
        </div>

        {/* Cards Stack */}
        <div className="flex flex-col gap-4 w-full">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`group bg-white rounded-[20px] border border-[#E8E0D2] p-[22px] flex items-center gap-5 shadow-[0_10px_30px_rgba(16,42,67,0.05)] transition-all duration-[350ms] ease-out hover:-translate-y-[3px] hover:shadow-[0_15px_40px_rgba(16,42,67,0.08)] relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${idx * 60}ms` }}
            >
              {/* Icon */}
              <div className="w-[60px] h-[60px] rounded-full bg-[#F8F5EF] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-105">
                {feature.icon}
              </div>
              
              {/* Content */}
              <div className="flex flex-col flex-1 z-10 pl-8">
                <h3 className="font-serif text-[16px] font-bold text-[#102A43] leading-tight mb-1.5">
                  {feature.title}
                </h3>
                <p className="font-sans text-[13px] font-medium text-[#7D7D7D] leading-[1.6] line-clamp-2">
                  {feature.desc}
                </p>
              </div>

              {/* Number */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 select-none pointer-events-none">
                <span className="font-serif text-[48px] font-bold text-[#E8E0D2] opacity-25 italic">
                  {feature.number}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Bar */}
        <div 
          className={`mt-8 w-full bg-white rounded-[18px] border border-[#E8E0D2] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_8px_24px_rgba(16,42,67,0.04)] transition-all duration-700 ease-out delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex text-[#D7AE57] text-[15px] tracking-widest drop-shadow-sm">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <span className="font-sans font-bold text-[#102A43] text-[15px] mt-0.5">4.9/5</span>
          </div>

          {/* Text & Avatars */}
          <div className="flex items-center gap-4">
            <span className="font-serif font-bold text-[#102A43] text-[15px]">
              "ثقة آلاف العملاء"
            </span>
            <div className="flex items-center">
              <div className="flex -space-x-2 -space-x-reverse mr-2">
                <div className="w-8 h-8 rounded-full bg-[#F8F5EF] border-2 border-white flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=1" alt="Avatar" className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F8F5EF] border-2 border-white flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=5" alt="Avatar" className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F8F5EF] border-2 border-white flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=9" alt="Avatar" className="w-full h-full object-cover opacity-80" />
                </div>
              </div>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#102A43] -ml-2 z-10 border-2 border-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D7AE57]" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
