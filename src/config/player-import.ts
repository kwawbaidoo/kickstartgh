import { positionOptions, preferredFootOptions, statusOptions } from "@/config/players";
import type { PlayerStatus, Position, PreferredFoot } from "@/mock/players";

/**
 * The player fields a spreadsheet can populate. Deliberately a subset of
 * `PlayerFormInput` — `photo` is excluded because a spreadsheet cell can't carry an
 * image, and season registration is handled by the server for whichever season is
 * active, exactly as `addPlayer` does for a single player.
 */
export const importFieldKeys = [
  "full_name",
  "jersey_number",
  "date_of_birth",
  "position",
  "secondary_position",
  "preferred_foot",
  "nickname",
  "phone",
  "emergency_contact",
  "village",
  "previous_club",
  "status",
] as const;

export type ImportFieldKey = (typeof importFieldKeys)[number];

export type ImportField = {
  key: ImportFieldKey;
  label: string;
  /**
   * Required mirrors what `POST /teams/:id/players` genuinely can't create a player
   * without. `preferred_foot` and `status` are required by the single-player *form* but
   * left optional here — a spreadsheet that doesn't carry them shouldn't be blocked, and
   * inventing a dominant foot for 25 players would be fabricating data.
   */
  required: boolean;
  /** Lowercased header spellings that auto-map to this field. */
  aliases: string[];
  /** Used in the downloadable template's example row. */
  example: string;
  hint?: string;
};

export const importFields: ImportField[] = [
  {
    key: "full_name",
    label: "Full name",
    required: true,
    aliases: ["full name", "fullname", "name", "player", "player name", "playername"],
    example: "Kofi Mensah",
  },
  {
    key: "jersey_number",
    label: "Jersey number",
    required: true,
    aliases: ["jersey number", "jersey", "jersey no", "shirt", "shirt number", "shirt no", "number", "no", "no.", "squad number", "kit number", "#"],
    example: "9",
    hint: "1–99, no duplicates",
  },
  {
    key: "date_of_birth",
    label: "Date of birth",
    required: true,
    aliases: ["date of birth", "dateofbirth", "dob", "d.o.b", "birth date", "birthdate", "birthday", "born"],
    example: "2004-03-18",
    hint: "Excel dates, or YYYY-MM-DD / DD-MM-YYYY",
  },
  {
    key: "position",
    label: "Position",
    required: true,
    aliases: ["position", "pos", "primary position", "main position", "role"],
    example: "Forward",
    hint: positionOptions.join(", "),
  },
  {
    key: "secondary_position",
    label: "Secondary position",
    required: false,
    aliases: ["secondary position", "secondary", "second position", "alt position", "alternate position", "other position"],
    example: "Midfielder",
  },
  {
    key: "preferred_foot",
    label: "Preferred foot",
    required: false,
    aliases: ["preferred foot", "foot", "strong foot", "dominant foot", "footedness"],
    example: "Right",
    hint: preferredFootOptions.join(", "),
  },
  {
    key: "nickname",
    label: "Nickname",
    required: false,
    aliases: ["nickname", "nick", "alias", "aka", "also known as"],
    example: "Kofi",
  },
  {
    key: "phone",
    label: "Phone",
    required: false,
    aliases: ["phone", "phone number", "mobile", "mobile number", "telephone", "tel", "contact", "contact number"],
    example: "024 123 4567",
  },
  {
    key: "emergency_contact",
    label: "Emergency contact",
    required: false,
    aliases: ["emergency contact", "emergency", "emergency number", "next of kin", "guardian", "parent"],
    example: "Ama Mensah 020 987 6543",
  },
  {
    key: "village",
    label: "Village / town",
    required: false,
    aliases: ["village", "town", "hometown", "community", "area", "location", "city"],
    example: "Tema",
  },
  {
    key: "previous_club",
    label: "Previous club",
    required: false,
    aliases: ["previous club", "previousclub", "last club", "former club", "previous team", "old club", "club"],
    example: "Tema Youth FC",
  },
  {
    key: "status",
    label: "Status",
    required: false,
    aliases: ["status", "player status", "availability", "squad status"],
    example: "Active",
    hint: `${statusOptions.join(", ")} — defaults to Active`,
  },
];

export const importFieldsByKey: Record<ImportFieldKey, ImportField> = Object.fromEntries(
  importFields.map((field) => [field.key, field])
) as Record<ImportFieldKey, ImportField>;

export const requiredImportFields = importFields.filter((field) => field.required);

/**
 * Spreadsheets from real teams don't spell enums the way the API does — a position column
 * is far more likely to read "GK" or "Striker" than "Goalkeeper". Every value maps to the
 * canonical option; anything unrecognised becomes a row error rather than a silent guess.
 */
export const positionAliases: Record<string, Position> = {
  gk: "Goalkeeper", g: "Goalkeeper", keeper: "Goalkeeper", goalie: "Goalkeeper", "goal keeper": "Goalkeeper", goalkeeper: "Goalkeeper",
  def: "Defender", d: "Defender", cb: "Defender", lb: "Defender", rb: "Defender", lwb: "Defender", rwb: "Defender",
  back: "Defender", fullback: "Defender", "full back": "Defender", "centre back": "Defender", "center back": "Defender",
  defence: "Defender", defense: "Defender", defender: "Defender",
  mid: "Midfielder", m: "Midfielder", cm: "Midfielder", dm: "Midfielder", am: "Midfielder", cdm: "Midfielder", cam: "Midfielder",
  midfield: "Midfielder", midfielder: "Midfielder",
  fwd: "Forward", f: "Forward", st: "Forward", cf: "Forward", lw: "Forward", rw: "Forward",
  striker: "Forward", attacker: "Forward", winger: "Forward", attack: "Forward", forward: "Forward",
};

export const preferredFootAliases: Record<string, PreferredFoot> = {
  l: "Left", left: "Left", lefty: "Left", "left foot": "Left", "left footed": "Left",
  r: "Right", right: "Right", righty: "Right", "right foot": "Right", "right footed": "Right",
  b: "Both", both: "Both", either: "Both", any: "Both", "two footed": "Both", ambidextrous: "Both",
};

export const statusAliases: Record<string, PlayerStatus> = {
  active: "Active", available: "Active", fit: "Active", ok: "Active", yes: "Active",
  injured: "Injured", injury: "Injured", inj: "Injured", hurt: "Injured",
  inactive: "Inactive", unavailable: "Inactive", released: "Inactive", left: "Inactive", no: "Inactive",
  suspended: "Suspended", suspension: "Suspended", banned: "Suspended", ban: "Suspended",
};

/** Applied when a status column isn't mapped, or a row leaves it blank. */
export const defaultImportStatus: PlayerStatus = "Active";
