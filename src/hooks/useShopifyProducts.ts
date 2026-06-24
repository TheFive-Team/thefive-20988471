import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductByHandle, type ShopifyProduct } from "@/lib/shopify";

export function useShopifyProducts(query?: string) {
  return useQuery<ShopifyProduct[]>({
    queryKey: ["shopify", "products", query ?? "all"],
    queryFn: () => fetchProducts(query, 50),
    staleTime: 60_000,
  });
}

export function useShopifyProduct(handle: string) {
  return useQuery<ShopifyProduct | null>({
    queryKey: ["shopify", "product", handle],
    queryFn: () => fetchProductByHandle(handle),
    staleTime: 60_000,
  });
}
