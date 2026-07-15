import { useState, useEffect, useRef } from "react";

export function LazySection({ 
  children, 
  minHeight = "200px",
  rootMargin = "300px" 
}: { 
  children: React.ReactNode; 
  minHeight?: string;
  rootMargin?: string;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    
    if (ref.current) observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={{ minHeight }} className="w-full">
      {inView ? children : null}
    </div>
  );
}
