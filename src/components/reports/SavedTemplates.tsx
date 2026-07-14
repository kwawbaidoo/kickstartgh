"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

import { TemplateCard } from "@/components/reports/TemplateCard";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReportType } from "@/config/reports";
import { useReportsStore, type ReportTemplate } from "@/store/reports-store";

type SavedTemplatesProps = {
  reportType: ReportType;
  currentColumns: string[];
  onApply: (template: ReportTemplate) => void;
};

function SavedTemplates({ reportType, currentColumns, onApply }: SavedTemplatesProps) {
  const allTemplates = useReportsStore((state) => state.templates);
  const templates = allTemplates.filter((template) => template.reportType === reportType);
  const saveTemplate = useReportsStore((state) => state.saveTemplate);
  const renameTemplate = useReportsStore((state) => state.renameTemplate);
  const duplicateTemplate = useReportsStore((state) => state.duplicateTemplate);
  const deleteTemplate = useReportsStore((state) => state.deleteTemplate);

  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("");

  function handleSave() {
    if (name.trim().length < 2) return;
    saveTemplate(name.trim(), reportType, currentColumns);
    setName("");
    setSaveOpen(false);
  }

  return (
    <div className="flex flex-col gap-3 print:hidden">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Saved Templates</span>
        <Modal
          open={saveOpen}
          onOpenChange={setSaveOpen}
          trigger={
            <Button type="button" variant="outline" size="sm">
              <Bookmark />
              Save as Template
            </Button>
          }
          title="Save as template"
          description="Save your current column selection so you can reuse it later."
          footer={
            <>
              <Button variant="outline" onClick={() => setSaveOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </>
          }
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Coach Report"
          />
        </Modal>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved templates yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onApply={onApply}
              onRename={renameTemplate}
              onDuplicate={duplicateTemplate}
              onDelete={deleteTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { SavedTemplates };
