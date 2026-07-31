# KickStartGH Product Specification

## Product Overview

KickStartGH is a mobile-first football management platform designed for grassroots football teams in Ghana.

The platform helps local football teams, coaches, managers, players, and tournament organizers manage football activities digitally.

The system replaces notebooks, spreadsheets, and WhatsApp chats with a simple, modern, and accessible platform.

---

# Mission

Empower grassroots football teams in Ghana with professional management tools that are simple, affordable, and optimized for local realities.

---

# Product Principles

The system must always follow these principles:

1. Mobile-first.
2. Offline-friendly.
3. WhatsApp-first.
4. Extremely simple.
5. Fast and accessible.
6. Designed for low-end Android devices.
7. Fully responsive on desktop.

---

# Target Users

## Team Manager

Responsibilities:

* Register teams.
* Manage players.
* Generate reports.
* Communicate with players.
* View team statistics.

Technical level:

* Basic smartphone user.
* Primarily uses WhatsApp.

---

## Coach

Responsibilities:

* Select lineups.
* Record match results.
* Track attendance.
* Review player performance.

Technical level:

* Limited technical knowledge.

---

## Player

Responsibilities:

* View profile.
* Check fixtures.
* Receive announcements.
* View performance statistics.

---

## Tournament Organizer (Future)

Responsibilities:

* Manage competitions.
* Manage participating teams.
* Generate standings.

---

# Brand Identity

## Colors

Primary:

Navy Blue

```text
#1E3A8A
```

Accent:

Bright Blue

```text
#2563EB
```

Ink:

Slate Ink (body text)

```text
#1F2937
```

Tint:

Sky Tint (muted surfaces)

```text
#E0F2FE
```

Supporting:

```text
#ffffff
```

---

# Design Language

The UI should feel:

* Modern.
* Premium.
* Clean.
* Friendly.
* Football-focused.

Avoid:

* Corporate enterprise design.
* Dense tables.
* Tiny buttons.
* Complex workflows.

Use:

* Large touch targets.
* Dashboard cards.
* Bottom navigation.
* Smooth animations.
* Clear empty states.

---

# Core Features (MVP)

## Team Onboarding

Users can:

* Create a team.
* Upload logo.
* Select location.
* Add home ground.
* Add management staff.

Fields:

* Team name.
* Nickname.
* Region.
* District.
* Home ground.
* Year established.
* Brand Colors

---

## Season Management

Season is the top-level container for a team's activity: no player registration,
match, training session, or report exists outside a season.

Users can:

* Create a season (name, start/end date, competition category, objectives, budget,
  optional season colors).
* Activate exactly one season at a time — activating a season completes the
  previously-active one.
* Archive a completed season (a season can't be archived while it's still active).
* Register existing players into a season with a season-specific jersey number, or
  carry forward an entire prior season's active roster in one action.
* View the season roster in two tabs: **Players** (the squad list, as above) and
  **Performance & Stats** (each registered player's matches played, goals, assists,
  yellow/red cards, and attendance % for this season — computed live from recorded
  match events and attendance, never entered a second time), sortable by any stat.
* View a season dashboard: registered players, matches played, W/D/L, goals for/against,
  training sessions, attendance %.
* View season analytics: win-rate trend, team form tracker, top scorers/assists, most
  committed players, squad availability (active/injured/suspended/released).
* Compare two seasons side by side.
* Generate season-scoped reports over week/month/quarter/half-season/full-season/custom
  date ranges.

A player keeps one continuous identity across every season they've played for — their
jersey number and status can change season to season, but their profile, stats history,
and public share link do not reset.

Only the active season's data appears in the everyday Players/Matches/Training/Reports
pages. Browsing a past (read-only) season happens explicitly under its own season pages.

---

## Player Management

Store:

* Full name.
* Photo.
* Date of birth.
* Position.
* Jersey number.
* Preferred foot.
* Phone number.

Statistics:

* Matches played.
* Goals.
* Assists.
* Attendance.
* Yellow cards.
* Red cards.
* Player rating.

### Marketability Profile

Every player can optionally carry a public-facing profile, aimed at scouts, other clubs,
and tournament organizers:

* Nationality.
* Height.
* Education history (institution + period).
* Work experience.
* Achievements.
* Other sports played.
* Social links (Instagram, Twitter, Facebook, TikTok).

The player detail page is split into a fixed photo pane and a scrollable details pane
(bio, marketability profile, activity timeline) so the two never fight for scroll space
on mobile.

### Public Player Profile Page

