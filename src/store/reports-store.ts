import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { ExportFormat, ReportType } from "@/config/reports";

export type ReportTemplate = {
  id: string;
  name: string;
  report_type: ReportType;
  columns: string[];
  created_at: string;
};

export type ReportHistoryEntry = {
  id: string;
  report_type: ReportType;
  format: ExportFormat;
  template_name?: string;
  created_at: string;
};

type ReportsState = {
  templates: ReportTemplate[];
  history: ReportHistoryEntry[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  saveTemplate: (name: string, report_type: ReportType, columns: string[]) => ReportTemplate;
  renameTemplate: (id: string, name: string) => void;
  duplicateTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  addHistoryEntry: (report_type: ReportType, format: ExportFormat, template_name?: string) => void;
};

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      templates: [],
      history: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      saveTemplate: (name, report_type, columns) => {
        const template: ReportTemplate = {
          id: crypto.randomUUID(),
          name,
          report_type,
          columns,
          created_at: new Date().toISOString(),
        };
        set({ templates: [...get().templates, template] });
        return template;
      },

      renameTemplate: (id, name) => {
        set({
          templates: get().templates.map((template) =>
            template.id === id ? { ...template, name } : template
          ),
        });
      },

      duplicateTemplate: (id) => {
        const original = get().templates.find((template) => template.id === id);
        if (!original) return;
        const copy: ReportTemplate = {
          ...original,
          id: crypto.randomUUID(),
          name: `${original.name} (Copy)`,
          created_at: new Date().toISOString(),
        };
        set({ templates: [...get().templates, copy] });
      },

      deleteTemplate: (id) => {
        set({ templates: get().templates.filter((template) => template.id !== id) });
      },

      addHistoryEntry: (report_type, format, template_name) => {
        const entry: ReportHistoryEntry = {
          id: crypto.randomUUID(),
          report_type,
          format,
          template_name,
          created_at: new Date().toISOString(),
        };
        set({ history: [entry, ...get().history].slice(0, 50) });
      },
    }),
    {
      name: "kickstartgh-reports",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ templates: state.templates, history: state.history }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
