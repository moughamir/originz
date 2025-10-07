 
export type ProviderConfig<P = object> = [
  React.ComponentType<P & { children: React.ReactNode }>,
  P
];
