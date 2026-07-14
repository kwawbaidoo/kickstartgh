# KickStartGH — Software Requirements Specification (Backend / API)

**Purpose:** This document specifies the data model, business rules, and required API
surface for everything currently implemented in the KickStartGH frontend (Sprints 1–6.5),
so the backend team can design and build real endpoints to replace the mock
Zustand/localStorage layer.

**Relationship to other docs:** `PRODUCT.md` describes the product vision. `API_CONTRACT.md`
is an early, partial sketch (5 example endpoints) — this document supersedes it in detail
and scope; keep `API_CONTRACT.md`'s base URL, auth header, and error-envelope conventions,
which are restated in §2 for completeness.

**Source of truth:** every field, enum, and business rule below was extracted directly from
the frontend's TypeScript types, Zod schemas, and Zustand store actions (all paths under
`src/`). Where the frontend's behavior is ambiguous or incomplete, it is flagged explicitly
in §9 (Gaps) rather than silently resolved.

---

## 1. Current Implementation State

The frontend is **fully mocked**: all data lives in Zustand stores seeded from `src/mock/*`
and persisted to `localStorage` per browser. There is:

- **No authentication.** No login/signup screen exists. The app assumes a single implicit
  user viewing a single implicit team (`currentTeam` in `src/mock/teams.ts`, id `team_001`).
- **No multi-team support.** Every entity carries a `teamId` field (ready for multi-tenancy)
  but the frontend never switches teams.
- **No real file storage.** Photos/logos/posters are stored as base64 data URIs produced by
  `FileReader` directly in the JSON blob — see §8.9.
- **No real WhatsApp integration.** "Share to WhatsApp" is always a `wa.me/?text=...` deep
  link opened client-side; no message is ever sent server-side.
- **No real invite/join flow.** The onboarding invite step fabricates a client-side code and
  a non-functional `kickstartgh.com/join/:code` URL; there is no backend to redeem it.

Everything else below (Teams, Players, Matches, Training/Attendance, Reports, Settings) is a
complete, working feature with real forms, validation, and derived statistics — it just needs
a backend behind it.

---

## 2. API Conventions

| Aspect | Convention |
|---|---|
| Base URL | `https://api.kickstartgh.com/api/v1` (prod), `http://localhost:8000/api/v1` (dev) — per `API_CONTRACT.md` |
| Auth | `Authorization: Bearer <token>` on all protected routes (auth itself is undesigned — see §4) |
| Content type | `application/json`, except file upload endpoints (`multipart/form-data`) |
| IDs | Opaque strings. Mocks use `entity_00N`; production should use UUIDs |
| Dates | `YYYY-MM-DD` (e.g. `dateOfBirth`, match/session `date`) |
| Times | 24h `HH:mm` (e.g. `kickoffTime`, `startTime`, `endTime`) |
| Timestamps | Full ISO 8601 UTC (e.g. `createdAt`) |
| Errors | See §2.1 |
| Pagination | Not implemented client-side today (all lists fetch-all); recommend adding cursor/offset pagination for `players`, `matches`, `sessions` since squads/seasons will grow — frontend can adopt it without redesign since it already filters/sorts client-side |

### 2.1 Error format (from `API_CONTRACT.md`, keep as-is)

```json
{
  "message": "Validation failed",
  "errors": {
    "phone": ["Phone number is required"]
  }
}
```

---

## 3. Actors & Roles

`config/roles.ts` currently implements **four** assignable staff roles:

| Role id | Label |
|---|---|
| `teamManager` | Team Manager |
| `headCoach` | Head Coach |
| `assistantCoach` | Assistant Coach |
| `captain` | Team Captain |

The Settings → Permissions screen (Sprint 6.5) additionally references a coarser,
**independent** set of role buckets — `Manager`, `Coach`, `Captain`, `Player` — for its
permission matrix. These two role vocabularies are **not currently unified in code** (see
Gap G1 in §9). The product spec (`SPRINT_006_5_PROMPT.md`) also names a `Team Owner` role
and a `Player` staff role that were never implemented as assignable staff roles. Backend
RBAC design should treat the **6-role spec** (Team Owner, Team Manager, Head Coach,
Assistant Coach, Captain, Player) as the target model and reconcile it with the matrix below.

