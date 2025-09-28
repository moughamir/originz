import { getProductByHandle } from "@/lib/api";
import { ProductDetailsClient } from "./product-details-client";

interface ProductDetailsServerProps {
  handle: string;
}

export async function ProductDetailsServer({ handle }: ProductDetailsServerProps) {
  const apiProduct = await getProductByHandle(handle);
  

  return <ProductDetailsClient product={apiProduct} />;
}
