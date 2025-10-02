/**
 * Enhanced API client for Cosmos API integration
 * Includes comprehensive error handling, retry logic, and type safety
 */

import { decode } from "msgpack-javascript";
import { API_CONFIG, LIMITS } from "./constants";
import { serverEnv } from "./env-validation";
import {
	ApiClientError,
	logError,
	createApiResponse,
	type ApiResponse,
} from "./errors";
import type { ApiProduct } from "./types";

// Enhanced API request function with retry logic and proper error handling
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	// Resolve server env at call time to avoid import-time crashes
	const { PRODUCT_STREAM_API, PRODUCT_STREAM_X_KEY } = serverEnv;

	if (!PRODUCT_STREAM_API || !PRODUCT_STREAM_X_KEY) {
		throw new ApiClientError(
			"API configuration missing: PRODUCT_STREAM_API or PRODUCT_STREAM_X_KEY not configured",
			500,
			"Configuration Error",
			endpoint,
		);
	}

	const base = PRODUCT_STREAM_API.replace(/\/$/, "");
	const url = `${base}/cosmos${endpoint}`;
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

	let lastError: Error = new Error("Unknown error");

	// Retry logic
	for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
		try {
			const response = await fetch(url, {
				...options,
				headers: {
					...API_CONFIG.HEADERS,
					...options.headers,
					"X-API-KEY": PRODUCT_STREAM_X_KEY,
					Accept: "application/x-msgpack, application/json",
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorBody = await response.text();
				throw new ApiClientError(
					`API request failed: ${errorBody}`,
					response.status,
					response.statusText,
					endpoint,
				);
			}

			const contentType = response.headers.get("Content-Type");
			if (contentType && contentType.includes("application/x-msgpack")) {
				const arrayBuffer = await response.arrayBuffer();
				return decode(arrayBuffer) as T;
			}

			return await response.json();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error("Unknown error");

			// Don't retry on client errors (4xx) except 429 (rate limit)
			if (error instanceof ApiClientError && error.status) {
				if (error.status >= 400 && error.status < 500 && error.status !== 429) {
					break;
				}
			}

			// Wait before retry (exponential backoff)
			if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
				const delay = API_CONFIG.RETRY_DELAY * 2 ** (attempt - 1);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	clearTimeout(timeoutId);

	// Log the final error
	logError(lastError, {
		endpoint,
		url,
		attempts: API_CONFIG.RETRY_ATTEMPTS,
	});

	throw lastError;
}

/**
 * Get all products with backward compatibility
 * Returns a plain array for backward compatibility while also providing enhanced error handling
 */
export async function getAllProducts(options?: {
	limit?: number;
	page?: number;
}): Promise<ApiProduct[]> {
	// Validate parameters
	const limit =
		options?.limit && options.limit > 0
			? Math.min(options.limit, 100)
			: LIMITS.PRODUCTS_PER_PAGE;
	const page = options?.page && options.page > 0 ? options.page : 1;

	const params = new URLSearchParams();
	params.append("limit", limit.toString());
	params.append("page", page.toString());

	const endpoint = `/products?${params.toString()}`;

	try {
		const data = await apiRequest<{ products: ApiProduct[] }>(endpoint);
		const products = Array.isArray(data.products) ? data.products : [];
		// Force all products to in_stock: true
		return products.map((p) => ({ ...p, in_stock: true }));
	} catch (error) {
		logError(error instanceof Error ? error : new Error("Unknown error"), {
			endpoint,
			limit,
			page,
		});

		// Return empty array for backward compatibility
		return [];
	}
}

/**
 * Get all products with enhanced error handling (new API)
 */
export async function getAllProductsWithResponse(options?: {
	limit?: number;
	page?: number;
}): Promise<ApiResponse<ApiProduct[]>> {
	// Validate parameters
	const limit =
		options?.limit && options.limit > 0
			? Math.min(options.limit, 100)
			: LIMITS.PRODUCTS_PER_PAGE;
	const page = options?.page && options.page > 0 ? options.page : 1;

	const params = new URLSearchParams();
	params.append("limit", limit.toString());
	params.append("page", page.toString());

	const endpoint = `/products?${params.toString()}`;

	try {
		const data = await apiRequest<{ products: ApiProduct[] }>(endpoint);
		const products = Array.isArray(data.products) ? data.products : [];

		return createApiResponse(products);
	} catch (error) {
		const apiError = {
			message:
				error instanceof ApiClientError
					? error.message
					: "Failed to fetch products",
			status: error instanceof ApiClientError ? error.status : undefined,
			endpoint,
			timestamp: new Date().toISOString(),
		};

		return createApiResponse<ApiProduct[]>([], apiError);
	}
}

/**
 * Search products by query
 */
export async function searchProducts(query: string): Promise<ApiProduct[]> {
	const encodedQuery = encodeURIComponent(query);
	try {
		const data = await apiRequest<{ products: ApiProduct[] }>(
			`/products/search?q=${encodedQuery}`,
		);
		const products = Array.isArray(data.products) ? data.products : [];
		return products.map((p) => ({ ...p, in_stock: true }));
	} catch (error) {
		console.warn(`[API] Failed to search products for "${query}":`, error);
		return [];
	}
}

/**
 * Get a specific product by ID
 */
export async function getProductById(id: string): Promise<ApiProduct | null> {
	try {
		const data = await apiRequest<{ product: ApiProduct }>(`/products/${id}`);
		const product = data.product || null;
		return product ? { ...product, in_stock: true } : null;
	} catch (error) {
		console.warn(`[API] Failed to fetch product by ID "${id}":`, error);
		return null;
	}
}

/**
 * Get a specific product by handle
 */
export async function getProductByHandle(
	handle: string,
): Promise<ApiProduct | null> {
	try {
		const data = await apiRequest<{ product: ApiProduct }>(
			`/products/${handle}`,
		);
		const product = data.product || null;
		return product ? { ...product, in_stock: true } : null;
	} catch (error) {
		console.warn(`[API] Failed to fetch product by handle "${handle}":`, error);
		return null;
	}
}

/**
 * Get products filtered by vendor
 */
export async function getProductsByVendor(
	vendor: string,
): Promise<ApiProduct[]> {
	const encodedVendor = encodeURIComponent(vendor);
	try {
		const data = await apiRequest<{ products: ApiProduct[] }>(
			`/products?vendor=${encodedVendor}`,
		);
		const products = Array.isArray(data.products) ? data.products : [];
		return products.map((p) => ({ ...p, in_stock: true }));
	} catch (error) {
		console.warn(
			`[API] Failed to fetch products for vendor "${vendor}":`,
			error,
		);
		return [];
	}
}

/**
 * Get products from a collection by handle
 */
export async function getCollectionByHandle(
	handle: string,
	options?: {
		limit?: number;
		page?: number;
		fields?: string;
	},
): Promise<ApiProduct[]> {
	const params = new URLSearchParams();
	if (options?.limit) params.append("limit", options.limit.toString());
	if (options?.page) params.append("page", options.page.toString());
	if (options?.fields) params.append("fields", options.fields);

	const queryString = params.toString();
	const endpoint = `/collections/${handle}${
		queryString ? `?${queryString}` : ""
	}`;

	try {
		const data = await apiRequest<{ products: ApiProduct[] }>(endpoint);
		const products = Array.isArray(data.products) ? data.products : [];
		return products.map((p) => ({ ...p, in_stock: true }));
	} catch (error) {
		console.warn(
			`[API] Failed to fetch collection for handle "${handle}":`,
			error,
		);
		return [];
	}
}

/**
 * Get image proxy URL
 */
// export function getImageProxyUrl(imageUrl: string): string {
//   const encodedUrl = encodeURIComponent(imageUrl);
//   return `${SITE_CONFIG.api}/image-proxy?url=${encodedUrl}`;
// }
