import { read, utils, write, writeFile } from "xlsx";

import {
  defaultImportStatus,
  importFields,
  importFieldsByKey,
  positionAliases,
  preferredFootAliases,
  statusAliases,
  type ImportFieldKey,
} from "@/config/player-import";
import type { Player } from "@/mock/players";
import type { PlayerFormInput } from "@/schemas/player";

export const acceptedImportTypes = ".xlsx,.xls,.csv";
/** Guards against someone dropping a 40MB export and freezing the tab while xlsx parses it. */
export const maxImportFileBytes = 5 * 1024 * 1024;
/** The endpoint creates every row in one request, so a very long sheet is a server risk too. */
export const maxImportRows = 300;

export type SheetColumn = { index: number; name: string };

export type ParsedSheet = {
  sheetName: string;
  columns: SheetColumn[];
  /** Data rows only, header excluded. Cell values kept raw so dates stay Dates. */
  rows: unknown[][];
  /** Non-fatal notes about the file itself (extra sheets, duplicate headers, truncation). */
  notes: string[];
};

export type ColumnMapping = Partial<Record<ImportFieldKey, string>>;

export type RowIssue = {
  field?: ImportFieldKey;
  message: string;
  severity: "error" | "warning";
};

export type ImportRow = {
  /** Row number as it appears in the spreadsheet, header being row 1. */
  sheetRow: number;
  values: PlayerFormInput;
  issues: RowIssue[];
};

export type ValidatedImport = {
  rows: ImportRow[];
  validRows: ImportRow[];
  errorCount: number;
  warningCount: number;
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[_\-.]+/g, " ").replace(/\s+/g, " ");
}

/**
 * Alias tables are hand-written with punctuation ("d.o.b", "no.") but headers are compared
 * after `normalizeHeader` has stripped it — so aliases have to go through the same
 * normalisation or none containing `.`/`-`/`_` can ever match. Missing this silently broke
 * date-of-birth detection for any sheet whose heading was "D.O.B".
 */
function normalizeAliases(aliases: string[]): string[] {
  return aliases.map(normalizeHeader);
}

function normalizedLookup<T extends string>(aliases: Record<string, T>): Map<string, T> {
  return new Map(Object.entries(aliases).map(([key, value]) => [normalizeHeader(key), value]));
}

const positionLookup = normalizedLookup(positionAliases);
const preferredFootLookup = normalizedLookup(preferredFootAliases);
const statusLookup = normalizedLookup(statusAliases);

/**
 * Whole-word phrase match. Plain `includes` would let `full_name`'s "name" alias hijack a
 * "Nickname" column on a sheet that has no name heading of its own.
 */
