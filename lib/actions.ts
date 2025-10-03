"use server";

import { redirect } from "next/navigation";
import { logError } from "@/lib/errors";
import { LIMITS, ERROR_MESSAGES } from "@/lib/constants";
import { generateInvoiceNumber } from "@/lib/utils/invoice";

/**
 * Server Action suitable for use as a <form action={buyNowAction}> handler.
 * Expects FormData fields matching the Buy Now button's hidden inputs.
 * Enhanced with comprehensive validation and error handling.
 * Now supports UTM parameters and generates invoice numbers like the PHP implementation.
 */
export async function buyNowAction(formData: FormData): Promise<never> {
	try {
		// Extract and validate form data
		const productId = String(formData.get("productId") || "").trim();
		const variantId = String(formData.get("variantId") || "").trim();
		const price = Number(formData.get("price"));
		const quantity = Number(formData.get("quantity"));
		const productTitle = String(formData.get("productTitle") || "").trim();
		const productImage = String(formData.get("productImage") || "").trim();
		const customerEmail = String(formData.get("customerEmail") || "").trim();
		
		// Extract UTM parameters (matching PHP implementation)
		const utmSource = String(formData.get("utm_source") || "google").trim();
		const utmMedium = String(formData.get("utm_medium") || "cpc").trim();
		const utmCampaign = String(formData.get("utm_campaign") || "buy-now").trim();

		// Enhanced validation
		if (!productId) {
			throw new Error("Product ID is required");
		}
		if (!variantId) {
			throw new Error("Variant ID is required");
		}
		if (!Number.isFinite(price) || price <= 0) {
			throw new Error("Valid price is required");
		}
		if (
			!Number.isFinite(quantity) ||
			quantity < LIMITS.MIN_QUANTITY_PER_ITEM ||
			quantity > LIMITS.MAX_QUANTITY_PER_ITEM
		) {
			throw new Error(
				`Quantity must be between ${LIMITS.MIN_QUANTITY_PER_ITEM} and ${LIMITS.MAX_QUANTITY_PER_ITEM}`,
			);
		}
		if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
			throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
		}

		// Generate invoice number using utility function
		const invoiceNumber = generateInvoiceNumber();

		// Prepare the payload for the /api/draft-orders endpoint
		const payload = {
			lineItems: [
				{
					productTitle: invoiceNumber, // Use generated invoice number as title (matching PHP)
					variantId: variantId,
					productId: productId,
					price: price,
					quantity: quantity,
				},
			],
			customerEmail: customerEmail || undefined,
			tags: `${utmSource},${utmMedium},${utmCampaign}`, // Combine UTMs into tags
		};

		const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/draft-orders`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to create draft order via API.");
		}

		const responseData = await response.json();
		const draftOrder = responseData.draftOrder;

		if (!draftOrder?.invoiceUrl) {
			throw new Error("No invoice URL returned from draft order API.");
		}

		// Append all tracking parameters to the invoice URL (matching PHP implementation)
		const finalUrl = new URL(draftOrder.invoiceUrl);
		
		// UTM parameters
		finalUrl.searchParams.set("utm_source", utmSource);
		finalUrl.searchParams.set("utm_medium", utmMedium);
		finalUrl.searchParams.set("utm_campaign", utmCampaign);
		
		// Product data for Cloudflare Worker
		if (productTitle) {
			finalUrl.searchParams.set("product_title", productTitle);
		}
		if (productImage) {
			finalUrl.searchParams.set("product_image", productImage);
		}

		// Redirect to the invoice URL for payment
		redirect(finalUrl.toString());
	} catch (error) {
		logError(error instanceof Error ? error : new Error("Unknown error"), {
			context: "buyNowAction",
			formData: Object.fromEntries(formData.entries()),
		});

		// Re-throw with user-friendly message
		throw new Error(
			error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR,
		);
	}
}
