// Local Product Client (formerly Shopify)

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: ShopifyMoney;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    descriptionHtml: string;
    handle: string;
    tags: string[];
    productType: string;
    vendor: string;
    priceRange: { minVariantPrice: ShopifyMoney };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: { edges: Array<{ node: ShopifyVariant }> };
    options: Array<{ name: string; values: string[] }>;
  };
}

import productsData from "../../public/data/products.json";

export async function fetchProducts(query?: string, first = 50): Promise<ShopifyProduct[]> {
  try {
    const products = productsData as ShopifyProduct[];
    if (query) {
      return products.filter(p => p.node.title.toLowerCase().includes(query.toLowerCase()));
    }
    return products.slice(0, first);
  } catch (err) {
    console.error("Error fetching local products", err);
    return [];
  }
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    const products = productsData as ShopifyProduct[];
    return products.find(p => p.node.handle === handle) || null;
  } catch (err) {
    console.error("Error fetching local product", err);
    return null;
  }
}

export function formatMoney(money: ShopifyMoney): string {
  const n = parseFloat(money.amount);
  if (money.currencyCode === "DZD") return new Intl.NumberFormat("fr-DZ").format(n) + " DA";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: money.currencyCode }).format(n);
}

// End of local product client

export function getOptimizedShopifyImage(url: string, width?: number): string {
  if (!url || !width) return url;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('cdn.shopify.com')) {
      parsedUrl.searchParams.set('width', width.toString());
      return parsedUrl.toString();
    }
  } catch {
    // If it's a relative URL or invalid, just return as is
  }
  return url;
}

export function getLocalSrcSet(url: string): string | undefined {
  if (!url) return undefined;
  if (url.endsWith("-800w.webp")) {
    const base = url.replace("-800w.webp", "");
    return `${base}-160w.webp 160w, ${base}-400w.webp 400w, ${url} 800w`;
  }
  return undefined;
}
