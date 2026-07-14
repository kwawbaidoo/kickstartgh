import type { ReactNode } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export type QuickAction = {
  label: string;
  icon: ReactNode;
  href: string;
};

function QuickActionsBar({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link key={action.href} href={action.href} className={buttonVariants({ variant: "outline", size: "sm" })}>
          {action.icon}
          {action.label}
        </Link>
      ))}
    </div>
  );
}

export { QuickActionsBar };
