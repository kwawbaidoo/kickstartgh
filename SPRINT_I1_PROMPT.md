# Sprint I1: Contract Reconciliation & Casing Migration

**Status: delivered.** Every entity field in `src/` is now `snake_case`, with the
report-column/notification-key/query-param exceptions below preserved. `npx tsc --noEmit`
and `npm run lint` are clean; onboarding, players, matches, training, and every report
builder were smoke-tested in a real browser. Kept as a record of the decision and the
exact field-by-field mapping, for reference during Sprint I2 onward.

## Context

You are continuing development of KickStartGH, a mobile-first football management
platform for grassroots football teams in Ghana. `INTEGRATION_PLAN.md` sequences the
move from the fully-mocked frontend (Sprints 1–8, see `ROADMAP.md`) to the real backend
described by `postman_collection.json`, one domain at a time instead of all at once.
This sprint is the "before Sprint I1" reconciliation work from `INTEGRATION_PLAN.md` §1,
promoted to its own sprint because it touches every domain at once and has to happen
exactly once, cleanly, before any domain-specific wiring (Auth, Team/Staff, Seasons,
Players, Matches, Training, Reports, Settings) starts.

Before working on this sprint, review:

* `INTEGRATION_PLAN.md` (this sprint implements §1 and part of §2)
* `SRS.md` (entity/endpoint reference)
* `postman_collection.json` (the real backend contract)

Still mocked. This sprint does **not** add a real network call anywhere — no live
backend was available to test against. It changes the frontend's own data shape to
already match the backend's, so that when Sprint I2 onward wire real `fetch` calls, the
object shapes need zero field-by-field translation.

---

## Sprint Goal

Make every entity field name in the frontend `snake_case`, matching
`postman_collection.json`'s JSON body convention, instead of building a translation
layer at the API client boundary.

---

## Decision: casing is per-context, not uniform

Diffing `postman_collection.json` closely (not just skimming it) turned up a real,
consistent pattern, not a uniform convention:

| Context | Casing in the real backend | Example |
|---|---|---|
| JSON request/response body fields | `snake_case` | `full_name`, `home_ground`, `jersey_number`, `date_of_birth` |
| URL query-string parameter names | `camelCase` | `?seasonId=...&ageGroup=...&homeAway=...` |
| Report `columns[]` values / report-template columns | `camelCase` | `columns[]=fullName`, `columns[]=winPercentage` |
| One Settings endpoint's body | `camelCase` (inconsistent with the rest of the body convention — confirm with backend, may be a typo in their collection) | `PATCH /me/notifications` body: `{"matchReminders": {"whatsapp": false}}` |

So: **entity data fields → `snake_case`. Report-column identifiers, the
`NotificationType` keys, and (later, once real query strings exist) query-parameter
names stay `camelCase`**, because that's what actually matches the backend in each of
those specific spots. Converting those specific spots to `snake_case` too would
"fix" a mismatch that doesn't exist and introduce a new one that does.

This is why the rename below is **field-by-field, not a global find-and-replace** —
six identifiers (`fullName`, `dateOfBirth`, `jerseyNumber`, `preferredFoot`,
`homeGround`, `headCoach`) are genuine entity fields in most files but are *also* used
as report-column keys in `config/reports.ts` / `lib/reports.ts` / the report row
builders — those specific occurrences must not change.

---

## Step 1: Rename entity fields to `snake_case`

Apply across every schema, mock/type, and store (the source-of-truth layer), then
every consumer (forms, cards, pages, PDF/Excel export, lineup/event logic):

* Team: `homeGround`, `yearEstablished`, `colorPrimary`, `colorSecondary`,
  `logoInitials`, `headCoach` (entity field only — not the role-id value, not the
  report-column key)
* Staff/Auth: `fullName` (entity field only — not the report-column key),
  `currentPassword`, `newPassword`, `confirmPassword`
* Player: `dateOfBirth`, `jerseyNumber`, `preferredFoot`, `secondaryPosition`,
  `previousClub`, `emergencyContact`, `workExperience`, `otherSports`, `socialLinks`,
  `statusHistory`, `seasonRecords`, `registeredAt` (all as entity fields only, per the
  same exception above for the ones shared with report columns)