function containsPhrase(header: string, alias: string): boolean {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^| )${escaped}( |$)`).test(header);
}

function cellToString(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) return cell.toISOString();
  return String(cell).trim();
}

/** Reads the first sheet of an .xlsx/.xls/.csv into a header list plus raw data rows. */
export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { cellDates: true });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("That file has no sheets in it.");
  const sheet = workbook.Sheets[sheetName];

  const matrix = utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: null,
  });

  const headerRow = matrix[0];
  if (!headerRow || headerRow.every((cell) => cellToString(cell) === "")) {
    throw new Error("The first row needs to be column headings.");
  }

  const notes: string[] = [];
  if (workbook.SheetNames.length > 1) {
    notes.push(`Only the first sheet ("${sheetName}") is read — ${workbook.SheetNames.length - 1} other sheet(s) ignored.`);
  }

  const seen = new Set<string>();
  const columns: SheetColumn[] = [];
  headerRow.forEach((cell, index) => {
    const name = cellToString(cell);
    if (!name) return;
    if (seen.has(name)) {
      notes.push(`Column "${name}" appears more than once — only the first one can be mapped.`);
      return;
    }
    seen.add(name);
    columns.push({ index, name });
  });

  if (columns.length === 0) throw new Error("Couldn't read any column headings from the first row.");

  let rows = matrix
    .slice(1)
    .filter((row) => row.some((cell) => cellToString(cell) !== ""));

  if (rows.length > maxImportRows) {
    notes.push(`Only the first ${maxImportRows} rows are imported — ${rows.length - maxImportRows} were left out.`);
    rows = rows.slice(0, maxImportRows);
  }

  return { sheetName, columns, rows, notes };
}

/** Best-effort header → field guess. Exact alias match first, then a contains fallback. */
export function autoMapColumns(columns: SheetColumn[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const taken = new Set<string>();

  for (const field of importFields) {
    const aliases = normalizeAliases(field.aliases);

    const exact = columns.find(
      (column) => !taken.has(column.name) && aliases.includes(normalizeHeader(column.name))
    );
    if (exact) {
      mapping[field.key] = exact.name;
      taken.add(exact.name);
      continue;
    }

    const loose = columns.find((column) => {
      if (taken.has(column.name)) return false;
      const header = normalizeHeader(column.name);
      // Only match aliases of 4+ chars loosely — "no" or "#" would match almost anything.
      return aliases.some((alias) => alias.length >= 4 && containsPhrase(header, alias));
    });
    if (loose) {
      mapping[field.key] = loose.name;
      taken.add(loose.name);
    }
  }

  return mapping;
}

/**
 * Excel stores dates as a serial day count from 1899-12-30. `cellDates: true` converts
 * real date cells for us, but a column typed as text still arrives as a string, and CSVs
 * always do — so both paths are handled, plus the day-first ordering Ghanaian sheets use.
 */

/**
 * Formats a Date as a calendar day, snapped to the nearest midnight.
 *
 * Two separate off-by-one-day traps make the snap necessary rather than truncating:
 * - xlsx's serial round-trip can land a millisecond short of midnight, handing back
 *   `2004-03-17T23:59:59.999` for what the sheet shows as 18 March.
 * - `cellDates` builds dates with local-time semantics, so in any timezone behind UTC a
 *   local midnight is the previous day in UTC.
 *
 * Rounding to the nearest UTC day absorbs both (local offsets go no further than ±12h),
 * where either plain truncation or `toISOString()` alone silently moves the birthday.
 */
function toIsoDay(date: Date): string {
  const dayMs = 86400000;
  return new Date(Math.round(date.getTime() / dayMs) * dayMs).toISOString().slice(0, 10);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function todayIsoDay(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function parseDateOfBirth(cell: unknown): { value?: string; error?: string } {
  const text = cellToString(cell);
  if (cell === null || cell === undefined || text === "") {
    return { error: "Date of birth is required." };
  }

  let iso: string | null = null;

  if (cell instanceof Date) {
    iso = toIsoDay(cell);
  } else if (typeof cell === "number" && Number.isFinite(cell)) {
    iso = toIsoDay(new Date(Date.UTC(1899, 11, 30) + cell * 86400000));
  } else {
    const ymd = text.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
    const dmy = text.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
    if (ymd) {
      iso = `${ymd[1]}-${pad(Number(ymd[2]))}-${pad(Number(ymd[3]))}`;
    } else if (dmy) {
      // Day-first: "18/03/2004". Ambiguous pairs like 03/04 can't be resolved from one
      // row, so the whole column is read consistently day-first rather than guessed.
      iso = `${dmy[3]}-${pad(Number(dmy[2]))}-${pad(Number(dmy[1]))}`;
    } else {
      const parsed = new Date(text);
      if (!Number.isNaN(parsed.getTime())) iso = toIsoDay(parsed);
    }
  }

  // Built from digits above, so a nonsense month/day like 2004-13-40 gets caught here.
  if (!iso || Number.isNaN(new Date(`${iso}T00:00:00Z`).getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return { error: `Couldn't read "${text}" as a date. Use YYYY-MM-DD.` };
  }
  // Lexicographic comparison is exact for YYYY-MM-DD and sidesteps timezones entirely.
  if (iso > todayIsoDay()) return { error: "Date of birth can't be in the future." };
  if (iso < "1900-01-01") return { error: "Date of birth looks too far in the past." };

  return { value: iso };
}

