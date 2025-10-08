import { NextRequest } from "next/server";
import { generatePaginatedFeed } from "@/lib/utils/xml-feeds/handler";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  const params = await context.params;

  return generatePaginatedFeed(req, params, "bing");
}
