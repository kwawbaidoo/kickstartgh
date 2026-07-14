"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ClipboardCheck, Trophy, Users } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Stagger } from "@/components/common/Stagger";
import { ReportHistory } from "@/components/reports/ReportHistory";
import { TemplateCard } from "@/components/reports/TemplateCard";
import { buttonVariants } from "@/components/ui/button";
import { useReportsStore } from "@/store/reports-store";

const quickActions = [
  { label: "Player Report", icon: <Users />, href: "/reports/player" },
  { label: "Team Report", icon: <Trophy />, href: "/reports/team" },
  { label: "Match Report", icon: <CalendarDays />, href: "/reports/match" },
  { label: "Attendance Report", icon: <ClipboardCheck />, href: "/reports/attendance" },
];

export default function ReportsHomePage() {
  const router = useRouter();
  const history = useReportsStore((state) => state.history);
  const templates = useReportsStore((state) => state.templates);
  const renameTemplate = useReportsStore((state) => state.renameTemplate);
  const duplicateTemplate = useReportsStore((state) => state.duplicateTemplate);
  const deleteTemplate = useReportsStore((state) => state.deleteTemplate);

  const recentHistory = history.slice(0, 3);
  const recentTemplates = [...templates]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Reports"
        description="Player, team, match, and attendance reports."
      />

      <section className="flex flex-col gap-3">
        <SectionHeader title="Quick Actions" />
        <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action.href} {...action} />
          ))}
        </Stagger>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Recently Generated"
          action={
            history.length > 0 ? (
              <Link href="/reports/history" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                View all
              </Link>
            ) : undefined
          }
        />
        {recentHistory.length === 0 ? (
          <EmptyState
            title="No reports generated yet."
            description="Build a report and export it as PDF, Excel, or share to WhatsApp."
          />
        ) : (
          <ReportHistory entries={recentHistory} />
        )}
      </section>

      {recentTemplates.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Saved Templates" />
          <div className="flex flex-col gap-2">
            {recentTemplates.map((template) => {
              const href =
                template.reportType === "player"
                  ? "/reports/player"
                  : template.reportType === "team"
                    ? "/reports/team"
                    : template.reportType === "match"
                      ? "/reports/match"
                      : "/reports/attendance";
              return (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onApply={() => router.push(`${href}?template=${template.id}`)}
                  onRename={renameTemplate}
                  onDuplicate={duplicateTemplate}
                  onDelete={deleteTemplate}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
