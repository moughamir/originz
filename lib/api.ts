/**
 * API client for Cosmos API integration
 * Base URL: http://localhost:8000
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Types for API responses
export interface ApiProduct {
  id: number;
  name: string;
  handle: string;
  body_html: string;
  price: number;
  compare_at_price?: number;
  images: ApiProductImage[];
  category: string;
  in_stock: boolean;
  rating: number;
  review_count: number;
  tags: string[];
  vendor: string;
  variants: ApiProductVariant[];
  options: ApiProductOption[];
  created_at: string;
  updated_at: string;
}

// Map ApiProduct -> internal Product types
import type { Product, ProductImage, ProductOption, ProductVariant } from "@/lib/types";

export function mapApiVariant(variant: ApiProductVariant): ProductVariant {
  return {
    id: variant.id,
    name:
      variant.title ||
      [variant.option1, variant.option2, variant.option3].filter(Boolean).join(" / ") ||
      String(variant.id),
    price: Number(variant.price),
    inStock: Boolean(variant.available),
    image: variant.featured_image,
  };
}

export function mapApiOption(option: ApiProductOption): ProductOption {
  return {
    id: option.id,
    name: option.name,
    position: option.position,
    values: option.values,
  };
}

export function mapApiImage(image: ApiProductImage): ProductImage {
  return {
    id: image.id,
    product_id: image.product_id,
    position: image.position,
    alt: image.alt,
    src: image.src,
    width: image.width,
    height: image.height,
    created_at: image.created_at,
    updated_at: image.updated_at,
    variant_ids: image.variant_ids,
  };
}

export function mapApiToProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    handle: apiProduct.handle,
    body_html: apiProduct.body_html,
    price: apiProduct.price,
    compareAtPrice: apiProduct.compare_at_price,
    images: apiProduct.images?.map(mapApiImage) || [],
    category: apiProduct.category,
    inStock: apiProduct.in_stock,
    rating: apiProduct.rating,
    reviewCount: apiProduct.review_count,
    tags: apiProduct.tags,
    vendor: apiProduct.vendor,
    variants: apiProduct.variants?.map(mapApiVariant) || [],
    options: apiProduct.options?.map(mapApiOption) || [],
  } as Product;
}

export interface ApiProductImage {
  id: number;
  product_id: number;
  position: number;
  alt?: string;
  src: string;
  width?: number;
  height?: number;
  created_at: string;
  updated_at: string;
  variant_ids?: number[];
}

export interface ApiProductVariant {
  id: number;
  product_id: number;
  title: string;
  option1?: string;
  option2?: string;
  option3?: string;
  sku?: string;
  requires_shipping: boolean;
  taxable: boolean;
  featured_image?: string;
  available: boolean;
  price: string;
  grams: number;
  compare_at_price?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ApiProductOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get all products
 */
export async function getAllProducts(
  options?: { limit?: number; page?: number; fields?: string }
): Promise<ApiProduct[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.page) params.append("page", options.page.toString());
  if (options?.fields) params.append("fields", options.fields);

  const queryString = params.toString();
  const endpoint = queryString ? `/cosmos/products?${queryString}` : "/cosmos/products";
  return apiRequest<ApiProduct[]>(endpoint);
}

/**
 * Search products by query
 */
export async function searchProducts(query: string): Promise<ApiProduct[]> {
  const encodedQuery = encodeURIComponent(query);
  return apiRequest<ApiProduct[]>(`/cosmos/products/search?q=${encodedQuery}`);
}

/**
 * Get a specific product by ID
 */
export async function getProductById(id: number): Promise<ApiProduct> {
  return apiRequest<ApiProduct>(`/cosmos/products/${id}`);
}

/**
 * Get a specific product by handle
 */
export async function getProductByHandle(handle: string): Promise<ApiProduct> {
  // Backend doesn't expose handle endpoint; use search and exact-match by handle
  const candidates = await searchProducts(handle);
  const matched = candidates.find((p) => p.handle === handle);
  if (!matched) {
    throw new Error(`Product with handle '${handle}' not found`);
  }
  return matched;
}

/**
 * Get products filtered by vendor
 */
export async function getProductsByVendor(vendor: string): Promise<ApiProduct[]> {
  const encodedVendor = encodeURIComponent(vendor);
  return apiRequest<ApiProduct[]>(`/cosmos/products?vendor=${encodedVendor}`);
}

/**
 * Get image proxy URL
 */
export function getImageProxyUrl(imageUrl: string): string {
  const encodedUrl = encodeURIComponent(imageUrl);
  return `${API_BASE_URL}/cosmos/image-proxy?url=${encodedUrl}`;
}

/**
 * Helper function to transform API product to internal Product type
 */
export function transformApiProduct(apiProduct: ApiProduct): ApiProduct {
  return {
    ...apiProduct,
    // Ensure consistent field naming
    compare_at_price: apiProduct.compare_at_price,
    in_stock: apiProduct.in_stock,
    review_count: apiProduct.review_count,
  };
}
