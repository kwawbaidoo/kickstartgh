"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

type ReminderCardProps = {
  message: string;
};

function ReminderCard({ message }: ReminderCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser; the message is still visible to copy manually.
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <pre className="whitespace-pre-wrap rounded-lg bg-muted/60 p-3 font-sans text-sm text-foreground">
          {message}
        </pre>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <MessageCircle />
            Share to WhatsApp
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export { ReminderCard };
