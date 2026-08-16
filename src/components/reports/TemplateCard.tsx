"use client";

import { useState } from "react";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/ui/input";
import { reportTypeLabels } from "@/config/reports";
import type { ReportTemplate } from "@/store/reports-store";

type TemplateCardProps = {
  template: ReportTemplate;
  onApply: (template: ReportTemplate) => void;
  onRename: (id: string, name: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function TemplateCard({ template, onApply, onRename, onDuplicate, onDelete }: TemplateCardProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState(template.name);
  const [error, setError] = useState<string | null>(null);

  function handleRenameSave() {
    if (name.trim().length < 2) return;
    setError(null);
    onRename(template.id, name.trim())
      .then(() => setRenameOpen(false))
      .catch(() => setError("Couldn't rename this template. Please try again."));
  }

  function handleDuplicate() {
    setError(null);
    onDuplicate(template.id).catch(() => setError("Couldn't duplicate this template. Please try again."));
  }

  function handleDelete() {
    setError(null);
    onDelete(template.id).catch(() => setError("Couldn't delete this template. Please try again."));
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onApply(template)}
            className="flex min-w-0 flex-1 flex-col items-start text-left"
          >
            <span className="truncate text-sm font-medium text-foreground">{template.name}</span>
            <span className="text-xs text-muted-foreground">
              {reportTypeLabels[template.report_type]} · {template.columns.length} columns
            </span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                <Pencil />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>

      <Modal
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename template"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSave}>Save</Button>
          </>
        }
      >
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Template name" />
      </Modal>
    </Card>
  );
}

export { TemplateCard };
