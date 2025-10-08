import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductSchema } from "@blocks/common/product-schema";
import { ProductDetailsSkeleton } from "@/components/skeletons/product-details-skeleton";
import { ProductProvider } from "@/contexts/product-context";
import { getProducts, getProductByHandle } from "@/lib/data/products";
import { SITE_CONFIG } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";
import { ProductDetailsClient } from "./product-details-client";
import { ApiProduct } from "@/lib/types";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateStaticParams() {
  try {
    const products: ApiProduct[] = await getProducts({
      limit: 100,
      page: 1,
    });
    return products
      .filter((p: ApiProduct) => p.handle)
      .map((p: ApiProduct) => ({ handle: p.handle }));
  } catch {
    return [] as { handle: string }[];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const { handle } = await params;
    const product = await getProductByHandle(handle, {
      context: "ssr",
    });

    if (!product) {
      return generateSEO({ title: "Product Not Found" });
    }

    const seoImage = product.images?.[0]?.src || SITE_CONFIG.ogImage;

    return generateSEO({
      title: product.title || "",
      description: product.body_html || "",
      path: `/products/${product.handle || handle}`,
      type: "product",
      image: seoImage,
    });
  } catch {
    return generateSEO({ title: "Product Not Found" });
  }
}

async function ProductPageContent({ handle }: { handle: string }) {
  const product = await getProductByHandle(handle, { context: "ssr" });

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductSchema product={product} />
      <ProductProvider initialProduct={product}>
        <ProductDetailsClient product={product} />
      </ProductProvider>
    </>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductPageContent handle={handle} />
    </Suspense>
  );
}
