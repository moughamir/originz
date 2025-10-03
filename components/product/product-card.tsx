"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BuyNowButton } from "@/components/product/buy-now-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import {
  useClickTracking,
  useProductTracking,
} from "@/lib/experience-tracking/hooks";

import type {
  ApiProduct,
  ApiProductOption,
  ApiProductVariant,
} from "@/lib/types";
import { formatPrice, stripHtml } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useProductVariants } from "@/hooks/use-product-variants";

interface ProductCardProps {
  product: ApiProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { 
    variants,
    options,
    selectedVariant,
    selectedOptions,
    handleOptionChange 
  } = useProductVariants(product);
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Experience tracking hooks
  const { trackProductView, trackProductClick, trackAddToCart } =
    useProductTracking();
  const trackAddToCartClick = useClickTracking("product-add-to-cart", {
    productId: product.id,
    productTitle: product.title,
    price: selectedVariant?.price || product.price,
    inStock: selectedVariant?.available || product.in_stock,
  });
  const trackBuyNowClick = useClickTracking("product-buy-now", {
    productId: product.id,
    productTitle: product.title,
    price: selectedVariant?.price || product.price,
  });

  const discountPercentage = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.price) /
          product.compare_at_price) *
          100
      )
    : 0;

  // Track product view on component mount
  useEffect(() => {
    trackProductView(product.id.toString(), {
      name: product.title,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      inStock: product.in_stock,
      vendor: product.vendor,
      productType: product.product_type,
      tags: product.tags,
      hasDiscount: discountPercentage > 0,
      discountPercentage,
    });
  }, [
    product.id,
    product.title,
    product.price,
    product.compare_at_price,
    product.in_stock,
    product.vendor,
    product.product_type,
    product.tags,
    discountPercentage,
    trackProductView,
  ]);

  const hasVariants = product.variants && product.variants.length > 1;
  const hasMultipleImages = product.images && product.images.length > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    // Track add to cart event
    trackAddToCart(product.id.toString(), 1, selectedVariant?.price || product.price, {
      name: product.title,
      vendor: product.vendor,
      productType: product.product_type,
      inStock: selectedVariant?.available || product.in_stock,
      variantId: selectedVariant?.id,
    });

    // Track click event
    trackAddToCartClick(e);

    // Allow adding out-of-stock items and handle variants in cart-context
    addItem(product, selectedVariant, 1);
  };

  const handleProductClick = () => {
    // Track product click
    trackProductClick(product.id.toString(), {
      name: product.title,
      price: product.price,
      clickLocation: "product-card",
    });
  };

  const currentImage =
    product.images && product.images.length > 0
      ? product.images[currentImageIndex].src
      : "/og.png";

  const shortDescription = stripHtml(product.body_html || "").slice(0, 100);

  return (
    <div
      className="group relative bg-card hover:shadow-xl border rounded-lg overflow-hidden text-card-foreground transition-all duration-300"
      onMouseEnter={() => hasMultipleImages && setCurrentImageIndex(1)}
      onMouseLeave={() => hasMultipleImages && setCurrentImageIndex(0)}
    >
      {/* Product Image */}
      <Link
        href={`/products/${product.handle}`}
        className="block"
        onClick={handleProductClick}
      >
        <div className="relative bg-gray-100 aspect-square overflow-hidden">
          <Image
            src={currentImage}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={false}
            loading="lazy"
          />
          {discountPercentage > 0 && (
            <Badge variant="destructive" className="top-2 left-2 z-10 absolute">
              -{discountPercentage}%
            </Badge>
          )}
          {!product.in_stock && (
            <div className="z-10 absolute inset-0 flex justify-center items-center bg-black/40">
              <Badge variant="secondary" className="bg-white text-black">
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Quick Actions Overlay */}
          <div className="right-0 bottom-0 left-0 absolute bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 p-4 transition-opacity duration-300">
            <div className="flex gap-2">
              <div onClick={() => trackBuyNowClick()}>
                <BuyNowButton
                  product={product}
                  variant={selectedVariant}
                  quantity={1}
                  style="minimal"
                  size="sm"
                  className="flex-1 bg-white/90 hover:bg-white border-none text-black"
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold group-hover:text-primary line-clamp-1 transition-colors">
            <Link
              href={`/products/${product.handle}`}
              onClick={handleProductClick}
            >
              {product.title}
            </Link>
          </h3>
          {shortDescription && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {shortDescription}...
            </p>
          )}
        </div>

        {hasVariants && (
          <div>
            <Select
              onValueChange={(value) => {
                const variant = product.variants?.find((v) => v.id === value);
                setSelectedVariant(variant);
              }}
              defaultValue={selectedVariant?.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a variant" />
              </SelectTrigger>
              <SelectContent>
                {product.variants?.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price and Actions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {formatPrice(selectedVariant?.price || product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-muted-foreground text-sm line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Desktop: Hidden buttons that appear on hover */}
          <div className="hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div onClick={() => {}} className="flex-1">
              <BuyNowButton
                product={product}
                variant={selectedVariant}
                quantity={1}
                style="minimal"
                size="sm"
                className="w-full"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile: Always visible buttons */}
          <div className="md:hidden flex gap-2">
            <Button size="sm" variant="default" className="flex-1" asChild>
              <Link
                href={`/products/${product.handle}`}
                onClick={handleProductClick}
              >
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