* Match: `matchType`, `kickoffTime`, `teamScore`, `opponentScore`, `isHome`,
  `startingXI`, `captainId`, `benchOfficials`, `staffId`, `playerOutId`, `playerInId`,
  `assistPlayerId`, `playerId`
* Season: `startDate`, `endDate`, `competitionCategory`
* Training: `startTime`, `endTime`
* Settings: `preferredRole`, `dateFormat`, `defaultHomeScreen`, `dateJoined`,
  `favoriteShortcuts`, `lastActive`, `lastLogin`, `twoFactorEnabled`
* Reports (template/history entities themselves, not their column catalogs):
  `reportType`, `templateName`
* Cross-cutting IDs: `teamId`, `seasonId`, `matchId`, `eventId`, `sessionId`,
  `inviteCode`, `createdAt`

Do **not** rename:

* `NotificationType` keys (`matchReminders`, `trainingReminders`, `teamAnnouncements`,
  `reportNotifications`) in `config/settings.ts` / `settings-store.ts`.
* Report-column `key` values in `config/reports.ts`, and the row-object keys built in
  `lib/reports.ts` (`fullName`, `dateOfBirth`, `jerseyNumber`, `preferredFoot`,
  `homeGround`, `headCoach`, plus the report-only computed keys like `matchesPlayed`,
  `yellowCards`, `redCards`, `winPercentage`, `attendancePercentage`, `presentCount`,
  `absentCount`, `lateCount`, `goalsFor`, `goalsAgainst`, `scoreline`).
* `homeAway` in `schemas/match.ts` / `MatchForm` / `fromFormInput` — a client-only
  radio-selection convenience that's converted to `isHome`/`is_home` before it ever
  touches the `Match` entity; it never crosses the wire under that name.
* Any enum *values* (`"headCoach"` as a role id, `"Active"`, `"League"`, `"goal"`,
  `"yellow_card"`, etc.) — those are content, not field names, and already match
  whatever the backend sends today.

## Step 2: Verify

* `npx tsc --noEmit` must be clean. React Hook Form's `register`/`Controller`/`useWatch`
  generics are typed against each schema's field-path type, so a stale field-name
  string (`register("fullName")` after the schema key becomes `full_name`) is a
  compiler error, not a silent runtime bug — use that as the completeness checklist.
* `npm run lint` clean.
* Manually exercise, in a real browser: onboarding (team → staff → invite), player
  create/edit, match create/lineup/events, a training session with attendance, and
  every report builder (the report tables must still render with the right values in
  the right columns — this is exactly where a wrong rename would silently show blank
  cells instead of throwing).

## Step 3: Update the specs

* `SRS.md` §2 and every entity table in §6 should move to `snake_case` field names to
  match reality, and note the query-string/report-column camelCase exception next to
  §2's conventions table.
* `API_CONTRACT.md`'s example payloads are now stale (camelCase) — either update them
  or mark the whole document superseded in favor of `postman_collection.json` and
  `SRS.md`, per `INTEGRATION_PLAN.md` §3 Sprint I9.

---

## Deliverables

* Every schema, mock type, and store field renamed to `snake_case` (except the
  documented exceptions above), and every consuming component/page/lib updated to
  match.
* `INTEGRATION_PLAN.md` §1 item 1 (casing) marked resolved, with the per-context
  decision recorded there instead of left as an open question.
* Still fully mocked — Sprint I2 (Team/Staff/Invites) is the first sprint that talks to
  a real server.

## Explicitly out of scope for this sprint

* The Auth/OTP UI rework flagged in `INTEGRATION_PLAN.md` §1a — that needs a product
  decision (phone+OTP vs. identifier+password) before any UI work starts, and belongs
  to Sprint I1 in the original plan's networking sense, not this reconciliation pass.
* Building the actual `apiFetch`/React Query client — nothing to point it at yet.
* The base-URL question (`/api` vs `/api/v1`) — needs the backend owner to confirm.