### 3.1 Permission matrix (as implemented in `config/settings.ts`)

| Action | Manager | Coach | Captain | Player |
|---|---|---|---|---|
| Add Player | ✓ | ✓ | ✗ | ✗ |
| Create Match | ✓ | ✓ | ✗ | ✗ |
| Generate Reports | ✓ | ✓ | ✗ | ✗ |
| Edit Team | ✓ | ✗ | ✗ | ✗ |
| Manage Staff | ✓ | ✗ | ✗ | ✗ |
| Take Attendance | ✓ | ✓ | ✓ | ✗ |

This matrix is presently static UI-only display data (Step 11/12 of Sprint 6.5 explicitly
deferred backend authorization). The backend should treat it as the initial RBAC policy
table, keyed by role, enforced server-side on every mutating endpoint.

---

## 4. Authentication & Onboarding (undesigned — needs backend-driven design)

No login UI exists. The onboarding wizard (`src/app/onboarding/*`) only captures:

1. **Role selection** (`role/page.tsx`) — which of the 4 role ids the current person is.
2. **Team details** (`team/page.tsx`) — see §6.1.
3. **Staff setup** (`staff/page.tsx`) — add coaches/managers (§6.2), skippable.
4. **Invite** (`invite/page.tsx`) — displays a QR code + WhatsApp share link for a
   fabricated invite code/URL; nothing is redeemable.
5. **Success** (`success/page.tsx`) — completion screen.

**Required backend work not dictated by the frontend today:**

- User registration/login. Given the product is phone/WhatsApp-first for Ghana, phone +
  OTP is the natural fit, but this is a backend design decision, not a frontend constraint.
- `Team ↔ User` membership model (a user can belong to a team with a role).
- A real invite/join endpoint: generate a redeemable code/link server-side, and an endpoint
  the invitee's client calls to join a team with a chosen role.
- Session/token issuance and the `/me` profile endpoint.

Suggested minimal endpoints:

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account (phone or email) |
| POST | `/auth/login` | Authenticate, issue token |
| POST | `/auth/otp/request` , `/auth/otp/verify` | If phone/OTP is chosen |
| GET | `/me` | Current user + team memberships |
| POST | `/teams/:teamId/invites` | Generate a redeemable invite code |
| POST | `/invites/:code/redeem` | Join the team with a role |

---

## 5. Domain Model Overview

```
Team 1───* StaffMember
Team 1───* Player
Team 1───* Match ──* MatchEvent
Match 0..1───1 Lineup
Team 1───* AttendanceSession (Record<playerId, AttendanceStatus>)
Team/User 1───* ReportTemplate
Team/User 1───* ReportHistoryEntry
User 1───1 Profile
User 1───1 Preferences
User 1───1 NotificationSettings
User 1───1 SecuritySettings ──* Session (device session, not training session)
```

All top-level entities (Player, Match, AttendanceSession) carry `teamId` for tenancy.
There is currently no `userId` on any entity because there is no authenticated user — every
per-user entity in §8.8 (Settings) will need one added.

---

## 6. Entities

### 6.1 Team

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | — | server-generated |
| `name` | string | ✓ | min 2 chars |
| `nickname` | string | | defaults to initials of `name` if omitted |
| `region` | enum (16 Ghana regions, see Appendix A.1) | ✓ | |
| `district` | string | ✓ | min 2 chars |
| `homeGround` | string | ✓ | min 2 chars |
| `yearEstablished` | integer | ✓ | `1900 ≤ year ≤ currentYear` |
| `logo` | string (image) | | **currently a base64 data URI** — see §8.9 |
| `colorPrimary`, `colorSecondary` | hex color string | | defaults `#323232` / `#ffdb00` |
| `slogan` | string | | max 120 chars |
| `facebook`, `instagram`, `tiktok`, `website` | string (URL/handle) | | added in Sprint 6.5; free text today, no URL validation client-side |
| `createdAt` | ISO timestamp | — | |

Business rules:
- Team edits (Settings → Team) fully overwrite the mutable fields above (`PATCH`-style
  full replace); no partial-diff semantics needed.

