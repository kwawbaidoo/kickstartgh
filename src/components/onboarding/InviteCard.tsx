"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Check, Copy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

type InviteCardProps = {
  teamName: string;
  inviteCode: string;
};

function InviteCard({ teamName, inviteCode }: InviteCardProps) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `kickstartgh.com/join/${inviteCode}`;
  const message = `Join ${teamName} on KickStartGH.\n${inviteUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser; the link is still visible to copy manually.
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="rounded-xl bg-white p-3 ring-1 ring-foreground/10">
          <QRCode value={inviteUrl} size={128} />
        </div>

        <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2">
          <span className="truncate text-sm font-medium text-foreground">{inviteUrl}</span>
          <Button type="button" size="icon-sm" variant="ghost" onClick={handleCopy} aria-label="Copy invite link">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">&ldquo;{message.split("\n")[0]}&rdquo;</p>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Share to WhatsApp
        </a>
      </CardContent>
    </Card>
  );
}

export { InviteCard };
