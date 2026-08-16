import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { ExportFormat, ReportType } from "@/config/reports";
import { apiFetch } from "@/lib/api-client";
import { useOnboardingStore } from "@/store/onboarding-store";

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
  isLoading: boolean;
  setHasHydrated: (value: boolean) => void;
  fetchTemplates: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  saveTemplate: (name: string, report_type: ReportType, columns: string[]) => Promise<ReportTemplate>;
  renameTemplate: (id: string, name: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  addHistoryEntry: (report_type: ReportType, format: ExportFormat, template_name?: string) => Promise<void>;
};

/**
 * Confirmed live 2026-08-15 (List/Create/Update/Duplicate/Delete Report Template, List/Log
 * Report History all called directly against the real server) — response `data` payloads
 * are camelCase, same as every other domain. **The four `GET /reports/*` endpoints were
 * also confirmed live and return exactly the frontend's existing `ReportTable` shape
 * (`{columns: {key,label}[], rows: Record<string,string>[]}`) — a near 1:1 match — but
 * they're deliberately NOT used here.** Every report page today scopes to the active
 * season (`getSeasonRoster`/`getSeasonMatches`/`getSeasonSessions` before computing), and
 * confirmed live that these endpoints ignore `seasonId` entirely (passing a different
 * season's id produces identical results) — they only ever report on the team's whole
 * history. Product decision (user, 2026-08-15): keep season-scoped reports computing
 * locally via `lib/reports.ts`'s `buildXReportTable` functions (unchanged, still correct
 * against now-real player/match/session data from I3-I6) rather than regress to team-wide
 * reports. Revisit if the backend ever adds season filtering to these endpoints.
 */
type ReportTemplateResponse = {
  id: string;
  name: string;
  reportType: ReportType;
  columns: string[];
  createdAt: string;
};

type ReportHistoryEntryResponse = {
  id: string;
  reportType: ReportType;
  format: ExportFormat;
  templateName: string | null;
  createdAt: string;
};

type PaginatedResponse<T> = {
  items: T[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
};

function mapTemplate(response: ReportTemplateResponse): ReportTemplate {
  return {
    id: response.id,
    name: response.name,
    report_type: response.reportType,
    columns: response.columns,
    created_at: response.createdAt,
  };
}

function mapHistoryEntry(response: ReportHistoryEntryResponse): ReportHistoryEntry {
  return {
    id: response.id,
    report_type: response.reportType,
    format: response.format,
    template_name: response.templateName ?? undefined,
    created_at: response.createdAt,
  };
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      templates: [],
      history: [],
      hasHydrated: false,
      isLoading: true,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      fetchTemplates: async () => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) return;
        const response = await apiFetch<PaginatedResponse<ReportTemplateResponse>>(
          `/teams/${team_id}/report-templates`
        );
        set({ templates: response.items.map(mapTemplate) });
      },

      fetchHistory: async () => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) return;
        const response = await apiFetch<PaginatedResponse<ReportHistoryEntryResponse>>(
          `/teams/${team_id}/report-history`
        );
        set({ history: response.items.map(mapHistoryEntry) });
      },

      saveTemplate: async (name, report_type, columns) => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) throw new Error("Create a team before saving a report template.");
        const response = await apiFetch<ReportTemplateResponse>(`/teams/${team_id}/report-templates`, {
          method: "POST",
          body: { name, report_type, columns },
        });
        const template = mapTemplate(response);
        set((state) => ({ templates: [...state.templates, template] }));
        return template;
      },

      renameTemplate: async (id, name) => {
        const existing = get().templates.find((template) => template.id === id);
        if (!existing) return;
        const response = await apiFetch<ReportTemplateResponse>(`/report-templates/${id}`, {
          method: "PATCH",
          body: { name, report_type: existing.report_type, columns: existing.columns },
        });
        const template = mapTemplate(response);
        set((state) => ({ templates: state.templates.map((t) => (t.id === id ? template : t)) }));
      },

      duplicateTemplate: async (id) => {
        const response = await apiFetch<ReportTemplateResponse>(`/report-templates/${id}/duplicate`, {
          method: "POST",
        });
        const template = mapTemplate(response);
        set((state) => ({ templates: [...state.templates, template] }));
      },

      deleteTemplate: async (id) => {
        await apiFetch<void>(`/report-templates/${id}`, { method: "DELETE" });
        set((state) => ({ templates: state.templates.filter((template) => template.id !== id) }));
      },

      addHistoryEntry: async (report_type, format, template_name) => {
        const team_id = useOnboardingStore.getState().team_id;
        if (!team_id) return;
        const response = await apiFetch<ReportHistoryEntryResponse>(`/teams/${team_id}/report-history`, {
          method: "POST",
          body: { report_type, format, template_name },
        });
        const entry = mapHistoryEntry(response);
        set((state) => ({ history: [entry, ...state.history].slice(0, 50) }));
      },
    }),
    {
      name: "kickstartgh-reports-v3",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ templates: state.templates, history: state.history }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