function parseEnum<T extends string>(
  cell: unknown,
  lookup: Map<string, T>,
  fieldLabel: string
): { value?: T; error?: string } {
  const text = cellToString(cell);
  if (!text) return {};
  const matched = lookup.get(normalizeHeader(text));
  if (!matched) return { error: `"${text}" isn't a ${fieldLabel} we recognise.` };
  return { value: matched };
}

/**
 * Turns raw sheet rows into player payloads, annotated with everything wrong with them.
 * Errors exclude a row from the import; warnings don't. Runs entirely in the browser so
 * typos get fixed before a 30-player file is sent — the server still validates too.
 */
export function validateImportRows(
  sheet: ParsedSheet,
  mapping: ColumnMapping,
  existingPlayers: Player[]
): ValidatedImport {
  const indexFor = (key: ImportFieldKey): number | undefined =>
    sheet.columns.find((column) => column.name === mapping[key])?.index;

  const columnIndexes = Object.fromEntries(
    Object.keys(importFieldsByKey).map((key) => [key, indexFor(key as ImportFieldKey)])
  ) as Record<ImportFieldKey, number | undefined>;

  const takenJerseys = new Map<number, string>(
    existingPlayers.map((player) => [player.jersey_number, player.full_name])
  );
  const jerseysInFile = new Map<number, number>();

  const rows: ImportRow[] = sheet.rows.map((row, offset) => {
    const issues: RowIssue[] = [];
    const cell = (key: ImportFieldKey): unknown => {
      const index = columnIndexes[key];
      return index === undefined ? null : row[index];
    };
    const text = (key: ImportFieldKey): string => cellToString(cell(key));

    const full_name = text("full_name");
    if (!full_name) {
      issues.push({ field: "full_name", message: "Full name is required.", severity: "error" });
    } else if (full_name.length < 2) {
      issues.push({ field: "full_name", message: "Full name is too short.", severity: "error" });
    }

    const jerseyText = text("jersey_number");
    let jersey_number = Number.NaN;
    if (!jerseyText) {
      issues.push({ field: "jersey_number", message: "Jersey number is required.", severity: "error" });
    } else {
      jersey_number = Number(jerseyText);
      if (!Number.isInteger(jersey_number)) {
        issues.push({ field: "jersey_number", message: `"${jerseyText}" isn't a whole number.`, severity: "error" });
      } else if (jersey_number < 1 || jersey_number > 99) {
        issues.push({ field: "jersey_number", message: "Jersey number must be between 1 and 99.", severity: "error" });
      } else if (takenJerseys.has(jersey_number)) {
        issues.push({
          field: "jersey_number",
          message: `#${jersey_number} already belongs to ${takenJerseys.get(jersey_number)}.`,
          severity: "error",
        });
      } else {
        const duplicateRow = jerseysInFile.get(jersey_number);
        if (duplicateRow) {
          issues.push({
            field: "jersey_number",
            message: `#${jersey_number} is also used on row ${duplicateRow}.`,
            severity: "error",
          });
        } else {
          jerseysInFile.set(jersey_number, offset + 2);
        }
      }
    }

    const dob = parseDateOfBirth(cell("date_of_birth"));
    if (dob.error) issues.push({ field: "date_of_birth", message: dob.error, severity: "error" });

    const position = parseEnum(cell("position"), positionLookup, "position");
    if (position.error) {
      issues.push({ field: "position", message: position.error, severity: "error" });
    } else if (!position.value) {
      issues.push({ field: "position", message: "Position is required.", severity: "error" });
    }

    const secondary = parseEnum(cell("secondary_position"), positionLookup, "position");
    if (secondary.error) {
      issues.push({ field: "secondary_position", message: secondary.error, severity: "warning" });
    } else if (secondary.value && secondary.value === position.value) {
      issues.push({
        field: "secondary_position",
        message: "Secondary position matches the primary one — it'll be left blank.",
        severity: "warning",
      });
    }

    const foot = parseEnum(cell("preferred_foot"), preferredFootLookup, "foot");
    if (foot.error) issues.push({ field: "preferred_foot", message: foot.error, severity: "warning" });

    const status = parseEnum(cell("status"), statusLookup, "status");
    if (status.error) issues.push({ field: "status", message: status.error, severity: "warning" });

    const values = {
      full_name,
      nickname: text("nickname") || undefined,
      date_of_birth: dob.value ?? "",
      phone: text("phone") || undefined,
      emergency_contact: text("emergency_contact") || undefined,
      jersey_number,
      position: position.value,
      secondary_position:
        secondary.value && secondary.value !== position.value ? secondary.value : undefined,
      preferred_foot: foot.value,
      village: text("village") || undefined,
      previous_club: text("previous_club") || undefined,
      status: status.value ?? defaultImportStatus,
    } as PlayerFormInput;

    return { sheetRow: offset + 2, values, issues };
  });

  const validRows = rows.filter((row) => !row.issues.some((issue) => issue.severity === "error"));

  return {
    rows,
    validRows,
    errorCount: rows.filter((row) => row.issues.some((issue) => issue.severity === "error")).length,
    warningCount: rows.filter((row) =>
      row.issues.every((issue) => issue.severity !== "error") && row.issues.length > 0
    ).length,
  };
}

