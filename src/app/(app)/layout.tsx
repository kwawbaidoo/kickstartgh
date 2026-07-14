import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { StoreHydration } from "@/store/StoreHydration";
import { ThemeSync } from "@/store/ThemeSync";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreHydration />
      <ThemeSync />
      <AppShell>{children}</AppShell>
    </>
  );
}
