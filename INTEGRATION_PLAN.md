# INTEGRATION_PLAN.md

# KickStartGH Backend Integration Plan

**Purpose:** Sprints 1–8 (see `ROADMAP.md`) built a fully-mocked frontend — every entity
lives in Zustand + `localStorage`, seeded from `src/mock/*` (see `SRS.md` §1). A real
backend now exists, described by `postman_collection.json` ("KickStartGH API"). This
document is the plan for replacing the mock layer with real API calls **one bounded
domain at a time**, instead of rewiring every store in a single pass.

Rewiring everything at once means every screen in the app is simultaneously untested
against the real backend, with no way to isolate which domain broke. Going module by
module keeps the blast radius of each change to one Zustand store and the screens that
read it, with the mock layer as an instant rollback.

---

## 1. Reconcile the contract first (blocking, before Sprint I1)

`postman_collection.json` was diffed against this repo's existing specs (`SRS.md`,
`API_CONTRACT.md`) and current frontend types. Most of the surface lines up cleanly
(Teams, Staff, Seasons, most of Players/Matches/Sessions, Reports, Settings, Uploads).
The items below are the real discrepancies — resolve these **before** any integration
sprint starts, since every sprint would otherwise hit them independently and redo the
same investigation.

| # | Discrepancy | Postman (real backend) | SRS.md / API_CONTRACT.md / current frontend | Action |
|---|---|---|---|---|
| 1 | Field casing | `snake_case` for JSON body fields; `camelCase` for query-string parameter names/values, report-`columns[]` identifiers, and (inconsistently) the `/me/notifications` body | Was `camelCase` everywhere in `src/` | **Resolved (Sprint I1, `SPRINT_I1_PROMPT.md`):** the frontend now uses `snake_case` for every entity field, matching the backend directly — no translation layer. Report-column keys, `NotificationType` keys, and future query-param names deliberately stay `camelCase` to match the backend's actual (per-context, not uniform) convention — see `SPRINT_I1_PROMPT.md` for the full per-field mapping and the exceptions. |
| 2 | Base URL | `http://localhost:8000/api` (no version segment) | `http://localhost:8000/api/v1` (`SRS.md` §2, `API_CONTRACT.md`) | Confirm with whoever built the backend which is actually live; set `NEXT_PUBLIC_API_BASE_URL` accordingly — don't assume. |
| 3 | Create-endpoint URL shape for **Players, Matches, Sessions** | Path-scoped: `POST /teams/:teamId/players`, `/teams/:teamId/matches`, `/teams/:teamId/sessions` (no `teamId` in the body) | Flat: `POST /players`, `/matches`, `/sessions` with `teamId` in the request body (`SRS.md` §8.3–8.5, `API_CONTRACT.md`) | Follow Postman: path-scoped, drop `teamId` from those three request bodies. |
| 4 | **Auth shape** — see §1a below | Phone-first: `POST /auth/register` (`full_name`, `phone`, `password`, optional `email`), `POST /auth/login` (`phone` + `password`), plus a full OTP flow (`/auth/otp/request`, `/auth/otp/verify`) | `SRS.md` §4 *already suggested exactly this shape* ("phone + OTP is the natural fit" for a WhatsApp-first product) — but the mock `SignInForm`/`SignUpForm` built this session use an `identifier` (email-or-name) + `password` + `confirmPassword` shape that matches **neither** the register/login nor the OTP flow | The auth screens need a product/design pass to phone-first + OTP before Sprint I1, not just a network-call swap. See §1a. |
| 5 | Report templates / history scoping | Team-scoped: `/teams/:teamId/report-templates`, `/teams/:teamId/report-history` | Unscoped in `SRS.md` §8.6: `/report-templates`, `/report-history` | Follow Postman (team-scoped is also the safer multi-tenant default — partially closes Gap G9). |
| 6 | Change-password body | Adds `new_password_confirmation` | `SRS.md` §8.7 only specifies `{currentPassword, newPassword}` | Additive, not a conflict — just include it (mirrors the `confirmPassword` pattern already used client-side at signup). |

Everything else (Team CRUD, Staff CRUD, Season CRUD + activate/archive/rename/duplicate/
stats/analytics/roster, Player/Match/Session read-update-delete, all four Reports `GET`
endpoints, all `/me/*` Settings paths, `/uploads`) matches `SRS.md`'s endpoint tables
path-for-path and method-for-method. That's the majority of the surface — it needs
implementing, not re-designing.

### 1a. Why the auth mismatch matters more than the others

`SRS.md` Gap **G2** ("No auth exists") was resolved by the backend team by building
almost exactly what `SRS.md` §4 suggested: phone + OTP, plus a conventional
register/login for the password path, plus `GET /me` and the two invite endpoints — all
named identically to §4's "Suggested minimal endpoints" table. The invite flow
(`POST /teams/:teamId/invites`, `POST /invites/:code/redeem`) also matches §4 exactly,
closing Gap **G3** (today's onboarding invite step fabricates a QR code/link client-side
with nothing to redeem against).

