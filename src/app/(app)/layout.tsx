import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { StoreHydration } from "@/store/StoreHydration";
import { ThemeSync } from "@/store/ThemeSync";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreHydration />
      <ThemeSync />
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </>
  );
}
