"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Upload,
  Users,
} from "lucide-react";

import { ProgressStepper } from "@/components/onboarding/ProgressStepper";
import { ImportDropzone } from "@/components/players/ImportDropzone";
import { ImportColumnMapper } from "@/components/players/ImportColumnMapper";
import { ImportPreviewTable } from "@/components/players/ImportPreviewTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { importFieldsByKey, type ImportFieldKey } from "@/config/player-import";
import {
  autoMapColumns,
  buildImportUpload,
  maxImportFileBytes,
  missingRequiredFields,
  parseSpreadsheet,
  validateImportRows,
  type ColumnMapping,
  type ParsedSheet,
} from "@/lib/player-import";
import { ApiError } from "@/lib/api-client";
import type { Player } from "@/mock/players";
import type { BulkUploadResult } from "@/store/players-store";

const steps = ["Choose file", "Match columns", "Done"];

type RowFilter = "all" | "problems";

type PlayerImportWizardProps = {
  existingPlayers: Player[];
  onImport: (file: File, mapping: ColumnMapping) => Promise<BulkUploadResult>;
};

function PlayerImportWizard({ existingPlayers, onImport }: PlayerImportWizardProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rowFilter, setRowFilter] = useState<RowFilter>("all");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const step = result ? 2 : sheet ? 1 : 0;

  const missing = useMemo(() => missingRequiredFields(mapping), [mapping]);

  const validation = useMemo(() => {
    if (!sheet || missing.length > 0) return null;
    return validateImportRows(sheet, mapping, existingPlayers);
  }, [sheet, mapping, missing.length, existingPlayers]);

  const visibleRows = useMemo(() => {
    if (!validation) return [];
    if (rowFilter === "problems") return validation.rows.filter((row) => row.issues.length > 0);
    return validation.rows;
  }, [validation, rowFilter]);

  async function handleFile(picked: File) {
    setParseError(null);
    setResult(null);

    if (picked.size > maxImportFileBytes) {
      setParseError(
        `That file is ${(picked.size / (1024 * 1024)).toFixed(1)}MB — the limit is ${Math.round(
          maxImportFileBytes / (1024 * 1024)
        )}MB.`
      );
      return;
    }

    setIsParsing(true);
    setFile(picked);
    try {
      const parsed = await parseSpreadsheet(picked);
      if (parsed.rows.length === 0) {
        setParseError("That file has headings but no player rows underneath them.");
        setSheet(null);
        return;
      }
      setSheet(parsed);
      setMapping(autoMapColumns(parsed.columns));
      setRowFilter("all");
    } catch (error) {
      setSheet(null);
      setParseError(
        error instanceof Error ? error.message : "Couldn't read that file. Try saving it as .xlsx."
      );
    } finally {
      setIsParsing(false);
    }
  }

  function handleMappingChange(field: ImportFieldKey, column: string | undefined) {
    setMapping((current) => {
      const next: ColumnMapping = { ...current };
      // A heading can only feed one field, so claiming it releases it from the other.
      if (column) {
        for (const key of Object.keys(next) as ImportFieldKey[]) {
          if (next[key] === column) delete next[key];
        }
        next[field] = column;
      } else {
        delete next[field];
      }
      return next;
    });
  }

  async function handleImport() {
    if (!validation || validation.validRows.length === 0) return;
    setImportError(null);
    setIsImporting(true);
    try {
      const upload = buildImportUpload(validation.validRows);
      setResult(await onImport(upload.file, upload.mapping));
    } catch (error) {
      setImportError(
        error instanceof ApiError
          ? error.message
          : "Couldn't upload the players. Check your connection and try again."
      );
    } finally {
      setIsImporting(false);
    }
  }

  function handleStartOver() {
    setFile(null);
    setSheet(null);
    setMapping({});
    setResult(null);
    setParseError(null);
    setImportError(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressStepper steps={steps} currentStep={step} />

      {step === 0 && (
        <ImportDropzone
          onFile={handleFile}
          isParsing={isParsing}
          error={parseError}
          fileName={file?.name}
        />
      )}

      {step === 1 && sheet && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                {file?.name} · sheet &ldquo;{sheet.sheetName}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground">
                {sheet.rows.length} row{sheet.rows.length === 1 ? "" : "s"} ·{" "}
                {sheet.columns.length} column{sheet.columns.length === 1 ? "" : "s"} detected
              </p>
            </CardContent>
          </Card>

          {sheet.notes.length > 0 && (
            <ul className="flex flex-col gap-1.5 rounded-xl bg-warning/10 p-3">
              {sheet.notes.map((note) => (
                <li key={note} className="flex items-start gap-2 text-sm text-foreground">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                  {note}
                </li>
              ))}
            </ul>
          )}

          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-heading text-base font-medium text-foreground">Match columns</h2>
              <p className="text-sm text-muted-foreground">
                We matched what we could from your headings. Fix anything that looks wrong.
              </p>
            </div>
            <ImportColumnMapper
              columns={sheet.columns}
              mapping={mapping}
              onChange={handleMappingChange}
            />
          </section>

          {missing.length > 0 ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              Match a column for{" "}
              {missing.map((key) => importFieldsByKey[key].label).join(", ")} before you can
              continue.
            </p>
          ) : (
            validation && (
              <section className="flex flex-col gap-3">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-heading text-base font-medium text-foreground">
                      Review rows
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {validation.validRows.length} ready
                      {validation.errorCount > 0 && ` · ${validation.errorCount} to fix`}
                      {validation.warningCount > 0 && ` · ${validation.warningCount} with notes`}
                    </p>
                  </div>

                  <Tabs value={rowFilter} onValueChange={(value) => setRowFilter(value as RowFilter)}>
                    <TabsList>
                      <TabsTrigger value="all">All rows</TabsTrigger>
                      <TabsTrigger value="problems">Problems only</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {validation.errorCount > 0 && (
                  <p className="rounded-xl bg-warning/10 p-3 text-sm text-foreground">
                    Rows with errors are skipped — the rest still import. Fix them in your
                    spreadsheet and upload it again to add them.
                  </p>
                )}

                <Card className="py-0">
                  <CardContent className="px-0">
                    {visibleRows.length > 0 ? (
                      <ImportPreviewTable rows={visibleRows} statusDefaulted={!mapping.status} />
                    ) : (
                      <p className="p-6 text-center text-sm text-muted-foreground">
                        No rows have problems — everything is ready to import.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </section>
            )
          )}

          {importError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {importError}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="lg" onClick={handleStartOver}>
              <ArrowLeft />
              Choose a different file
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleImport}
              disabled={isImporting || !validation || validation.validRows.length === 0}
            >
              {isImporting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload />
                  Import {validation?.validRows.length ?? 0} player
                  {validation?.validRows.length === 1 ? "" : "s"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && result && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-7" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-heading text-lg font-semibold text-foreground">
                  {result.created} player{result.created === 1 ? "" : "s"} imported
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.failures.length > 0
                    ? `${result.failures.length} row${
                        result.failures.length === 1 ? " was" : "s were"
                      } rejected by the server — see below.`
                    : "They're on your squad list now."}
                </p>
              </div>
            </CardContent>
          </Card>

          {result.failures.length > 0 && (
            <Card>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm font-medium text-foreground">Rejected rows</p>
                <ul className="flex flex-col gap-2">
                  {result.failures.map((failure, index) => (
                    <li
                      key={`${failure.row ?? "row"}-${index}`}
                      className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2.5 text-sm text-destructive"
                    >
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <span>
                        {failure.row !== undefined && (
                          <span className="font-medium">Row {failure.row}: </span>
                        )}
                        {failure.messages.join(" ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="lg" onClick={handleStartOver}>
              <Upload />
              Import another file
            </Button>
            <Button type="button" size="lg" onClick={() => router.push("/players")}>
              <Users />
              View squad
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { PlayerImportWizard };
