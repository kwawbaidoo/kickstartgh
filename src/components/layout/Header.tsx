"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mobileNavItems, sidebarNavItems } from "@/config/navigation";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getInitials } from "@/lib/utils";

const moreNavItems = sidebarNavItems.filter(
  (item) => !mobileNavItems.some((mobileItem) => mobileItem.href === item.href)
);

function Header() {
  const pathname = usePathname();
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const activeItem = sidebarNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          K
        </div>
        <span className="font-heading text-base font-semibold text-foreground">
          KickStartGH
        </span>
      </div>

      <h1 className="hidden font-heading text-lg font-semibold text-foreground lg:block">
        {activeItem?.label ?? "Dashboard"}
      </h1>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="More" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{activeTeam.name}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Icon className="size-5 text-muted-foreground" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="ml-1 flex size-8 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {activeTeam.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activeTeam.logo} alt="" className="size-full object-cover" />
          ) : (
            getInitials(activeTeam.name)
          )}
        </div>
      </div>
    </header>
  );
}

export { Header };
