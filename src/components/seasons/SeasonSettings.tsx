"use client";

import { useState } from "react";
import { Archive, Download, FileSpreadsheet, FileText, Pencil, Play, Repeat } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/common/Modal";
import { seasonStatusBadgeClasses, seasonStatusLabels } from "@/config/seasons";
import type { Season } from "@/mock/seasons";
import type { ReportTable } from "@/lib/reports";
import { exportReportCsv, exportReportExcel, exportReportPdf } from "@/lib/export";
import { cn } from "@/lib/utils";

type SeasonSettingsProps = {
  season: Season;
  isActive: boolean;
  exportTable: ReportTable;
  onRename: (name: string) => Promise<void>;
  onActivate: () => Promise<void>;
  onArchive: () => Promise<void>;
  onDuplicate: (name: string, carryForwardRoster: boolean) => Promise<void>;
};

function SeasonSettings({
  season,
  isActive,
  exportTable,
  onRename,
  onActivate,
  onArchive,
  onDuplicate,
}: SeasonSettingsProps) {
  const [name, setName] = useState(season.name);
  const [activateOpen, setActivateOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateName, setDuplicateName] = useState(`${season.name} (Copy)`);
  const [carryForward, setCarryForward] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleRename() {
    setIsRenaming(true);
    setActionError(null);
    try {
      await onRename(name.trim());
    } catch {
      setActionError("Couldn't rename this season. Please try again.");
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleActivate() {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await onActivate();
      setActivateOpen(false);
    } catch {
      setActionError("Couldn't activate this season. Please try again.");
      setActivateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive() {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await onArchive();
      setArchiveOpen(false);
    } catch {
      setActionError("Couldn't archive this season. Please try again.");
      setArchiveOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDuplicate() {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await onDuplicate(duplicateName.trim(), carryForward);
      setDuplicateOpen(false);
    } catch {
      setActionError("Couldn't duplicate this season. Please try again.");
      setDuplicateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {actionError && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{actionError}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Rename Season</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field className="flex-1">
            <FieldLabel htmlFor="seasonName">Season name</FieldLabel>
            <FieldContent>
              <Input id="seasonName" value={name} onChange={(event) => setName(event.target.value)} />
            </FieldContent>
          </Field>
          <Button
            disabled={!name.trim() || name === season.name || isRenaming}
            onClick={handleRename}
          >
            <Pencil />
            {isRenaming ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Season Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current status:</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                seasonStatusBadgeClasses[season.status]
              )}
            >
              {seasonStatusLabels[season.status]}
            </span>
          </div>
          {isActive ? (
            <p className="text-sm text-muted-foreground">
              This is the active season. Activate another season to end it.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setActivateOpen(true)}>
                <Play />
                Activate Season
              </Button>
              {season.status !== "archived" && (
                <Button variant="outline" onClick={() => setArchiveOpen(true)}>
                  <Archive />
                  Archive Season
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Duplicate Season</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setDuplicateOpen(true)}>
            <Repeat />
            Duplicate This Season
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Season Data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => exportReportCsv(exportTable, `${season.name}-summary`)}>
            <Download />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportReportExcel(exportTable, `${season.name}-summary`)}
          >
            <FileSpreadsheet />
            Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => exportReportPdf(exportTable, `${season.name}-summary`, `${season.name} Summary`)}
          >
            <FileText />
            PDF
          </Button>
        </CardContent>
      </Card>

      <Modal
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title={`Activate ${season.name}?`}
        description="Every new player, match, and training session will belong to this season from now on. The current active season will move to Completed."
        footer={
          <>
            <Button variant="outline" onClick={() => setActivateOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleActivate} disabled={isSubmitting}>
              {isSubmitting ? "Activating..." : "Activate"}
            </Button>
          </>
        }
      />

      <Modal
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={`Archive ${season.name}?`}
        description="Archived seasons stay visible for reference but are clearly marked as read-only."
        footer={
          <>
            <Button variant="outline" onClick={() => setArchiveOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleArchive} disabled={isSubmitting}>
              {isSubmitting ? "Archiving..." : "Archive"}
            </Button>
          </>
        }
      />

      <Modal
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
        title="Duplicate Season"
        description="Creates a new upcoming season with the same details."
        footer={
          <>
            <Button variant="outline" onClick={() => setDuplicateOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button disabled={!duplicateName.trim() || isSubmitting} onClick={handleDuplicate}>
              {isSubmitting ? "Duplicating..." : "Duplicate"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Field>
            <FieldLabel htmlFor="duplicateName">New season name</FieldLabel>
            <FieldContent>
              <Input
                id="duplicateName"
                value={duplicateName}
                onChange={(event) => setDuplicateName(event.target.value)}
              />
            </FieldContent>
          </Field>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={carryForward}
              onChange={(event) => setCarryForward(event.target.checked)}
              className="size-4 rounded border-input"
            />
            Carry forward the active roster
          </label>
        </div>
      </Modal>
    </div>
  );
}

export { SeasonSettings };