The mock auth screens (`src/components/auth/SignInForm.tsx`, `SignUpForm.tsx`,
`src/schemas/auth.ts`) were built independently this session and assume a different
model: sign-in by "email or full name" + password, sign-up requiring email and a
client-only `confirmPassword`. None of that maps onto phone/OTP. Before Sprint I1,
get a product decision on:

- Is phone + OTP the primary sign-up/sign-in path, with password as a fallback (as the
  backend implements), or should the backend add an email/identifier login too?
- What does the OTP screen look like (request → 6-digit code entry → verify), given no
  such screen exists in the frontend today?

Only after that decision should the auth screens be reworked — otherwise Sprint I1 ends
up redesigning the UI *and* wiring the network in the same pass, which is exactly the
"too much at once" failure mode this plan exists to avoid.

---

## 2. Cross-cutting guidelines (apply in every sprint below)

- **One API client, built once, in Sprint I1.** A thin `apiFetch` (or a small set of
  React Query hooks per domain) that reads `NEXT_PUBLIC_API_BASE_URL`, attaches
  `Authorization: Bearer <token>` from the auth store, and parses the `{message, errors}`
  error envelope (`SRS.md` §2.1) into `react-hook-form`-compatible field errors (the
  app's forms already use `FieldError`/`zodResolver` everywhere — the parser should feed
  that same shape). No casing conversion needed here — the frontend already speaks
  `snake_case` for entity fields since Sprint I1 (`SPRINT_I1_PROMPT.md`); just remember
  query-string parameter names and report `columns[]` values stay `camelCase` when that
  code gets written.
- **React Query, not more Zustand, for server data.** `@tanstack/react-query` is already
  a dependency (`package.json`) but has zero usages today — Sprint I1 is where it starts
  getting used. Zustand stores keep owning pure client/UI state (current onboarding
  step, theme, active season selector) but stop owning data that now has a server copy.
- **Mock stays live behind a flag until a domain is verified.** Don't delete
  `src/mock/*` or a store's mock actions in the same PR that wires the real endpoint.
  Gate each domain's data source behind an env flag (e.g.
  `NEXT_PUBLIC_API_<DOMAIN>=on`) so a broken integration can be flipped back to mock
  instantly without a revert. Remove the flag and the mock path only in the Sprint I9
  cleanup, once every domain has been live for a while.
- **Strict dependency order.** Auth blocks everything (every other call needs a token).
  Team blocks Staff/Invites/Seasons/Players/Matches/Sessions (everything carries
  `teamId`). Seasons blocks Players/Matches/Sessions/Reports (everything is
  season-scoped per `SRS.md` §1). Don't parallelize sprints that violate this order.
- **Exit criteria before moving to the next sprint:** golden-path tested in a real
  browser against the real backend (not just `tsc`/lint), rollback flag confirmed
  working, and `SRS.md` §1 ("Current Implementation State") updated to move that domain
  from "mocked" to "real" so the spec doesn't silently go stale.
- **Media uploads (`SRS.md` Gap G4).** Every `photo`/`logo`/`poster`/`coverImage`/
  `photos[]` field is base64-in-JSON today. Migrate each to `POST /uploads` → URL string
  inside the sprint that owns that entity (Team logo/cover in I2, Player photo in I4,
  Match poster in I5) rather than as a separate pass — it's the same shape of change
  each time and the entity's forms already isolate the upload widget.
- **Offline story (`SRS.md` Gap G8, still open).** The product principle is
  "offline-friendly," but today that only means `localStorage`. Decide at minimum a v1
  behavior per sprint (e.g. "requires connectivity; show a clear offline banner" is an
  acceptable v1 — silently failing writes is not) rather than leaving it unstated.

---

## 3. Sprint sequence

Numbered `I1`–`I9` ("Integration") to avoid clashing with the existing feature-build
`SPRINT_00X_PROMPT.md` numbering. Each sprint is one Zustand domain and the screens that
read it.

### Sprint I1 — API Client Foundation & Auth

Casing/contract reconciliation (originally scoped here) shipped as its own sprint —
see `SPRINT_I1_PROMPT.md`. What's left in this sprint:

- Build the shared `apiFetch`/React Query layer and error mapper (§2).
- Resolve the product decision in §1a before touching UI.
- Wire `POST /auth/register`, `/auth/login`, `/auth/otp/request`, `/auth/otp/verify`,
  `POST /auth/logout`, `GET /me`. Rework `SignInForm`/`SignUpForm`/`auth-store.ts` to
  match whatever shape §1a settles on.
- **Exit:** register (or OTP-verify), land on `/onboarding` or `/dashboard` per
  `hasOnboarded`, refresh the page and stay signed in, sign out.

### Sprint I2 — Team, Staff & Invites

- Wire `GET/POST/PATCH /teams(/:id)` — onboarding team step and Settings → Team.
- Wire Staff `GET/POST/PATCH/DELETE /teams/:teamId/staff(/:id)` — this replaces
  `addStaffMember`/`removeStaffMember` in `onboarding-store.ts`, i.e. the "Add your
  management team" form reviewed earlier in this session becomes the first real-network
  form.
