import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { StoreHydration } from "@/store/StoreHydration";

export default function OnboardingGroupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreHydration />
      <AuthGuard>{children}</AuthGuard>
    </>
  );
}
