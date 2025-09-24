import * as clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: clsx.ClassValue[]) {
  return twMerge(clsx.clsx(inputs));
}
export function formatPrice(price: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateImage({
  dim,
  bg,
  fg,
  text,
}: {
  dim: {
    w: number;
    h: number;
  };
  bg: string | number;
  fg: string | number;
  text: string;
}): string {
  return `https://via.placeholder.com/${dim.w}x${dim.h}/${bg}/${fg}?text=${text}`;
}