### 6.2 StaffMember

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | — | |
| `teamId` | string | ✓ | FK |
| `role` | enum: `teamManager`\|`headCoach`\|`assistantCoach`\|`captain` | ✓ | |
| `fullName` | string | ✓ | min 2 chars |
| `phone` | string | ✓ | min 9 chars, pattern `^[0-9+\s-]+$` |

Business rules: no uniqueness constraint on phone/role today (a team can have two head
coaches). Add/remove/change-role are independent operations, not a full-list replace.

### 6.3 Player

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | — | |
| `teamId` | string | ✓ | |
| `fullName` | string | ✓ | min 2 chars |
| `nickname` | string | | |
| `photo` | string (image) | | base64 today, see §8.9 |
| `position` | enum: `Goalkeeper`\|`Defender`\|`Midfielder`\|`Forward` | ✓ | |
| `secondaryPosition` | same enum | | must differ from `position` |
| `jerseyNumber` | integer | ✓ | `1–99`, **unique per team** (validated against all other players' numbers, excluding self on edit) |
| `preferredFoot` | enum: `Left`\|`Right`\|`Both` | ✓ | |
| `dateOfBirth` | date string | ✓ | must not be in the future |
| `phone` | string | | |
| `emergencyContact` | string | | |
| `village` | string | | |
| `previousClub` | string | | |
| `status` | enum: `Active`\|`Injured`\|`Inactive` | ✓ | |
| `statusHistory` | array of `{status, date}` | — | **append-only log**; a new entry is appended only when `status` actually changes (see business rule below) |
| `createdAt` | ISO timestamp | — | |
| `stats.rating` | number | — | the **only** stored stat; everything else below is computed, never persisted |

**Critical business rule — derived vs. stored stats:** `matchesPlayed`, `goals`, `assists`,
`yellowCards`, `redCards`, and attendance % are **never stored on the player record**. They
are computed on every read from the Match/AttendanceSession collections (formulas in §7).
The backend should decide whether to replicate this compute-on-read approach or precompute/
cache these aggregates — but the **numbers themselves must match the formulas in §7 exactly**,
since reports and dashboards depend on them being consistent everywhere they're shown.

**Status history rule:** on every player update, compare incoming `status` to the current
stored `status`. If unchanged, leave `statusHistory` untouched. If changed, append
`{status: newStatus, date: now()}`. On player creation, seed `statusHistory` with one entry
for the initial status.

### 6.4 Match

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | — | |
| `teamId` | string | ✓ | |
| `opponent` | string | ✓ | min 2 chars |
| `competition` | string | ✓ | min 2 chars, free text (used for report/filter grouping) |
| `matchType` | enum: `Friendly`\|`League`\|`Tournament`\|`Knockout` | ✓ | |
| `venue` | string | ✓ | min 2 chars |
| `isHome` | boolean | ✓ | submitted as `homeAway: "Home"\|"Away"` on the form, stored as boolean |
| `date` | date string | ✓ | |
| `kickoffTime` | time string | ✓ | |
| `referee` | string | | |
| `notes` | string | | |
| `poster` | string (image) | | base64 today, see §8.9 |
| `status` | enum: `upcoming`\|`completed`\|`cancelled` | ✓ | defaults `upcoming` on create |
| `teamScore`, `opponentScore` | integer | | set only via "complete match" action |
| `lineup` | `Lineup \| null` | | `null` until set |
| `events` | `MatchEvent[]` | — | append/remove only, never bulk-replaced |
| `createdAt` | ISO timestamp | — | |

#### 6.4.1 Lineup

| Field | Type | Notes |
|---|---|---|
| `formation` | enum: `4-4-2`\|`4-3-3`\|`3-5-2`\|`5-3-2` | |
| `startingXI` | `string[]` (player ids) | ordered FWD→MID→DEF→GK for UI layout; count must match the formation's slot count |
| `substitutes` | `string[]` (player ids) | |
| `captainId` | string (player id) | optional, must be in `startingXI` |

#### 6.4.2 MatchEvent (discriminated union by `type`)

| `type` | Fields | Notes |
|---|---|---|
| `goal` | `minute`, `playerId`, `assistPlayerId?` | |
| `yellow_card` | `minute`, `playerId` | |
| `red_card` | `minute`, `playerId` | |
| `substitution` | `minute`, `playerOutId`, `playerInId` | |
| `injury` | `minute`, `playerId` | |

Every event has a server-generated `id`. Events are immutable once created except for
deletion (no "edit event" action exists client-side — the UI removes and re-adds instead).

Business rules:
- **Completing a match** requires `teamScore` and `opponentScore` and sets `status: "completed"`.
- **Cancelling a match** sets `status: "cancelled"` and leaves scores/lineup/events untouched.
- A player counts as having "played" a completed match if they're in `startingXI` **or**
  appear as the incoming player (`playerInId`) of a `substitution` event.

### 6.5 AttendanceSession (Training)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | — | |
| `teamId` | string | ✓ | |
| `title` | string | ✓ | min 2 chars |
| `date` | date string | ✓ | |
| `startTime`, `endTime` | time string | ✓ | `endTime` must be strictly after `startTime` |
| `venue` | string | ✓ | min 2 chars |
| `description` | string | | |
| `focus` | enum, see Appendix A.2 | | |
| `equipment` | `string[]` | | free-text tags |
| `notes` | string | | |
| `status` | enum: `upcoming`\|`completed`\|`cancelled` | ✓ | defaults `upcoming` on create |
| `records` | `Record<playerId, AttendanceStatus>` | — | sparse map; a missing key means "unmarked", not "absent" |
| `createdAt` | ISO timestamp | — | |

`AttendanceStatus` enum: `present` \| `late` \| `excused` \| `injured` \| `absent`.

Business rules:
- Attendance is set per-player (`PATCH` one record) or in bulk for a set of player ids
  (same status applied to all) — both are common UI actions and should be separate,
  cheap endpoints rather than requiring a full-session rewrite.
- "Complete session" / "cancel session" are status-only transitions, independent of marking
  attendance (a session can be marked complete with some players still unmarked).
- Deleting an upcoming/completed session is unconstrained today (no dependent-record checks).

### 6.6 Reports

#### ReportTemplate (saved column selections)

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | |
| `reportType` | enum: `player`\|`team`\|`match`\|`attendance` | |
| `columns` | `string[]` | keys into the column catalog for that `reportType`, see Appendix A.3 |
| `createdAt` | ISO timestamp | |

Actions needed: create, rename, duplicate (server should generate a new id + `"(Copy)"`
suffix + fresh `createdAt`, per current client behavior), delete.

#### ReportHistoryEntry (export log)

| Field | Type | Notes |
|---|---:|---|
| `id` | string | |
| `reportType` | enum, same as above | |
| `format` | enum: `PDF`\|`Excel`\|`CSV`\|`Print` | |
| `templateName` | string? | present if generated from a saved template |
| `createdAt` | ISO timestamp | |

Client currently keeps only the most recent 50 entries (`history.slice(0, 50)`); replicate
that cap or make it a real paginated/archived log server-side.

#### Report data shape (what every report ultimately renders/exports)

```json
{
  "columns": [{ "key": "fullName", "label": "Name" }],
  "rows": [{ "fullName": "Kwesi Mensah", "goals": "3" }]
}
```

All row values are pre-formatted **strings** (dates, percentages with `%`, etc.) — this is a
display-ready shape, not raw typed data. See Appendix A.3 for the exact column catalog per
report type and Appendix A.4 for the filter parameters each report type accepts.

**Open design question for backend:** today, PDF/Excel/CSV generation and the `window.print()`
call all happen **entirely client-side** (`jsPDF`, `xlsx`, browser print) against this
`{columns, rows}` shape. Backend can either (a) just serve the `{columns, rows}` data and let
the client keep generating files, or (b) take over file generation and return a
`downloadUrl` (as sketched in `API_CONTRACT.md`). (a) is the smaller change; (b) centralizes
formatting logic. This should be an explicit decision, not an accident.

### 6.7 Settings (per authenticated user — today there is no user, so these are effectively global)

#### Profile

| Field | Type | Required | Notes |
|---|---|---|---|
| `fullName` | string | ✓ | min 2 chars |
| `phone` | string | ✓ | min 9 chars, pattern `^[0-9+\s-]+$` |
| `email` | string | | valid email or empty |
| `photo` | string (image) | | base64 today |
| `preferredRole` | enum, same 4 role ids as §3 | ✓ | |
| `dateJoined` | ISO timestamp | — | read-only, set once |

#### Preferences

| Field | Type | Notes |
|---|---|---|
| `theme` | `light`\|`dark`\|`system` | client applies immediately, no server behavior needed beyond persistence |
| `language` | `en`\|`tw`\|`fa` | only `en` is functional today; `tw`/`fa` are disabled options reserved for future i18n |
| `dateFormat` | `DD/MM/YYYY`\|`MM/DD/YYYY` | display-only |
| `defaultHomeScreen` | one of `/dashboard`,`/players`,`/matches`,`/training`,`/reports` | client-side route |
| `favoriteShortcuts` | `string[]` of route paths | toggle set, from a fixed catalog of 5 shortcuts |

#### NotificationSettings

A matrix of 4 notification types × 4 channels, each an independent boolean:

Types: `matchReminders`, `trainingReminders`, `teamAnnouncements`, `reportNotifications`.
Channels: `inApp`, `whatsapp`, `email`, `sms` (**`sms` is UI-disabled/future** — do not
build SMS delivery yet, just accept the field).

```json
{
  "matchReminders": { "inApp": true, "whatsapp": true, "email": false, "sms": false },
  "trainingReminders": { "inApp": true, "whatsapp": true, "email": false, "sms": false },
  "teamAnnouncements": { "inApp": true, "whatsapp": false, "email": false, "sms": false },
  "reportNotifications": { "inApp": true, "whatsapp": false, "email": true, "sms": false }
}
```

No actual notification delivery is implemented anywhere in the frontend yet — these toggles
currently do nothing besides persist. Backend notification delivery (WhatsApp Business API,
email, push) is entirely new work, not a port of existing logic.

#### SecuritySettings

| Field | Type | Notes |
|---|---|---|
| `lastLogin` | ISO timestamp | |
| `twoFactorEnabled` | boolean | **UI-only toggle, no real 2FA enrollment flow exists** |
| `sessions` | `Session[]` | device sessions list |

`Session`: `{id, device, location, lastActive, current?}`. Actions needed: change password
(old + new, `new.length ≥ 8`, confirm must match — no server-side rule beyond that today),
log out one session, log out all sessions except the current one. **None of this is backed
by real auth yet** — building real password/2FA/session management is new backend work that
the frontend UI anticipates but doesn't implement server logic for.

---

## 7. Derived / Computed Values — exact formulas

These formulas are the actual business logic today (`src/lib/matches.ts`,
`src/lib/attendance.ts`, `src/lib/training.ts`). Reproduce them exactly wherever the backend
computes or caches these numbers, since the frontend shows them in multiple places
(dashboard, player profile, reports) and they must agree.

**Player match stats** (over `completed` matches only):
- `matchesPlayed` — count of completed matches where the player is in `lineup.startingXI`
  OR is the `playerInId` of some substitution event.
- `goals` — count of `goal` events where `playerId` = this player.
- `assists` — count of `goal` events where `assistPlayerId` = this player.
- `yellowCards` / `redCards` — count of matching card events for this player.

**Team stats** (over `completed` matches):
- `played`, `wins`, `draws`, `losses` from match results (`teamScore` vs `opponentScore`).
- `goalsFor` / `goalsAgainst` — sum of `teamScore` / `opponentScore`.
- `winPercentage = round(wins / played * 100)`, `0` if `played = 0`.
- `trend`: compare win rate of the **last 3** completed matches vs. all matches before that;
  `"up"` if higher, `"down"` if lower, `null` if there isn't at least one match in each
  bucket or the rates are equal.

**Player attendance stats** (blends training sessions *and* completed matches into one number):
- For each training session where the player has a recorded status: increment
  `totalSessions`; bucket into `presentCount`/`absentCount`/`lateCount`/`excusedCount`/`injuredCount`.
- For each **completed** match that has a lineup: increment `totalSessions`; count as
  "present" (`presentCount += 1`) if the player is in `startingXI` or `substitutes`,
  otherwise "absent".
- `attendancePercentage = round((presentCount + lateCount * 0.5) / totalSessions * 100)`,
  `0` if `totalSessions = 0`. **Late counts as half-present.**
- Unmarked sessions (no key in `records`) do not count at all, in either direction.

**Team training stats** (training-only, matches deliberately excluded — used on the
Training dashboard, as opposed to the blended stat above used in Reports):
- Same per-player formula as above but with an **empty match list**, over `completed`
  sessions only.
- `teamAttendancePercentage` = average of all players' `attendancePercentage` who have
  at least one recorded session.
- `mostCommitted` / `lowestAttendance` = top/bottom 3 by that percentage.
- `monthlyAverages` — group completed sessions by calendar month; for each month,
  `percentage = round(weightedPresent / totalRecords * 100)` where every recorded status
  contributes 1 to `totalRecords` and `present` contributes 1 / `late` contributes 0.5 to
  `weightedPresent`.

**Session attendance summary** (for a single session, e.g. after taking attendance):
- Computed only over currently-**Active** players (not the whole roster).
- `attendancePercentage = round((present + late * 0.5) / marked * 100)` where
  `marked = total - unmarked`. `0` if nothing is marked yet.

**Consecutive streaks** (`getConsecutiveCounts`): sort a player's recorded sessions by date
descending; count a run of `present`/`late` from the most recent session backward
(`consecutivePresent`), and separately a run of `absent` (`consecutiveAbsent`). Either streak
stops at the first session that doesn't match.

**Age / age group** (`getAge`, `getAgeGroup`): standard birthday-aware age calculation;
buckets: `Under 18` (<18), `18-24`, `25-30`, `31+`.

**Report period cutoffs** (`getPeriodCutoff`, used by the Attendance report):
`weekly` = last 7 days, `monthly` = last 1 calendar month, `seasonal` = last 6 calendar
months, all relative to "now".

---

## 8. Functional Requirements & Endpoints by Module

Standard CRUD conventions apply unless noted: `GET` (list, with the entity's filters as
query params), `GET /:id`, `POST` (create), `PATCH /:id` or `PUT /:id` (full-form update —
the frontend always submits the entire form, never a partial diff), `DELETE /:id`.

### 8.1 Teams

| Method | Path | Notes |
|---|---|---|
| GET | `/teams/:id` | |
| POST | `/teams` | onboarding create — see §6.1 |
| PATCH | `/teams/:id` | Settings → Team Settings, full-form replace |

### 8.2 Staff

| Method | Path | Notes |
|---|---|---|
| GET | `/teams/:teamId/staff` | |
| POST | `/teams/:teamId/staff` | |
| PATCH | `/teams/:teamId/staff/:id` | today only used to change `role` |
| DELETE | `/teams/:teamId/staff/:id` | |

### 8.3 Players

| Method | Path | Notes |
|---|---|---|
| GET | `/teams/:teamId/players` | supports filters: `search`, `position`, `ageGroup`, `status`; sort: `name`\|`jerseyNumber`\|`recent` (see §7 for `ageGroup` derivation) |
| GET | `/players/:id` | should include computed `stats` per §7 |
| POST | `/players` | validate jersey-number uniqueness within `teamId` |
| PATCH | `/players/:id` | full form replace; apply the status-history rule from §6.3 |
| PATCH | `/players/:id/status` | quick status-only change (still applies the history rule) |
| DELETE | `/players/:id` | |

### 8.4 Matches

| Method | Path | Notes |
|---|---|---|
| GET | `/teams/:teamId/matches` | filters: `search`, `competition`, `homeAway`; typically split by `status` (upcoming/completed/cancelled) client-side |
| GET | `/matches/:id` | |
| POST | `/matches` | defaults `status: "upcoming"`, `lineup: null`, `events: []` |
| PATCH | `/matches/:id` | full form replace (does not touch lineup/events/status/scores) |
| DELETE | `/matches/:id` | |
| PUT | `/matches/:id/lineup` | full replace of `Lineup` |
| POST | `/matches/:id/events` | append one event, returns it with server `id` |
| DELETE | `/matches/:id/events/:eventId` | |
| POST | `/matches/:id/complete` | body `{teamScore, opponentScore}`, sets `status: "completed"` |
| POST | `/matches/:id/cancel` | sets `status: "cancelled"` |

### 8.5 Training / Attendance

| Method | Path | Notes |
|---|---|---|
| GET | `/teams/:teamId/sessions` | |
| GET | `/sessions/:id` | |
| POST | `/sessions` | defaults `status: "upcoming"`, `records: {}` |
| PATCH | `/sessions/:id` | full form replace (title/date/time/venue/focus/etc., not attendance) |
| DELETE | `/sessions/:id` | |
| PATCH | `/sessions/:id/attendance/:playerId` | body `{status}}`, single-player set |
| PATCH | `/sessions/:id/attendance` | body `{playerIds: string[], status}`, bulk set |
| POST | `/sessions/:id/complete` | status-only transition |
| POST | `/sessions/:id/cancel` | status-only transition |

### 8.6 Reports

| Method | Path | Notes |
|---|---|---|
| GET | `/teams/:teamId/reports/player` | query: `position`, `ageGroup`, `status`, `columns[]` → returns `{columns, rows}` per §6.6, using formulas in §7 |
| GET | `/teams/:teamId/reports/team` | query: `columns[]` |
| GET | `/teams/:teamId/reports/match` | query: `status`, `competition`, `columns[]` |
| GET | `/teams/:teamId/reports/attendance` | query: `period` (`weekly`\|`monthly`\|`seasonal`), `columns[]` |
| GET/POST/PATCH/DELETE | `/report-templates` | saved column selections, see §6.6 |
| POST | `/report-templates/:id/duplicate` | |
| GET | `/report-history` | most recent 50 (or paginate properly) |
| POST | `/report-history` | log an export event: `{reportType, format, templateName?}` |

See Appendix A.3 for the exact column catalog (`columns[]` values) per report type, and
Appendix A.4 for each report type's filter parameters.

### 8.7 Settings

| Method | Path | Notes |
|---|---|---|
| GET/PATCH | `/me/profile` | §6.7 Profile |
| GET/PATCH | `/me/preferences` | §6.7 Preferences — each field is independently, instantly settable client-side; a single `PATCH` with a partial body matches that UX best |
| GET/PATCH | `/me/notifications` | §6.7 NotificationSettings, same partial-`PATCH` shape |
| GET | `/me/security` | §6.7 SecuritySettings |
| POST | `/me/security/password` | `{currentPassword, newPassword}` |
| POST | `/me/security/2fa/toggle` | UI-only today; real 2FA enrollment is new backend work |
| DELETE | `/me/security/sessions/:id` | log out one session |
| DELETE | `/me/security/sessions` | log out all except current |

### 8.8 Data Export

The client already has full CSV/Excel/PDF/Print generation (§6.6). No new backend endpoint
is strictly required beyond the report-data endpoints in §8.6, **unless** the backend takes
over file generation (see the open question in §6.6), in which case add:

| Method | Path | Notes |
|---|---|---|
| POST | `/teams/:teamId/exports` | body: `{dataType: players\|team\|matches\|reports\|attendance, format: PDF\|Excel\|CSV}` → `{downloadUrl}` |

### 8.9 Media Upload (cross-cutting)

Every `photo`/`logo`/`poster` field above is, in the current frontend, a base64 data URI
produced client-side and stored inline in the entity's JSON. This does not scale to a real
backend (huge payloads, no CDN, no caching). Replace with:

| Method | Path | Notes |
|---|---|---|
| POST | `/uploads` | multipart file upload → `{url}` |

...and change `photo`/`logo`/`poster`/profile `photo` fields to plain URL strings once the
upload endpoint exists. This affects: Player, Team, Match (`poster`), Profile.

---

## 9. Gaps & Open Questions

These are explicitly **not** resolved by the frontend and need backend/product decisions:

- **G1 — Role model mismatch.** Staff roles (`teamManager`/`headCoach`/`assistantCoach`/
  `captain`) and the Permissions matrix roles (`Manager`/`Coach`/`Captain`/`Player`) are two
  separate, unreconciled vocabularies in the current code (§3). Pick one canonical role
  enum before building RBAC.
- **G2 — No auth exists.** Everything in §4 needs to be designed from scratch; the frontend
  provides no login/signup screen to reverse-engineer from.
- **G3 — Invite/join is fully mocked.** The QR code and `kickstartgh.com/join/:code` link
  are fabricated client-side with no backend counterpart.
- **G4 — File uploads are base64-in-JSON.** See §8.9.
- **G5 — Notification delivery is unimplemented.** Toggles exist and persist, but no
  WhatsApp Business API / email / push sending exists anywhere.
- **G6 — 2FA and password change are UI-only.** No real credential storage or verification
  exists to attach these flows to.
- **G7 — Report file generation location undecided.** See the open question in §6.6 —
  client-side (as today) vs. server-side `downloadUrl`.
- **G8 — Offline/sync strategy undefined.** The product principle "offline-friendly" (per
  `CLAUDE.md`/`PRODUCT.md`) is currently satisfied only by `localStorage` persistence with
  no server sync, no conflict resolution, and no multi-device story. This needs real design
  once a backend exists (e.g. background sync queue, last-write-wins vs. merge, etc.).
- **G9 — Multi-team / multi-user is schema-ready but unexercised.** Every entity has
  `teamId`; nothing in the frontend ever operates on more than one team, so the multi-tenant
  boundary (can user A see team B's data?) has never been tested against real UI flows.

---

## Appendix A — Enum & Catalog Reference

### A.1 Ghana Regions (`region` field)

Ahafo, Ashanti, Bono, Bono East, Central, Eastern, Greater Accra, North East, Northern, Oti,
Savannah, Upper East, Upper West, Volta, Western, Western North.

### A.2 Training Focus (`focus` field)

Fitness, Tactical, Shooting, Defending, Goalkeeping, Recovery, Friendly Match, General Training.

### A.3 Report column catalogs (`columns[]` values, by `reportType`)

**player**: `fullName`, `nickname`, `dateOfBirth`, `position`, `jerseyNumber`,
`preferredFoot`, `phone`, `matchesPlayed`, `goals`, `assists`, `yellowCards`, `redCards`,
`attendance`

**team**: `name`, `region`, `homeGround`, `headCoach`, `assistantCoach`, `captain`,
`playerCount`, `matchesPlayed`, `wins`, `draws`, `losses`, `goalsFor`, `goalsAgainst`,
`winPercentage`

**match**: `opponent`, `competition`, `date`, `venue`, `scoreline`, `scorers`, `assists`,
`cards`, `substitutions`, `notes`

**attendance**: `rank`, `fullName`, `attendancePercentage`, `presentCount`, `absentCount`,
`lateCount`

### A.4 Report filter parameters (by `reportType`)

| Report type | Filters |
|---|---|
| player | `position` (enum or `All`), `ageGroup` (enum or `All`), `status` (enum or `All`) |
| team | none (whole-team snapshot) |
| match | `status` (enum or `All`), `competition` (string or `All`) |
| attendance | `period`: `weekly`\|`monthly`\|`seasonal` |

### A.5 Match Types / Formations / Event Types

- `matchType`: Friendly, League, Tournament, Knockout
- `formation`: 4-4-2, 4-3-3, 3-5-2, 5-3-2
- `MatchEventType`: goal, yellow_card, red_card, substitution, injury

### A.6 Export formats

PDF, Excel, CSV, Print (Print is client-side `window.print()` only — not a file).

---

## Appendix B — Frontend Source Cross-Reference

| Module | Key frontend files |
|---|---|
| Teams / Staff / Onboarding | `src/schemas/onboarding.ts`, `src/store/onboarding-store.ts`, `src/mock/teams.ts` |
| Players | `src/schemas/player.ts`, `src/store/players-store.ts`, `src/mock/players.ts`, `src/lib/players.ts` |
| Matches | `src/schemas/match.ts`, `src/store/matches-store.ts`, `src/mock/matches.ts`, `src/lib/matches.ts` |
| Training / Attendance | `src/schemas/training.ts`, `src/store/attendance-store.ts`, `src/mock/attendance.ts`, `src/lib/attendance.ts`, `src/lib/training.ts` |
| Reports | `src/config/reports.ts`, `src/lib/reports.ts`, `src/store/reports-store.ts`, `src/lib/export.ts` |
| Settings | `src/config/settings.ts`, `src/schemas/settings.ts`, `src/store/settings-store.ts` |
| Roles / Permissions | `src/config/roles.ts`, `src/config/settings.ts` (`permissionMatrix`) |
