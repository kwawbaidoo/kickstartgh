import Link from "next/link";
import { FileText, Mail, Phone, ShieldCheck } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { appInfo } from "@/config/settings";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="About" description="App version, release notes, and support." />

      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            K
          </div>
          <span className="font-heading text-base font-semibold text-foreground">KickStartGH</span>
          <span className="text-sm text-muted-foreground">Version {appInfo.version}</span>
          <p className="pt-2 text-sm text-muted-foreground">Built for grassroots football in Ghana 🇬🇭</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Release Notes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {appInfo.releaseNotes.map((entry, index) => (
            <div key={entry.version}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">v{entry.version}</span>
                <span className="text-xs text-muted-foreground">{entry.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{entry.notes}</p>
              {index < appInfo.releaseNotes.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="size-4" />
            Terms of Service
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" />
            Privacy Policy
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Link
            href={`tel:${appInfo.supportPhone.replace(/\s+/g, "")}`}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary"
          >
            <Phone className="size-4" />
            {appInfo.supportPhone}
          </Link>
          <Link
            href={`mailto:${appInfo.supportEmail}`}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary"
          >
            <Mail className="size-4" />
            {appInfo.supportEmail}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
