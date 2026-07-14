import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { ExportFormat, ReportType } from "@/config/reports";

export type ReportTemplate = {
  id: string;
  name: string;
  reportType: ReportType;
  columns: string[];
  createdAt: string;
};

export type ReportHistoryEntry = {
  id: string;
  reportType: ReportType;
  format: ExportFormat;
  templateName?: string;
  createdAt: string;
};

type ReportsState = {
  templates: ReportTemplate[];
  history: ReportHistoryEntry[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  saveTemplate: (name: string, reportType: ReportType, columns: string[]) => ReportTemplate;
  renameTemplate: (id: string, name: string) => void;
  duplicateTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  addHistoryEntry: (reportType: ReportType, format: ExportFormat, templateName?: string) => void;
};

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      templates: [],
      history: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      saveTemplate: (name, reportType, columns) => {
        const template: ReportTemplate = {
          id: crypto.randomUUID(),
          name,
          reportType,
          columns,
          createdAt: new Date().toISOString(),
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
          createdAt: new Date().toISOString(),
        };
        set({ templates: [...get().templates, copy] });
      },

      deleteTemplate: (id) => {
        set({ templates: get().templates.filter((template) => template.id !== id) });
      },

      addHistoryEntry: (reportType, format, templateName) => {
        const entry: ReportHistoryEntry = {
          id: crypto.randomUUID(),
          reportType,
          format,
          templateName,
          createdAt: new Date().toISOString(),
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
