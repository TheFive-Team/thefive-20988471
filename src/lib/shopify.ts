// Shopify Storefront API client
export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "i2ehph-w9.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "4917b52ba0941e13d34b31faaaba459d";

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

const STOREFRONT_PRODUCT_FIELDS = `
  id title description handle tags productType vendor
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 6) { edges { node { url altText } } }
  variants(first: 25) {
    edges { node {
      id title availableForSale
      price { amount currencyCode }
      selectedOptions { name value }
    } }
  }
  options { name values }
`;

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges { node { ${STOREFRONT_PRODUCT_FIELDS} } }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) { ${STOREFRONT_PRODUCT_FIELDS} }
  }
`;

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 402) {
    console.error("Shopify: payment required — upgrade plan at admin.shopify.com");
    return null;
  }
  if (!response.ok) throw new Error(`Shopify HTTP ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(`Shopify GraphQL: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
  return data;
}

export async function fetchProducts(query?: string, first = 50): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(PRODUCTS_QUERY, { first, query: query ?? null });
  return data?.data?.products?.edges ?? [];
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  const node = data?.data?.productByHandle;
  return node ? { node } : null;
}

export function formatMoney(money: ShopifyMoney): string {
  const n = parseFloat(money.amount);
  if (money.currencyCode === "DZD") return new Intl.NumberFormat("fr-DZ").format(n) + " DA";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: money.currencyCode }).format(n);
}

// ---------- Cart ----------
const CART_FIELDS = `
  id checkoutUrl totalQuantity
  cost { totalAmount { amount currencyCode } subtotalAmount { amount currencyCode } }
  lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id } } } } }
`;

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`;
const CART_CREATE = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { ${CART_FIELDS} } userErrors { message } } }`;
const CART_LINES_ADD = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } } }`;
const CART_LINES_UPDATE = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } } }`;
const CART_LINES_REMOVE = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART_FIELDS} } userErrors { message } } }`;

export function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: Array<{ message: string }>): boolean {
  return userErrors.some((e) => {
    const m = e.message.toLowerCase();
    return m.includes("cart not found") || m.includes("does not exist");
  });
}

export interface ShopifyCartLine { id: string; merchandiseId: string }
export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: ShopifyCartLine[];
}

function mapCart(raw: { id: string; checkoutUrl: string; totalQuantity: number; lines: { edges: Array<{ node: { id: string; merchandise: { id: string } } }> } }): ShopifyCart {
  return {
    id: raw.id,
    checkoutUrl: formatCheckoutUrl(raw.checkoutUrl),
    totalQuantity: raw.totalQuantity,
    lines: raw.lines.edges.map((e) => ({ id: e.node.id, merchandiseId: e.node.merchandise.id })),
  };
}

export async function shopifyCartCreate(variantId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_CREATE, {
    input: { lines: [{ quantity, merchandiseId: variantId }] },
  });
  const errs = data?.data?.cartCreate?.userErrors ?? [];
  if (errs.length) { console.error("cartCreate:", errs); return null; }
  const cart = data?.data?.cartCreate?.cart;
  return cart ? mapCart(cart) : null;
}

export async function shopifyCartLinesAdd(cartId: string, variantId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_LINES_ADD, {
    cartId,
    lines: [{ quantity, merchandiseId: variantId }],
  });
  const errs = data?.data?.cartLinesAdd?.userErrors ?? [];
  if (isCartNotFoundError(errs)) return { cartNotFound: true as const };
  if (errs.length) { console.error("cartLinesAdd:", errs); return null; }
  const cart = data?.data?.cartLinesAdd?.cart;
  return cart ? mapCart(cart) : null;
}

export async function shopifyCartLinesUpdate(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_LINES_UPDATE, {
    cartId, lines: [{ id: lineId, quantity }],
  });
  const errs = data?.data?.cartLinesUpdate?.userErrors ?? [];
  if (isCartNotFoundError(errs)) return { cartNotFound: true as const };
  if (errs.length) { console.error("cartLinesUpdate:", errs); return null; }
  const cart = data?.data?.cartLinesUpdate?.cart;
  return cart ? mapCart(cart) : null;
}

export async function shopifyCartLinesRemove(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_LINES_REMOVE, { cartId, lineIds: [lineId] });
  const errs = data?.data?.cartLinesRemove?.userErrors ?? [];
  if (isCartNotFoundError(errs)) return { cartNotFound: true as const };
  if (errs.length) { console.error("cartLinesRemove:", errs); return null; }
  const cart = data?.data?.cartLinesRemove?.cart;
  return cart ? mapCart(cart) : null;
}

export async function shopifyCartFetch(cartId: string) {
  const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
  const raw = data?.data?.cart;
  return raw ? mapCart(raw) : null;
}
