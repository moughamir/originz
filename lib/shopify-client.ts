import { createAdminApiClient } from "@shopify/admin-api-client";
import { env } from "@/lib/env-validation";

// SECURITY: Only use server-side environment variables - NEVER expose tokens to client
function getShopifyConfig() {
	const tok = env.SHOPIFY_ACCESS_TOKEN ?? env.SHOPIFY_TOKEN;
	if (!tok || !env.SHOPIFY_SHOP || !env.SHOPIFY_SHOP_NAME) {
		throw new Error(
			"Shopify configuration is missing. Provide SHOPIFY_ACCESS_TOKEN (or SHOPIFY_TOKEN), SHOPIFY_SHOP, and SHOPIFY_SHOP_NAME.",
		);
	}
	return {
    shopDomain: env.SHOPIFY_SHOP,
    shopName: env.SHOPIFY_SHOP_NAME,
    accessToken: tok,
	};
}

// Lazily initialize the Shopify Admin API client to avoid import-time env validation
let _shopifyAdmin: ReturnType<typeof createAdminApiClient> | null = null;
let _shopDomain: string | null = null;
let _accessToken: string | null = null;

export function getShopifyAdmin() {
  if (_shopifyAdmin) return _shopifyAdmin;
  const { shopDomain, accessToken } = getShopifyConfig();
  _shopDomain = shopDomain;
  _accessToken = accessToken;
  _shopifyAdmin = createAdminApiClient({
    storeDomain: shopDomain,
    accessToken: accessToken,
    apiVersion: "2025-07",
  });
  return _shopifyAdmin;
}

// Helper function to get shop domain without protocol
export const getShopDomain = () => {
	const domain = _shopDomain ?? getShopifyConfig().shopDomain;
	if (!domain) {
		throw new Error("Shop domain not configured");
	}
	return domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
};

// Helper function to get access token
export const getAccessToken = () => {
  return _accessToken ?? getShopifyConfig().accessToken;
};

// Type definitions for our draft order creation
export interface DraftOrderLineItem {
  title?: string;
  variant_id?: string | number;
  product_id?: string | number;
  quantity: number;
  price?: string | number;
  sku?: string;
  grams?: number;
  taxable?: boolean;
  requires_shipping?: boolean;
}

export interface DraftOrderCustomer {
  id?: string | number;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  accepts_marketing?: boolean;
}

