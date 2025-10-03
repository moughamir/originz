import { type NextRequest } from "next/server";
import { withAuth, validateRequestBody, validateRequiredFields } from "@/lib/api-wrapper";

type CartItemInput = {
	product_id: string | number; // Handle both numeric IDs from external API and string UUIDs
	variant_id?: string | null;
	quantity: number;
};

async function addCartItem(request: NextRequest, { user, supabase }: any) {
	console.log("[CART] Adding item to cart...");

	const body = await validateRequestBody<CartItemInput>(request);
	const { product_id, variant_id = null, quantity } = body;

	// Validate required fields
	validateRequiredFields(body, ["product_id", "quantity"]);

	if (quantity <= 0) {
		throw new Error("Quantity must be greater than 0");
	}

	// Convert numeric product_id to string for database storage
	const productIdString = String(product_id);

	// Get or create cart
	let cart: { id: string } | null;
	const { data: fetchedCart, error: cartError } = await supabase
		.from("carts")
		.select("id")
		.eq("user_id", user.id)
		.single();

	cart = fetchedCart;

	if (cartError?.code === "PGRST116") {
		// Create new cart if none exists
		const { data: newCart, error: createError } = await supabase
			.from("carts")
			.insert({ user_id: user.id })
			.select("id")
			.single();

		if (createError) throw createError;
		cart = newCart;
	} else if (cartError) {
		throw cartError;
	}

	// Ensure cart exists
	if (!cart) {
		throw new Error("Failed to get or create cart");
	}

	// Check if item already exists in cart
	const { data: existingItem } = await supabase
		.from("cart_items")
		.select("id, quantity")
		.eq("cart_id", cart.id)
		.eq("product_id", productIdString)
		.eq("variant_id", variant_id)
		.single();

	if (existingItem) {
		// Update existing item quantity
		const { data: updatedItem, error: updateError } = await supabase
			.from("cart_items")
			.update({
				quantity: existingItem.quantity + quantity,
				updated_at: new Date().toISOString(),
			})
			.eq("id", existingItem.id)
			.select()
			.single();

		if (updateError) throw updateError;

		console.log(`[CART] Updated cart item:`, updatedItem.id);
		return updatedItem;
	} else {
		// Add new item to cart
		const { data: newItem, error: insertError } = await supabase
			.from("cart_items")
			.insert({
				cart_id: cart.id,
				product_id: productIdString,
				variant_id,
				quantity,
			})
			.select()
			.single();

		if (insertError) throw insertError;

		console.log(`[CART] Added new cart item:`, newItem.id);
		return newItem;
	}
}

export const POST = withAuth(addCartItem);

async function removeCartItem(request: NextRequest, { user, supabase }: any) {
	console.log("[CART] Removing item from cart...");

	const body = await validateRequestBody(request);
	const { cart_id, item_id } = body;

	// Validate required fields
	validateRequiredFields(body, ["cart_id", "item_id"]);

	const { error } = await supabase
		.from("cart_items")
		.delete()
		.eq("cart_id", cart_id)
		.eq("id", item_id);

	if (error) throw error;

	console.log(`[CART] Removed cart item: ${item_id} from cart: ${cart_id}`);
	return { message: "Item removed successfully" };
}

export const DELETE = withAuth(removeCartItem);

async function updateCartItemQuantity(request: NextRequest, { user, supabase }: any) {
	console.log("[CART] Updating item quantity in cart...");

	const body = await validateRequestBody(request);
	const { cart_id, item_id, quantity } = body;

	// Validate required fields
	validateRequiredFields(body, ["cart_id", "item_id", "quantity"]);

	if (quantity < 0) {
		throw new Error("Quantity cannot be negative");
	}

	const { data, error } = await supabase
		.from("cart_items")
		.update({ quantity, updated_at: new Date().toISOString() })
		.eq("cart_id", cart_id)
		.eq("id", item_id)
		.select()
		.single();

	if (error) throw error;

	console.log(
		`[CART] Updated quantity for item: ${item_id} in cart: ${cart_id} to ${quantity}`,
	);
	return data;
}

export const PUT = withAuth(updateCartItemQuantity);
