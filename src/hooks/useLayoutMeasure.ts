import { useEffect } from 'react';

export function useLayoutMeasure() {
  useEffect(() => {
    // Wait for everything to render
    setTimeout(() => {
      console.log("=== LAYOUT MEASUREMENT ===");
      console.log("Viewport:", {
        width: window.innerWidth,
        clientWidth: document.documentElement.clientWidth
      });

      const mainContainer = document.querySelector('.max-w-7xl');
      if (mainContainer) console.log("Main container:", mainContainer.getBoundingClientRect());

      const formWrapper = document.querySelector('.cod-form-wrapper');
      if (formWrapper) {
        console.log("cod-form-wrapper:", formWrapper.getBoundingClientRect());
        const computed = window.getComputedStyle(formWrapper);
        console.log("cod-form-wrapper computed:", {
          width: computed.width,
          margin: computed.margin,
          padding: computed.padding,
          boxSizing: computed.boxSizing
        });
      }

      const formRoot = document.querySelector('.cod-form-card');
      if (formRoot) {
        console.log("CodForm root:", formRoot.getBoundingClientRect());
        
        // Measure children
        const sections = formRoot.querySelectorAll('section, .flex.justify-center');
        sections.forEach((sec, i) => {
          console.log(`Section ${i+1}:`, sec.getBoundingClientRect());
        });
      }

      console.log("=== END MEASUREMENT ===");
    }, 2000);
  }, []);
}
