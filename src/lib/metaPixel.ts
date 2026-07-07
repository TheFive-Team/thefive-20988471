// src/lib/metaPixel.ts

// Declare fbq on the window object safely
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Initialize Meta Pixel
 * Only runs in the browser and if a Pixel ID is provided.
 */
export const initMetaPixel = (pixelId: string | undefined) => {
  if (typeof window === 'undefined' || !pixelId) return;

  const f = window;
  if (f.fbq) return;

  const n: any = (f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = '2.0';
  n.queue = [];

  const b = document;
  const e = 'script';
  const t = b.createElement(e) as HTMLScriptElement;
  t.async = !0;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const s = b.getElementsByTagName(e)[0];
  if (s?.parentNode) {
    s.parentNode.insertBefore(t, s);
  } else {
    b.head.appendChild(t);
  }

  // Initialize the pixel
  window.fbq('init', pixelId);

  if (import.meta.env.DEV) {
    console.log('✅ [Meta Pixel] Initialized with ID:', pixelId);
  }
};

/**
 * Track PageView event
 * Fire on every page load / route change
 */
export const trackPageView = () => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'PageView');
  
  if (import.meta.env.DEV) {
    console.log('✅ [Meta Pixel] PageView fired');
  }
};

/**
 * Track ViewContent event
 * Fire when the product page is opened
 */
export const trackViewContent = (productData: {
  productName: string;
  productId: string;
  price: number;
  currency?: string;
}) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  const payload = {
    content_name: productData.productName,
    content_ids: [productData.productId],
    content_type: 'product',
    value: productData.price,
    currency: productData.currency || 'DZD',
  };
  window.fbq('track', 'ViewContent', payload);
  
  if (import.meta.env.DEV) {
    console.log('✅ [Meta Pixel] ViewContent fired:', payload);
  }
};

/**
 * Track InitiateCheckout event
 * Fire when user clicks "اطلب الآن" or opens the order form
 */
export const trackInitiateCheckout = (productData: {
  productName: string;
  productId: string | undefined;
  price: number;
  currency?: string;
}) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  const payload = {
    content_name: productData.productName,
    content_ids: productData.productId ? [productData.productId] : [],
    content_type: 'product',
    value: productData.price,
    currency: productData.currency || 'DZD',
  };
  window.fbq('track', 'InitiateCheckout', payload);

  if (import.meta.env.DEV) {
    console.log('✅ [Meta Pixel] InitiateCheckout fired:', payload);
  }
};

/**
 * Track Purchase event
 * Fire only after the order is successfully saved in the database
 */
export const trackPurchase = (orderData: {
  orderId?: string;
  productName: string;
  productId: string | undefined;
  value: number;
  currency?: string;
  eventId?: string;
}) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const payload = {
    content_name: orderData.productName,
    content_ids: orderData.productId ? [orderData.productId] : [],
    content_type: 'product',
    value: orderData.value,
    currency: orderData.currency || 'DZD',
    ...(orderData.orderId && { order_id: orderData.orderId }),
  };

  const options = orderData.eventId ? { eventID: orderData.eventId } : undefined;
  
  if (options) {
    window.fbq('track', 'Purchase', payload, options);
  } else {
    window.fbq('track', 'Purchase', payload);
  }

  if (import.meta.env.DEV) {
    console.log('✅ [Meta Pixel] Purchase fired:', { payload, options });
  }
};
/**
 * Track AddToCart event
 */
export const trackAddToCart = (productData: {
  productName: string;
  productId: string | undefined;
  price: number;
  currency?: string;
}) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  const payload = {
    content_name: productData.productName,
    content_ids: productData.productId ? [productData.productId] : [],
    content_type: 'product',
    value: productData.price,
    currency: productData.currency || 'DZD',
  };
  window.fbq('track', 'AddToCart', payload);
  
  if (import.meta.env.DEV) {
    console.log('✅ [Meta Pixel] AddToCart fired:', payload);
  }
};
