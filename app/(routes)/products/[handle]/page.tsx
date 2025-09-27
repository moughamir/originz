import type { Metadata } from "next";

import { generateSEO } from "@/lib/seo";
import { getAllProducts, getProductByHandle } from "@/lib/api";
import { ProductDetailsServer } from "./product-details-server";
import { ProductDetailsSkeleton } from "@/components/skeletons/product-details-skeleton";
import { Suspense } from "react";

export const revalidate = 60; 

interface ProductPageProps {
  params: { handle: string };
}

export async function generateStaticParams() {

  try {
    const products = await getAllProducts({ limit: 100});
    return products.filter((p) => p.handle).map((p) => ({ handle: p.handle }));
  } catch {
    
    return [] as { handle: string }[];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const product = await getProductByHandle(params.handle);
    return generateSEO({
      title: product.title,
      description: product.body_html,
      path: `/products/${product.handle}`,
      type: "product",
      image: product.images?.[0]?.src,
    });
  } catch {
    return generateSEO({ title: "Product Not Found" });
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const { handle } = params;

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsServer handle={handle} />  
    </Suspense>
  );
}
