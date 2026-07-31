import Link from "next/link";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

export default function ReportsSubLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link href="/reports" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Reports
      </Link>
      <Suspense fallback={<LoadingSkeleton className="h-64 w-full" />}>{children}</Suspense>
    </div>
  );
}
