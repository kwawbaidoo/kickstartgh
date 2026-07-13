"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 py-2"
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-colors",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5.5" strokeWidth={isActive ? 2.5 : 2} />
            </span>
            <span
              className={cn(
                "text-[11px] font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export { MobileBottomNav };