/** Every required field mapped? Nothing can be validated meaningfully until they are. */
export function missingRequiredFields(mapping: ColumnMapping): ImportFieldKey[] {
  return importFields
    .filter((field) => field.required && !mapping[field.key])
    .map((field) => field.key);
}

/** Downloads a starter .xlsx with the canonical headings and one filled-in example row. */
export function downloadImportTemplate() {
  const sheet = utils.aoa_to_sheet([
    importFields.map((field) => field.label),
    importFields.map((field) => field.example),
  ]);
  sheet["!cols"] = importFields.map((field) => ({ wch: Math.max(14, field.label.length + 2) }));

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, sheet, "Players");
  writeFile(workbook, "kickstartgh-players-template.xlsx");
}

/**
 * Rebuilds the validated rows into a fresh workbook with canonical headings, and returns
 * it alongside the identity mapping for the upload.
 *
 * Two reasons this uploads a rebuilt file rather than the one the user picked:
 *
 * 1. **The preflight has to mean something.** The endpoint imports whatever is in the
 *    file, so sending the original would import the rows the preview just flagged as
 *    broken. Rebuilding is what makes "import the 22 good rows, fix the other 3 later"
 *    possible at all.
 * 2. **It removes a whole class of server-side ambiguity.** Dates go out as ISO
 *    `YYYY-MM-DD` and enums as canonical values, so the backend can't re-read "18/03/2004"
 *    as a different day or choke on "GK".
 *
 * Still honours the documented contract — a file plus a `columns` mapping — the mapping
 * just happens to be one-to-one. Empty optional columns are omitted entirely.
 */
export function buildImportUpload(rows: ImportRow[]): { file: File; mapping: ColumnMapping } {
  const fields = importFields.filter(
    (field) =>
      field.required ||
      rows.some((row) => {
        const value = row.values[field.key as keyof PlayerFormInput];
        return value !== undefined && value !== null && String(value) !== "";
      })
  );

  const body = rows.map((row) =>
    fields.map((field) => {
      const value = row.values[field.key as keyof PlayerFormInput];
      return value === undefined || value === null ? "" : value;
    })
  );

  const sheet = utils.aoa_to_sheet([fields.map((field) => field.label), ...body]);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, sheet, "Players");

  const buffer = write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  const file = new File([buffer], "players-import.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const mapping: ColumnMapping = {};
  for (const field of fields) mapping[field.key] = field.label;

  return { file, mapping };
}