A dedicated, unauthenticated page (`/players/[id]/profile`) renders a player's full
marketability profile for sharing outside the team — a link anyone can open without
logging in. Shareable directly to WhatsApp, matching the platform's WhatsApp-first
principle.

### Activity Timeline

A player's match/attendance history is filterable by month, quarter, year, or all-time,
since a player may be with a team for several seasons. Any single game in the timeline
can be pulled out to generate a standalone per-match player report (PDF).

---

## Match Management

Users can:

* Create fixtures.
* Record scores.
* Record goals.
* Record assists.
* Record cards.
* Record substitutions.

Automatically calculate:

* Wins.
* Draws.
* Losses.
* Goals scored.
* Goals conceded.

### Formations & Lineups

Lineups are built on a real football position/pitch-layout engine rather than generic
rows: eleven named formations (4-4-2, 4-3-3, 3-5-2, 5-3-2, 3-4-3, 4-2-3-1, 4-5-1, 3-4-1-2,
3-4-2-1, 5-4-1, 5-2-3), each mapping its own slots (e.g. two centre-backs, a lone
striker) to tactical pitch coordinates. The pitch view rotates between portrait (mobile)
and landscape (desktop) from the same coordinate set.

---

## Team Media

The Team page has a hero cover image banner plus a real photo gallery, separate from the
existing staff/player avatar grid (renamed "Roster" for clarity). Images are compressed
client-side before storage to keep the app fast on low-end devices and safe under
localStorage's size limits.

---

## Attendance

Track:

* Training attendance.
* Match attendance.
* Excused absences.
* Attendance percentage.

---

## Communication

Generate:

* Match reminder cards.
* Team announcements.
* Training notices.

Enable:

* WhatsApp sharing.

---

## Reporting System

Supported reports:

### Player Report

Selectable columns:

* Name.
* Position.
* Date of birth.
* Phone number.
* Goals.
* Assists.
* Attendance.

### Team Report

Include:

* Team information.
* Head coach.
* Total players.
* Matches played.
* Wins.
* Draws.
* Losses.
* Goals scored.
* Goals conceded.

### Match Report

Include:

* Match summary.
* Scoreline.
* Scorers.
* Cards.
* Substitutions.

### Attendance Report

Include:

* Attendance percentage.
* Most committed players.
* Absentees.

Export formats:

* PDF.
* Excel.

Share options:

* WhatsApp.

---

# Dashboard

The dashboard should show:

* Upcoming matches.
* Total players.
* Team performance.
* Attendance summary.
* Recent announcements.

---

# Navigation

## Mobile

Bottom navigation:

* Home.
* Matches.
* Players.
* Reports.
* Settings.

Seasons is reachable from the mobile "More" sheet (the bottom nav stays at 5 slots).

## Desktop

Sidebar navigation:

* Dashboard.
* Seasons.
* Team.
* Players.
* Matches.
* Attendance.
* Reports.
* Settings.

---

# Performance Requirements

The application must:

* Load quickly on slow networks.
* Work offline when possible.
* Sync automatically.
* Minimize data usage.

---

# Technical Stack

Frontend:

* Next.js.
* TypeScript.
* Tailwind CSS.
* Shadcn UI.
* Framer Motion.
* Zustand.
* React Query.

Backend (planned):

* Supabase.

---

# Future Features

Phase 2:

* League management.
* Tournament management.
* Team verification.
* Player scouting.
* Video highlights.

Phase 3:

* Sponsor marketplace.
* AI match summaries.
* Community rankings.
* Talent discovery.

---

# Success Metrics

The MVP is successful if:

* Ten teams register.
* One hundred players are onboarded.
* Teams actively record matches.
* Coaches generate reports.
* Teams use WhatsApp sharing.

---

# Product Philosophy

KickStartGH should feel like:

"Professional football management software simplified for Ghanaian grassroots football."


# GPS check-in and player self-check-in via QR code

# Moment.js and Luxon for time zone management, and Froala as our WYSIWYG content editor.

# Stripe, PayPal, and Bambora for payments;
# Firebase Cloud Messaging and OneSignal for notifications;
# FullCalendar for scheduling;
# Froala Editor for editable content areas;
# Internal REST APIs for event, booking, and reporting logic.

# Each club instance can be branded and managed independently through an admin superlayer.

# Define what analytics and metrics to track. These can be attendance rates, matches, or time played, injuries or medical stories, goals, and player ratings.

# Visualize the data via Chart.js, Recharts, Victory Native, or D3.js. Enable analytics and reports for your users.