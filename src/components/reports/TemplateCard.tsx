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
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

function TemplateCard({ template, onApply, onRename, onDuplicate, onDelete }: TemplateCardProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState(template.name);

  function handleRenameSave() {
    if (name.trim().length < 2) return;
    onRename(template.id, name.trim());
    setRenameOpen(false);
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onApply(template)}
          className="flex min-w-0 flex-1 flex-col items-start text-left"
        >
          <span className="truncate text-sm font-medium text-foreground">{template.name}</span>
          <span className="text-xs text-muted-foreground">
            {reportTypeLabels[template.reportType]} · {template.columns.length} columns
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
            <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
              <Copy />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(template.id)}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