- Wire `POST /teams/:teamId/invites` and `POST /invites/:code/redeem`, replacing the
  fabricated QR/join-code screen (closes Gap G3).
- Migrate team `logo`/`coverImage`/`photos[]` to `/uploads`.
- **Exit:** the full onboarding wizard (role → team → staff → invite) persists to a real
  team; a second session can redeem a real invite code and join it.

### Sprint I3 — Seasons

- Wire Season CRUD, `activate`/`archive`/`rename`/`duplicate`, `stats`, `analytics`,
  `players` (roster), `players/stats`.
- **Exit:** season switcher, season dashboard, analytics, and season comparison all read
  real data; season CRUD screens work end to end.

### Sprint I4 — Players

- Wire Player CRUD, `PATCH /players/:id/status`, season registration
  (`POST /seasons/:id/players`), carry-forward, season-removal.
- Migrate player `photo` to `/uploads` (see §2).
- **Exit:** player list/detail, registration into a season, and photo upload are real;
  the public `/players/[id]/profile` share page still reads correctly (`SRS.md` Gap G10
  is unchanged by this sprint — still worth a conscious decision, not a silent carry-over).

### Sprint I5 — Matches (incl. Lineup & Events)

- Wire Match CRUD, `PUT /matches/:id/lineup`, `POST/DELETE /matches/:id/events(/:id)`,
  `complete`, `cancel`.
- Migrate match `poster` to `/uploads`.
- **Exit:** create fixture → set lineup → record live events → complete, end to end
  against the real API.

### Sprint I6 — Training / Attendance

- Wire Session CRUD, single (`PATCH /sessions/:id/attendance/:playerId`) and bulk
  (`PATCH /sessions/:id/attendance`) attendance, `complete`, `cancel`.
- **Exit:** attendance tracker and its dashboard widget show real data.

### Sprint I7 — Reports & Templates

- Wire the four `GET /teams/:teamId/reports/*` endpoints, `report-templates` CRUD +
  `duplicate`, `report-history` list + log.
- Confirm Gap G7 (client- vs. server-side file generation): the collection has no
  `/exports` endpoint, implying report files stay client-generated (`jspdf`/`xlsx` are
  already dependencies) — drop `API_CONTRACT.md`'s speculative `/reports/team` POST
  and `SRS.md` §8.8's speculative `/teams/:teamId/exports` once this is confirmed.
- **Exit:** report builder wizard reads real rows; PDF/Excel export still happens
  client-side.

### Sprint I8 — Settings

- Wire `/me/profile`, `/me/preferences`, `/me/notifications`, `/me/security`,
  `POST /me/security/password`, `POST /me/security/2fa/toggle` (still UI-only per Gap
  G6 unless the backend confirms real 2FA enrollment), `DELETE /me/security/sessions(/:id)`.
- **Exit:** Settings is fully real; any remaining base64 media fields are migrated.

### Sprint I9 — Cleanup & Hardening

- Remove the now-dead `src/mock/*` files and per-domain mock flags once every domain has
  been stable in production for a while.
- Check `postman_collection.json` into the repo (e.g. `contracts/postman_collection.json`)
  as the versioned source of truth, and mark `API_CONTRACT.md` superseded / retire it —
  it already says `SRS.md` supersedes it, and `SRS.md` should now point at the real
  collection instead of guessing.
- Update `SRS.md` §1 fully (nothing should still say "fully mocked") and close out the
  gaps this plan resolved (G2, G3, partially G4 and G9).
- Opportunistically resolve the gaps that are pure agreement problems, not integration
  work — best done once, not piecemeal per sprint: Gap **G1** (unify the
  `teamManager/headCoach/assistantCoach/captain` staff-role enum with the Settings
  permission matrix's `Manager/Coach/Captain/Player` vocabulary) and Gap **G11** (unify
  the attendance report's `weekly/monthly/seasonal` with the season report's
  `week/month/quarter/halfSeason/fullSeason/custom`).

---

## 4. Open questions for the backend owner (get these answered before Sprint I1)

1. ~~Is `snake_case` final...~~ Resolved — the frontend adopted `snake_case` to match
   (Sprint I1). Still worth confirming: is the `/me/notifications` body's `camelCase`
   (`matchReminders`, etc.) intentional, or a typo in the collection that should also be
   `snake_case`?
2. Is the base URL `/api` or `/api/v1`?
3. Is phone + OTP the primary auth path, with password as a fallback — or should the
   frontend also get an email/identifier login? (§1a)
4. Can the backend issue an httpOnly cookie for the session token, or must the frontend
   hold it in JS-accessible storage (current `localStorage`-persisted Zustand approach,
   which is XSS-exposed)?
5. Does `POST /uploads` return just `{url}`, or also content-type/size limits the
   frontend should validate against before upload?
6. Confirmed: report file generation stays client-side (no `/exports` endpoint) — correct?
