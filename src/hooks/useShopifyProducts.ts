import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductByHandle, type ShopifyProduct } from "@/lib/shopify";

export function useShopifyProducts(query?: string) {
  return useQuery<ShopifyProduct[]>({
    queryKey: ["shopify", "products", query ?? "all"],
    queryFn: () => fetchProducts(query, 50),
    staleTime: 60_000,
  });
}

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

export function productQueryOptions(handle: string) {
  return queryOptions({
    queryKey: ["shopify", "product", handle],
    queryFn: () => fetchProductByHandle(handle),
    staleTime: 60_000,
  });
}

export function useShopifyProduct(handle: string) {
  return useSuspenseQuery(productQueryOptions(handle));
}
