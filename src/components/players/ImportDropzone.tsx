"use client";

import { useRef, useState } from "react";
import { AlertCircle, Download, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { acceptedImportTypes, downloadImportTemplate, maxImportFileBytes } from "@/lib/player-import";
import { cn } from "@/lib/utils";

type ImportDropzoneProps = {
  onFile: (file: File) => void;
  isParsing: boolean;
  error: string | null;
  fileName?: string;
};

function ImportDropzone({ onFile, isParsing, error, fileName }: ImportDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-4 rounded-2xl border border-dashed px-5 py-10 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-card"
        )}
      >
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full transition-colors",
            isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
          )}
        >
          {isParsing ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <UploadCloud className="size-6" aria-hidden="true" />
          )}
        </span>

        <div className="flex flex-col gap-1">
          <p className="text-base font-medium text-foreground">
            {isParsing ? "Reading your file..." : "Drop your squad spreadsheet here"}
          </p>
          <p className="text-sm text-muted-foreground">
            Excel or CSV, up to {Math.round(maxImportFileBytes / (1024 * 1024))}MB. The first row
            must be your column headings.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={acceptedImportTypes}
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <Button
          type="button"
          size="lg"
          onClick={() => inputRef.current?.click()}
          disabled={isParsing}
        >
          <FileSpreadsheet />
          Choose file
        </Button>

        {fileName && !error && (
          <p className="text-xs text-muted-foreground">Selected: {fileName}</p>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">Not sure about the columns?</p>
          <p className="text-xs text-muted-foreground">
            Start from our template — headings already match, one example row included.
          </p>
        </div>
        <Button type="button" variant="outline" className="shrink-0" onClick={downloadImportTemplate}>
          <Download />
          Download template
        </Button>
      </div>
    </div>
  );
}

export { ImportDropzone };
