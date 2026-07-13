"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { sidebarNavItems } from "@/config/navigation";
import { useOnboardingStore } from "@/store/onboarding-store";
import { cn, getInitials } from "@/lib/utils";

function Sidebar() {
  const pathname = usePathname();
  const activeTeam = useOnboardingStore((state) => state.activeTeam);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground">
          K
        </div>
        <span className="font-heading text-base font-semibold">KickStartGH</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-sidebar-foreground",
                isActive && "text-sidebar-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 size-5 shrink-0",
                  isActive && "text-sidebar-accent-foreground"
                )}
              />
              <span className={cn("relative z-10", isActive && "text-sidebar-accent-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
          {activeTeam.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeTeam.logo} alt="" className="size-full object-cover" />
          ) : (
            getInitials(activeTeam.name)
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{activeTeam.name}</span>
          <span className="truncate text-xs text-sidebar-foreground/60">{activeTeam.region}</span>
        </div>
      </div>
    </aside>
  );
}

export { Sidebar };
