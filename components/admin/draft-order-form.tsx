"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createDraftOrderWithMessagePack, benchmarkSerialization } from "@/lib/msgpack-checkout";
import { useFormTracking, useJourneyTracking } from "@/lib/experience-tracking/hooks";

interface LineItem {
	variantId: string;
	productId?: string;
	title?: string;
	quantity: number;
	price?: string;
	sku?: string;
	grams?: number;
	taxable?: boolean;
	requiresShipping?: boolean;
}

interface ShippingAddress {
	first_name: string;
	last_name: string;
	company?: string;
	address1: string;
	address2?: string;
	city: string;
	province: string;
	country: string;
	zip: string;
	phone?: string;
}

interface DraftOrderFormState {
	lineItems: LineItem[];
	customerEmail: string;
	customerFirstName: string;
	customerLastName: string;
	customerPhone: string;
	shippingAddress: ShippingAddress;
	note: string;
	tags: string;
	sendInvoice: boolean;
}

export function DraftOrderForm() {
	// Experience tracking hooks
	const { trackFormSubmit } = useFormTracking('draft-order-form');
	const { startStep, completeStep } = useJourneyTracking('custom');
	
	const [formData, setFormData] = useState<DraftOrderFormState>({
		lineItems: [{ variantId: "", quantity: 1, price: "" }],
		customerEmail: "",
		customerFirstName: "",
		customerLastName: "",
		customerPhone: "",
		shippingAddress: {
			first_name: "",
			last_name: "",
			address1: "",
			city: "",
			province: "",
			zip: "",
			country: "US",
		},
		note: "",
		tags: "",
		sendInvoice: false,
	});

	const [status, setStatus] = useState({
		loading: false,
		error: null as string | null,
		success: false,
		invoiceUrl: null as string | null,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Track form submission start
		startStep('draft-order-form-submit', 1, {
			lineItemsCount: formData.lineItems.length,
			hasShippingAddress: !!formData.shippingAddress.address1,
			hasCustomerEmail: !!formData.customerEmail
		});
		
		setStatus({ loading: true, error: null, success: false, invoiceUrl: null });

		// Show loading toast
		toast.loading("Creating draft order...", {
			id: "draft-order-creation",
		});

		try {
			const orderData = {
				lineItems: formData.lineItems,
				customerEmail: formData.customerEmail,
				customerFirstName: formData.customerFirstName,
				customerLastName: formData.customerLastName,
				customerPhone: formData.customerPhone,
				shippingAddress: formData.shippingAddress,
				note: formData.note,
				tags: formData.tags,
				sendInvoice: formData.sendInvoice,
				invoiceData: {
					subject: `Invoice for ${formData.customerFirstName} ${formData.customerLastName}`,
					customMessage: "Thank you for your order!",
				},
			};

			// Benchmark the serialization to see the benefits
			const benchmark = benchmarkSerialization(orderData);
			console.log(`📊 Draft Order Serialization Benchmark:`, benchmark);
			
			// Show benchmark info in development
			if (process.env.NODE_ENV === "development") {
				toast.info(`Using ${benchmark.winner.toUpperCase()} - ${benchmark.improvement}`, {
					id: "benchmark-info",
					duration: 2000,
				});
			}

			// Use MessagePack-optimized request
			const data = await createDraftOrderWithMessagePack(orderData) as {
				success: boolean;
				error?: string;
				draftOrder?: {
					invoiceUrl?: string;
					[key: string]: unknown;
				};
				invoiceSent?: boolean;
			};

			if (!data.success) {
				throw new Error(data.error || "Failed to create draft order");
			}

			toast.dismiss("draft-order-creation");
			toast.success("Draft order created successfully!", {
				description: data.invoiceSent
					? "Invoice has been sent to the customer"
					: "Invoice URL generated",
			});
			
			// Track successful form submission
			trackFormSubmit(true);
			completeStep('draft-order-form-submit');

			setStatus({
				loading: false,
				success: true,
				invoiceUrl: data.draftOrder?.invoiceUrl || null,
				error: null,
			});
		} catch (error) {
			toast.dismiss("draft-order-creation");
			toast.error("Failed to create draft order", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
			
			// Track failed form submission
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			trackFormSubmit(false, errorMessage);

			setStatus({
				loading: false,
				error: errorMessage,
				success: false,
				invoiceUrl: null,
			});
		}
	};

	const addLineItem = () => {
		setFormData((prev) => ({
			...prev,
			lineItems: [...prev.lineItems, { variantId: "", quantity: 1, price: "" }],
		}));
	};

	const updateLineItem = (
		index: number,
		field: keyof LineItem,
		value: string | number | boolean,
	) => {
		const updatedItems = [...formData.lineItems];
		updatedItems[index] = {
			...updatedItems[index],
			[field]: value,
		};
		setFormData((prev) => ({ ...prev, lineItems: updatedItems }));
	};

	const removeLineItem = (index: number) => {
		if (formData.lineItems.length > 1) {
			const updatedItems = formData.lineItems.filter((_, i) => i !== index);
			setFormData((prev) => ({ ...prev, lineItems: updatedItems }));
		}
	};

	const updateAddress = (field: keyof ShippingAddress, value: string) => {
		setFormData((prev) => ({
			...prev,
			shippingAddress: { ...prev.shippingAddress, [field]: value },
		}));
	};

	return (
		<div className="container mx-auto p-8 max-w-4xl">
			<h1 className="text-3xl font-bold mb-8">Create Shopify Draft Order</h1>

			{status.success && status.invoiceUrl && (
				<div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
					<p className="text-green-700">
						Draft order created successfully!{" "}
						<a
							href={status.invoiceUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="font-semibold underline hover:text-green-800"
						>
							View Invoice
						</a>
					</p>
				</div>
			)}

			{status.error && (
				<div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
					<p className="text-red-700">Error: {status.error}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Customer Information */}
				<div className="bg-white p-6 rounded-lg border border-gray-200">
					<h2 className="text-xl font-semibold mb-4">Customer Information</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Email *</label>
							<input
								type="email"
								required
								value={formData.customerEmail}
								onChange={(e) =>
									setFormData({ ...formData, customerEmail: e.target.value })
								}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Phone</label>
							<input
								type="tel"
								value={formData.customerPhone}
								onChange={(e) =>
									setFormData({ ...formData, customerPhone: e.target.value })
								}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								First Name
							</label>
							<input
								type="text"
								value={formData.customerFirstName}
								onChange={(e) =>
									setFormData({
										...formData,
										customerFirstName: e.target.value,
									})
								}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								Last Name
							</label>
							<input
								type="text"
								value={formData.customerLastName}
								onChange={(e) =>
									setFormData({ ...formData, customerLastName: e.target.value })
								}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					</div>
				</div>

				{/* Line Items */}
				<div className="bg-white p-6 rounded-lg border border-gray-200">
					<h2 className="text-xl font-semibold mb-4">Line Items</h2>
					{formData.lineItems.map((item, index) => (
						<div
							key={index}
							className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border border-gray-100 rounded-lg"
						>
							<div>
								<label className="block text-sm font-medium mb-1">
									Variant ID *
								</label>
								<input
									type="text"
									placeholder="Variant ID"
									required
									value={item.variantId}
									onChange={(e) =>
										updateLineItem(index, "variantId", e.target.value)
									}
									className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Product Title
								</label>
								<input
									type="text"
									placeholder="Product Title"
									value={item.title || ""}
									onChange={(e) =>
										updateLineItem(index, "title", e.target.value)
									}
									className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Quantity *
								</label>
								<input
									type="number"
									placeholder="Qty"
									required
									min="1"
									value={item.quantity}
									onChange={(e) =>
										updateLineItem(index, "quantity", parseInt(e.target.value))
									}
									className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Price (optional)
								</label>
								<input
									type="number"
									step="0.01"
									placeholder="0.00"
									value={item.price || ""}
									onChange={(e) =>
										updateLineItem(index, "price", e.target.value)
									}
									className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div className="flex items-end">
								{index === formData.lineItems.length - 1 ? (
									<Button
										type="button"
										onClick={addLineItem}
										variant="outline"
										className="w-full"
									>
										+ Add Item
									</Button>
								) : (
									<Button
										type="button"
										onClick={() => removeLineItem(index)}
										variant="outline"
										className="w-full text-red-600 hover:text-red-700"
									>
										Remove
									</Button>
								)}
							</div>
						</div>
					))}
				</div>

				{/* Shipping Address */}
				<div className="bg-white p-6 rounded-lg border border-gray-200">
					<h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">
								First Name *
							</label>
							<input
								type="text"
								required
								value={formData.shippingAddress.first_name}
								onChange={(e) => updateAddress("first_name", e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								Last Name *
							</label>
							<input
								type="text"
								required
								value={formData.shippingAddress.last_name}
								onChange={(e) => updateAddress("last_name", e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm font-medium mb-1">
								Address *
							</label>
							<input
								type="text"
								required
								value={formData.shippingAddress.address1}
								onChange={(e) => updateAddress("address1", e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">City *</label>
							<input
								type="text"
								required
								value={formData.shippingAddress.city}
								onChange={(e) => updateAddress("city", e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">State *</label>
							<input
								type="text"
								required
								value={formData.shippingAddress.province}
								onChange={(e) => updateAddress("province", e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								Zip Code *
							</label>
							<input
								type="text"
								required
								value={formData.shippingAddress.zip}
								onChange={(e) => updateAddress("zip", e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Country</label>
							<select
								value={formData.shippingAddress.country}
								onChange={(e) => updateAddress("country", e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="US">United States</option>
								<option value="CA">Canada</option>
								<option value="GB">United Kingdom</option>
								<option value="AU">Australia</option>
								<option value="DE">Germany</option>
								<option value="FR">France</option>
							</select>
						</div>
					</div>
				</div>

				{/* Additional Information */}
				<div className="bg-white p-6 rounded-lg border border-gray-200">
					<h2 className="text-xl font-semibold mb-4">Additional Information</h2>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1">
								Order Note
							</label>
							<textarea
								value={formData.note}
								onChange={(e) =>
									setFormData({ ...formData, note: e.target.value })
								}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								rows={3}
								placeholder="Any special instructions or notes..."
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								Tags (comma-separated)
							</label>
							<input
								type="text"
								value={formData.tags}
								onChange={(e) =>
									setFormData({ ...formData, tags: e.target.value })
								}
								className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="priority, wholesale, etc."
							/>
						</div>
						<div className="flex items-center">
							<input
								type="checkbox"
								id="sendInvoice"
								checked={formData.sendInvoice}
								onChange={(e) =>
									setFormData({ ...formData, sendInvoice: e.target.checked })
								}
								className="mr-2"
							/>
							<label htmlFor="sendInvoice" className="text-sm font-medium">
								Send invoice email to customer
							</label>
						</div>
					</div>
				</div>

				{/* Submit Button */}
				<Button
					type="submit"
					disabled={status.loading}
					className="w-full bg-blue-600 text-white py-3 text-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
					size="lg"
				>
					{status.loading ? "Creating Draft Order..." : "Create Draft Order"}
				</Button>
			</form>
		</div>
	);
}
