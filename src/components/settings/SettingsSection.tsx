import type { ReactNode } from "react";

import { Stagger } from "@/components/common/Stagger";

type SettingsSectionProps = {
  title?: string;
  children: ReactNode;
};

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      {title && <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>}
      <Stagger className="flex flex-col gap-2">{children}</Stagger>
    </section>
  );
}

export { SettingsSection };
