"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import ErrorBoundary from "@blocks/common/error-boundary";
import { PWAProvider } from "@blocks/pwa/pwa-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { ComposeProvider } from "@/lib/compose-provider";

 
type ProviderWithProps<P = object> = [
  React.ComponentType<P & { children: React.ReactNode }>,
  P
];

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  const providers: ProviderWithProps[] = [
    [ErrorBoundary, {}],

    [
      (props: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient} {...props} />
      ),
      {},
    ],
    [AuthProvider, {}],
    [CartProvider, {}],
    [PWAProvider, {}],
  ];

  return (
    <ComposeProvider providers={providers}>
      {children}
      <Toaster />
    </ComposeProvider>
  );
}
