"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SeasonSelector } from "@/components/seasons/SeasonSelector";
import { mobileNavItems, navItemsForTeamState, sidebarNavItems } from "@/config/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getInitials } from "@/lib/utils";

const moreNavItems = sidebarNavItems.filter(
  (item) => !mobileNavItems.some((mobileItem) => mobileItem.href === item.href)
);

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const teamId = useOnboardingStore((state) => state.team_id);
  const userName = useAuthStore((state) => state.user?.full_name);
  const signOut = useAuthStore((state) => state.signOut);
  const sheetNavItems = navItemsForTeamState(moreNavItems, !!teamId);
  // Same reasoning as the sidebar footer: never show the placeholder team as if it were real.
  const identityLabel = teamId ? activeTeam.name : (userName ?? "Your account");
  const activeItem = sidebarNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  function handleSignOut() {
    signOut().finally(() => router.push("/"));
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm print:hidden lg:px-8">
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
        {teamId && <SeasonSelector />}

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>

        {sheetNavItems.length > 0 && (
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="More" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{identityLabel}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {sheetNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
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
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Account menu"
                className="ml-1 flex size-8 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground"
              />
            }
          >
            {teamId && activeTeam.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeTeam.logo} alt="" className="size-full object-cover" />
            ) : (
              getInitials(identityLabel)
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href="/settings/profile" />}>
              <User />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export { Header };
