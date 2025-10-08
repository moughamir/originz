import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountGate } from "@blocks/account/account-gate";
import { AccountDashboardSkeleton } from "@/components/skeletons/account-skeleton";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Account",
  description: "Manage your account settings and view your orders.",
  path: "/account",
});

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountDashboardSkeleton />}>
      <AccountGate />
    </Suspense>
  );
}
