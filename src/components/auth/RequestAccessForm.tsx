"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Copy, Mail, MessageCircle, Send } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { hasSupportChannel, supportEmail, supportWhatsApp } from "@/config/contact";
import { accessRequestSchema, type AccessRequestInput } from "@/schemas/auth";
import { normalizePhone } from "@/lib/staff";

function buildRequestMessage(data: AccessRequestInput): string {
  return [
    "KickStartGH access request",
    "",
    `Name: ${data.full_name}`,
    `Team: ${data.team_name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    ...(data.note ? ["", `Note: ${data.note}`] : []),
  ].join("\n");
}

/**
 * Accounts on KickStartGH are provisioned, not self-served, so the landing page collects
 * what's needed to set one up instead of creating it. Nothing is POSTed — there's no
 * endpoint yet (BACKEND_GAPS.md §7.4) — so on submit the request is composed and handed to
 * the visitor's own WhatsApp/mail client, and the UI says exactly that rather than
 * claiming a submission that never happened.
 */
function RequestAccessForm() {
  const [request, setRequest] = useState<AccessRequestInput | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<AccessRequestInput>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: { full_name: "", team_name: "", phone: "", email: "", note: "" },
  });

  async function handleCopy(message: string) {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser; the summary stays on screen to copy by hand.
    }
  }

  if (request) {
    const message = buildRequestMessage(request);

    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-lg bg-primary/10 p-3 text-sm text-foreground">
          Your details are ready to send. Pick a channel below — we&apos;ll set up your account
          and send your sign-in details to {request.phone}.
        </p>

        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap text-muted-foreground">
          {message}
        </pre>

        <div className="flex flex-col gap-2">
          {supportWhatsApp && (
            <a
              href={`https://wa.me/${normalizePhone(supportWhatsApp)}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg", className: "w-full" })}
            >
              <MessageCircle />
              Send on WhatsApp
            </a>
          )}

          {supportEmail && (
            <a
              href={`mailto:${supportEmail}?subject=${encodeURIComponent("KickStartGH access request")}&body=${encodeURIComponent(message)}`}
              className={buttonVariants({
                variant: supportWhatsApp ? "outline" : "default",
                size: "lg",
                className: "w-full",
              })}
            >
              <Mail />
              Send by email
            </a>
          )}

          <Button
            type="button"
            variant={hasSupportChannel ? "ghost" : "default"}
            size="lg"
            className="w-full"
            onClick={() => handleCopy(message)}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy details"}
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mx-auto"
          onClick={() => setRequest(null)}
        >
          <ArrowLeft />
          Edit my details
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(setRequest)} className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.full_name}>
          <FieldLabel htmlFor="request-name" required>
            Your full name
          </FieldLabel>
          <FieldContent>
            <Input
              id="request-name"
              autoComplete="name"
              placeholder="e.g. Kwame Owusu"
              {...form.register("full_name")}
            />
            <FieldError errors={[form.formState.errors.full_name]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.team_name}>
          <FieldLabel htmlFor="request-team" required>
            Team name
          </FieldLabel>
          <FieldContent>
            <Input
              id="request-team"
              placeholder="e.g. Accra Lions FC"
              {...form.register("team_name")}
            />
            <FieldError errors={[form.formState.errors.team_name]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.phone}>
          <FieldLabel htmlFor="request-phone" required>
            Phone number
          </FieldLabel>
          <FieldContent>
            <Input
              id="request-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. 024 000 0000"
              {...form.register("phone")}
            />
            <FieldError errors={[form.formState.errors.phone]} />
            <FieldDescription>You&apos;ll sign in with this number.</FieldDescription>
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="request-email" required>
            Email
          </FieldLabel>
          <FieldContent>
            <Input
              id="request-email"
              type="email"
              autoComplete="email"
              placeholder="e.g. you@example.com"
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.note}>
          <FieldLabel htmlFor="request-note">Anything else?</FieldLabel>
          <FieldContent>
            <Textarea
              id="request-note"
              rows={3}
              placeholder="Squad size, league, when you'd like to start..."
              {...form.register("note")}
            />
            <FieldError errors={[form.formState.errors.note]} />
          </FieldContent>
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full">
        <Send />
        Request access
      </Button>
    </form>
  );
}

export { RequestAccessForm };