export interface DraftOrderShippingAddress {
  first_name?: string;
  last_name?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

export interface ShopifyDraftOrder {
  id: string;
  name: string;
  invoiceUrl?: string;
  order?: { id: string };
  customer?: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  currencyCode: string;
  note?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DraftOrderInput {
  line_items: DraftOrderLineItem[];
  customer?: DraftOrderCustomer;
  shipping_address?: DraftOrderShippingAddress;
  billing_address?: DraftOrderShippingAddress;
  tags?: string;
  note?: string;
  email?: string;
  currency?: string;
  use_customer_default_address?: boolean;
  tax_lines?: Array<{
    title: string;
    rate: number;
    price: string;
  }>;
  shipping_lines?: Array<{
    title: string;
    price: string;
    code?: string;
  }>;
}

// Helpers to format Shopify GraphQL IDs
function toGid(
  type: "Product" | "ProductVariant" | "DraftOrder",
  id: string | number | undefined
) {
  if (!id) return undefined;
  const str = String(id);
  return str.startsWith("gid://") ? str : `gid://shopify/${type}/${str}`;
}

// Map our REST-like input to Shopify GraphQL DraftOrderInput
function toGraphqlDraftOrderInput(input: DraftOrderInput) {
  const lineItems = (input.line_items || []).map((li) => ({
    ...(li.variant_id
      ? { variantId: toGid("ProductVariant", li.variant_id) }
      : {}),
    quantity: li.quantity,
    ...(li.title ? { title: li.title } : {}),
    // originalUnitPrice lets us set a custom price per line item
    ...(li.price !== undefined ? { originalUnitPrice: String(li.price) } : {}),
  }));

  const customer = input.customer
    ? {
        ...(input.customer.email ? { email: input.customer.email } : {}),
        ...(input.customer.first_name
          ? { firstName: input.customer.first_name }
          : {}),
        ...(input.customer.last_name
          ? { lastName: input.customer.last_name }
          : {}),
        ...(input.customer.phone ? { phone: input.customer.phone } : {}),
      }
    : undefined;

  const shippingAddress = input.shipping_address
    ? {
        address1: input.shipping_address.address1,
        city: input.shipping_address.city,
        zip: input.shipping_address.zip,
        country: input.shipping_address.country,
        ...(input.shipping_address.first_name
          ? { firstName: input.shipping_address.first_name }
          : {}),
        ...(input.shipping_address.last_name
          ? { lastName: input.shipping_address.last_name }
          : {}),
        ...(input.shipping_address.phone
          ? { phone: input.shipping_address.phone }
          : {}),
        ...(input.shipping_address.province
          ? { province: input.shipping_address.province }
          : {}),
      }
    : undefined;

  const billingAddress = input.billing_address
    ? {
        address1: input.billing_address.address1,
        city: input.billing_address.city,
        zip: input.billing_address.zip,
        country: input.billing_address.country,
        ...(input.billing_address.first_name
          ? { firstName: input.billing_address.first_name }
          : {}),
        ...(input.billing_address.last_name
          ? { lastName: input.billing_address.last_name }
          : {}),
        ...(input.billing_address.phone
          ? { phone: input.billing_address.phone }
          : {}),
        ...(input.billing_address.province
          ? { province: input.billing_address.province }
          : {}),
      }
    : undefined;

  return {
    lineItems,
    ...(customer ? { customer } : {}),
    ...(shippingAddress ? { shippingAddress } : {}),
    ...(billingAddress ? { billingAddress } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.note ? { note: input.note } : {}),
    useCustomerDefaultAddress: Boolean(input.use_customer_default_address),
    // tags: Shopify GraphQL expects [String], but we stored it as a single string
    ...(input.tags
      ? {
          tags: input.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }
      : {}),
  };
}

// Draft order creation function using the modern API client
export async function createDraftOrder(orderData: DraftOrderInput) {
  try {
    const query = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            name
            invoiceUrl
            order { id }
            customer { id email firstName lastName }
            totalPrice
            subtotalPrice
            totalTax
            currencyCode
            tags
            createdAt
            updatedAt
          }
          userErrors { field message }
        }
      }
    `;

    const variables = { input: toGraphqlDraftOrderInput(orderData) } as const;

    const response = await getShopifyAdmin().request(query, { variables });

    type DraftOrderCreateResp = {
      draftOrderCreate?: {
        draftOrder: ShopifyDraftOrder;
        userErrors?: Array<{ field?: string; message: string }>;
      };
      errors?: unknown;
      extensions?: unknown;
    };

    const raw = response as { data?: unknown } | unknown;
    const data = (
      raw &&
      typeof raw === "object" &&
      "data" in (raw as Record<string, unknown>)
        ? (raw as { data?: unknown }).data
        : raw
    ) as DraftOrderCreateResp | undefined;

    const draftOrderCreate = data?.draftOrderCreate;

    if (!draftOrderCreate) {
      const errors =
        data?.errors ??
        (data as { extensions?: unknown } | undefined)?.extensions ??
        data;
      throw new Error(
        `Shopify draftOrderCreate returned no data: ${JSON.stringify(errors)}`
      );
    }

    if (draftOrderCreate.userErrors && draftOrderCreate.userErrors.length > 0) {
      throw new Error(
        `Shopify API errors: ${draftOrderCreate.userErrors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    return draftOrderCreate.draftOrder;
  } catch (error) {
    console.error("Error creating draft order:", error);
    throw new Error(
      `Failed to create draft order: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Send invoice function
export async function sendDraftOrderInvoice(
  draftOrderId: string,
  invoiceData?: {
    to?: string;
    from?: string;
    subject?: string;
    customMessage?: string;
  }
) {
  try {
    const mutation = `
      mutation draftOrderInvoiceSend($id: ID!, $email: EmailInput) {
        draftOrderInvoiceSend(id: $id, email: $email) {
          draftOrder {
            id
            invoiceUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await getShopifyAdmin().request(mutation, {
      variables: {
        id: toGid("DraftOrder", draftOrderId)!,
        email: invoiceData
          ? {
              to: invoiceData.to,
              from: invoiceData.from,
              subject: invoiceData.subject,
              customMessage: invoiceData.customMessage,
            }
          : undefined,
      },
    });

    type DraftOrderInvoiceSendResp = {
      draftOrderInvoiceSend?: {
        draftOrder: ShopifyDraftOrder;
        userErrors?: Array<{ field?: string; message: string }>;
      };
      errors?: unknown;
      extensions?: unknown;
    };

    const raw = response as { data?: unknown } | unknown;
    const data = (
      raw &&
      typeof raw === "object" &&
      "data" in (raw as Record<string, unknown>)
        ? (raw as { data?: unknown }).data
        : raw
    ) as DraftOrderInvoiceSendResp | undefined;

    const draftOrderInvoiceSend = data?.draftOrderInvoiceSend;

    if (!draftOrderInvoiceSend) {
      const errors =
        data?.errors ??
        (data as { extensions?: unknown } | undefined)?.extensions ??
        data;
      throw new Error(
        `Shopify draftOrderInvoiceSend returned no data: ${JSON.stringify(
          errors
        )}`
      );
    }

    if (
      draftOrderInvoiceSend.userErrors &&
      draftOrderInvoiceSend.userErrors.length > 0
    ) {
      throw new Error(
        `Shopify API errors: ${draftOrderInvoiceSend.userErrors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    return draftOrderInvoiceSend.draftOrder;
  } catch (error) {
    console.error("Error sending draft order invoice:", error);
    throw new Error(
      `Failed to send draft order invoice: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Legacy support: Simplified draft order creation for backward compatibility
export async function createSimpleDraftOrder({
  productTitle,
  variantId,
  productId,
  price,
  quantity,
  customerEmail,
  tags,
}: {
  productTitle: string;
  variantId?: string;
  productId?: string;
  price: number;
  quantity: number;
  customerEmail?: string;
  tags?: string;
}) {
  const orderData: DraftOrderInput = {
    line_items: [
      {
        title: productTitle,
        ...(variantId && { variant_id: variantId }),
        ...(productId && { product_id: productId }),
        quantity: quantity,
        price: price.toFixed(2),
      },
    ],
    ...(customerEmail && {
      customer: { email: customerEmail },
      email: customerEmail,
    }),
    ...(tags && { tags }),
    use_customer_default_address: true,
  };

  return await createDraftOrder(orderData);
}
