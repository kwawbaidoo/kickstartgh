# ROADMAP.md

# KickStartGH Development Roadmap

## Vision

Build the leading football management platform for grassroots football teams in Ghana, starting with local teams and gradually expanding into leagues, tournaments, scouting, and football analytics.

---

# Guiding Principles

Every feature must satisfy at least one of the following:

* Simplify football management.
* Reduce reliance on notebooks and spreadsheets.
* Improve communication.
* Support offline usage.
* Be easy for non-technical users.

---

# Phase 1 — Foundation & MVP (Weeks 1–8)

## Sprint 1: Project Setup

Goals:

* Set up Next.js project.
* Configure TypeScript.
* Configure Tailwind CSS.
* Install Shadcn UI.
* Configure Framer Motion.
* Create theme system.
* Set up folder structure.
* Create reusable layout components.

Deliverables:

* Authentication pages.
* Responsive dashboard layout.
* Mobile navigation.
* Sidebar navigation.
* Theme provider.

---

## Sprint 2: Team Onboarding

Features:

* Create team.
* Upload logo.
* Select region and district.
* Add home ground.
* Add management staff.
* Invite players via WhatsApp.

Deliverables:

* Team creation flow.
* Team profile page.
* Empty states.
* Success screens.

---

## Sprint 3: Player Management

Features:

* Register players.
* Edit player profiles.
* Upload player photos.
* Search and filter players.
* Display player cards.

Deliverables:

* Player list page.
* Player details page.
* Player card component.
* Search component.

---

## Sprint 4: Match Management

Features:

* Create fixtures.
* Record scores.
* Record goals and assists.
* Record cards.
* Record substitutions.

Deliverables:

* Match list.
* Match details page.
* Match form.
* Match statistics.

---

## Sprint 5: Attendance

Features:

* Record training attendance.
* Record match attendance.
* Calculate attendance percentage.

Deliverables:

* Attendance tracker.
* Attendance report.
* Attendance dashboard widget.

---

## Sprint 6: Communication

Features:

* Generate announcements.
* Generate match cards.
* Generate training reminders.
* Share to WhatsApp.

Deliverables:

* WhatsApp share flow.
* Match reminder card.
* Team announcement component.

---

## Sprint 7: Reporting

Features:

* Player report builder.
* Team report builder.
* Match report builder.
* Attendance report builder.

Deliverables:

* Report builder wizard.
* Column selector.
* Export to PDF.
* Export to Excel.

---

## Sprint 7.5: Player Marketability & Public Profiles ✅ *(delivered)*

Features:

* Marketability profile fields on players (nationality, height, education, work
  experience, achievements, other sports, social links).
* Two-pane player detail page: fixed photo panel, scrollable details panel.
* Activity timeline filterable by month, quarter, year, or all-time.
* Per-game player report PDF, generated from any match in the timeline.
* Public, unauthenticated player profile page for WhatsApp sharing.

Deliverables:

* `PlayerMarketabilityDetails`, `PlayerPhotoPanel` components.
* `/players/[id]/profile` public route.
* `useOrigin` hook for SSR-safe share-link generation.

---

## Sprint 7.6: Tactical Formation Engine ✅ *(delivered)*

Features:

* Replaced row-based lineup layout with a real `Position`/`Slot`/`FormationLayout`
  pitch-coordinate system.
* Eleven named formations (4-4-2, 4-3-3, 3-5-2, 5-3-2, 3-4-3, 4-2-3-1, 4-5-1, 3-4-1-2,
  3-4-2-1, 5-4-1, 5-2-3), each with tactically accurate slot placement.
* Lineup builder, pitch view, and PDF export all updated to slot-keyed starting XIs.

Deliverables:

* `Position`/`Slot`/`FormationLayout` types and `formationLayouts` config.
* Updated `LineupBuilder`, `LineupView`, `EventRecorder`, lineup PDF export.

---

## Sprint 7.7: Team Media ✅ *(delivered)*

Features:

* Hero cover image banner on the Team page.
* Dedicated photo gallery, separate from the existing staff/player avatar grid
  (renamed "Roster").
* Client-side image compression before storage.

Deliverables:

* `CoverImageUpload`, `TeamPhotoManager` components.
* "Photos" tab on the Team page.

---

## Sprint 8: Season Management & Competition Lifecycle ✅ *(delivered)*

Goal: make **Season** the top-level container — no player registration, match, training
session, or report exists outside a season.

Features:

* Season CRUD: create, edit, activate (completes the previously-active season),
  archive, rename, duplicate.
* Per-season player registration with season-specific jersey numbers, plus "carry
  forward roster" from a prior season.
* Season-scoped matches, training, and reports, reusing the existing list/report
  infrastructure.
* Season dashboard (stats grid + quick actions), analytics (win trend, form tracker,
  top scorers/assists, most committed players, squad availability), and side-by-side
  season comparison.
* Active-season selector in the header; global Players/Matches/Training/Reports pages
  always reflect only the active season.
* Card/list view toggle, search, and pagination (16 items/page) added across every
  season and roster/match/training list page.
* Season Roster split into **Players** and **Performance & Stats** tabs — the latter
  a sortable, season-scoped table of each player's matches played, goals, assists,
  cards, and attendance %, composed entirely from existing match-event/attendance
  formulas (no duplicate data entry).

Deliverables:

* `Season`, `PlayerSeasonRecord` data model; `season-store.ts`.
* `/seasons`, `/seasons/new`, `/seasons/[id]` (+ `players`, `matches`, `training`,
  `reports`, `analytics`, `settings`) routes.
* `SeasonCard`, `SeasonForm`, `SeasonSelector`, `SeasonStatsCard`, `SeasonAnalytics`,
  `SeasonComparison`, `SeasonSettings`, `SeasonPlayerCard`, `SeasonPlayerStatsTable`
  components.
* Backward-compatible migration of pre-Season players/matches/sessions onto a default
  season.

Deferred to a future sprint: Awards, Club Records, auto-detected Milestones, Financial
Reports.

---

# Phase 2 — Competition Management (Months 3–5)

Note: Sprint 8 delivered single-team **Season** management (one team's own season
lifecycle). Phase 2 below is the separate, still-future step of multi-team competitions
(leagues/tournaments spanning several teams).

Features:

* Tournament creation.
* League tables.
* Team standings.
* Top scorers.
* Fixtures generation.
* Team rankings.

Deliverables:

* Tournament dashboard.
* Competition pages.
* Standings module.

---

# Phase 3 — Scouting & Discovery (Months 5–8)

Features:

* Player scouting profiles.
* Public player pages.
* Team verification.
* QR player cards.
* Highlight uploads.

Deliverables:

* Public player profile.
* Verification workflow.
* Scout search.

---

# Phase 4 — Monetization (Months 8–12)

Features:

* Premium reports.
* Sponsor marketplace.
* Club pages.
* Custom team websites.

Deliverables:

* Subscription plans.
* Billing dashboard.
* Sponsorship module.

---

# Long-Term Vision

KickStartGH should evolve from a team management application into the digital infrastructure for grassroots football in Ghana.

---

# Success Metrics

Phase 1:

* 10 registered teams.
* 100 players.
* 50 recorded matches.

Phase 2:

* 50 teams.
* 5 competitions.

Phase 3:

* 1,000 players.
* 100 verified teams.

Phase 4:

* Paying customers.
* Sponsorship partnerships.
