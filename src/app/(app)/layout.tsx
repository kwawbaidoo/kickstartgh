import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { StoreHydration } from "@/store/StoreHydration";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreHydration />
      <AppShell>{children}</AppShell>
    </>
  );
}
