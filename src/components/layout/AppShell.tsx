import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Sidebar } from "@/components/layout/Sidebar";

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <Header />
        <main className="flex-1 px-4 pb-24 pt-4 lg:px-8 lg:pb-8 lg:pt-6">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export { AppShell };
