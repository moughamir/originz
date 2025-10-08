import { ServerPageLayout } from "@blocks/layout/page-layout-wrapper";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServerPageLayout>
      <main className="flex-grow">{children}</main>
    </ServerPageLayout>
  );
}
