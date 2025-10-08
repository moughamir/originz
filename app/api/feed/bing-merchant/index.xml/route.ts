import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";
import { getProductsCount } from "@/lib/data/products";
import { generateFeedIndexXml } from "@/lib/utils/xml-feeds/feed-generator";
import { logger } from "@/lib/utils/logger";

const PRODUCTS_PER_PAGE = 5000;

export async function GET() {
  try {
    logger.info("Generating Bing Merchant feed index");
    const totalProducts = await getProductsCount();
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

    const xml = generateFeedIndexXml(
      SITE_CONFIG.url,
      "api/feed/bing-merchant",
      totalPages
    );

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    logger.error("Error generating Bing Merchant feed index", error);
    return new NextResponse("Error generating feed index", { status: 500 });
  }
}
