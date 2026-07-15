# COMPONENTS.md

# KickStartGH Design System & Components

## Design Philosophy

The interface must feel:

* Modern.
* Fast.
* Premium.
* Friendly.
* Football-focused.

Users are not software engineers. Every component must prioritize simplicity.

---

# Brand Colors

## Primary

Dark Grey

```css
#323232
```

Usage:

* Sidebar.
* Navigation.
* Cards.
* Background sections.

---

## Accent

Vivid Yellow

```css
#ffdb00
```

Usage:

* Primary buttons.
* Notifications.
* Statistics.
* Highlights.

---

## Supporting

```css
#ffffff
#f5f5f5
#e5e5e5
```

---

# Typography

Font:

* Geist Sans.

Headings:

* Bold.
* Large.
* Easy to scan.

Body:

* Clear spacing.
* High contrast.

---

# Layout Rules

## Mobile First

Breakpoints:

```text
Mobile: 0–767px

Tablet: 768–1023px

Desktop: 1024px+
```

Rules:

* Touch-friendly spacing.
* Large buttons.
* Minimal text input.
* Bottom navigation.

---

## Desktop

Rules:

* Sidebar navigation.
* Dashboard cards.
* Responsive tables.
* Multi-column layouts.

---

# Animations

Use Framer Motion.

Allowed:

* Fade in.
* Slide up.
* Scale on hover.
* Smooth transitions.

Avoid:

* Excessive animations.
* Complex parallax.
* Long loading sequences.

Animation duration:

```text
150ms–300ms
```

---

# Reusable Components

## Layout Components

### AppShell

Contains:

* Header.
* Sidebar.
* Mobile navigation.
* Main content.

---

### MobileBottomNav

Tabs:

* Home.
* Matches.
* Players.
* Reports.
* Settings.

---

### Sidebar

Links:

* Dashboard.
* Team.
* Players.
* Matches.
* Attendance.
* Reports.
* Settings.

---

# Dashboard Components

### StatisticCard

Props:

* title
* value
* icon
* trend

Examples:

* Total Players.
* Matches Played.
* Wins.
* Attendance.

---

### QuickActionCard

Actions:

* Add Player.
* Create Match.
* Record Attendance.
* Generate Report.

---

### UpcomingMatchCard

Display:

* Opponent.
* Date.
* Venue.
* Competition.

---

# Team Components

### TeamCard

Display:

* Logo.
* Team name.
* Region.
* Coach.
* Players count.

---

### TeamOverview

Display:

* Head coach.
* Home ground.
* Founded year.
* Team colors.

---

### TeamSettingsForm

Multi-step form. Long single-page forms are avoided by splitting into steps.

Steps:

1. Identity (logo, name, nickname, slogan, colors).
2. Location & History (region, district, home ground, year established).
3. Social Links (Facebook, Instagram, TikTok, website).

Features:

* Step progress indicator (`ProgressStepper`, shared with onboarding).
* Back / Next navigation between steps, with per-step validation before advancing.
* Final step submits; earlier steps only advance.

Used by both `/team/edit` and `/settings/team`.

---

### Team Page Tabs

The Team page (`/team`) shows the team profile card, then tabs:

* Staff & Roles — add, remove, and change staff roles.
* Permissions — read-only role/action matrix.
* Gallery — see `TeamGallery` below.

Every edit screen reachable from the Team page includes its own back link, so users
never have to rely on the sidebar to return.

---

### TeamGallery / GalleryTile

Display:

* Staff and players as photo tiles, grouped into two grids.
* Falls back to initials-on-brand-color when no photo is set.

Interaction:

* Hovering (or focusing/tapping) a tile reveals its identification as an overlay.
* Format: `Role - Full Name`, e.g. `Head Coach - Kofi Emmanuel`.

---

# Player Components

### PlayerCard

Display:

* Photo.
* Name.
* Position.
* Jersey number.
* Rating.

---

### PlayerTable

Features:

* Search.
* Filter.
* Sort.
* Pagination.

---

### PlayerProfile

Display:

* Statistics.
* Attendance.
* Match history.

---

# Match Components

### MatchCard

Display:

* Opponent.
* Score.
* Competition.
* Venue.

---

### MatchTimeline

Display:

* Goals.
* Cards.
* Substitutions.

---

### MatchForm

Features:

* Record match events.
* Select scorers.
* Select assists.

---

# Attendance Components

### AttendanceList

Features:

* Mark present.
* Mark absent.
* Mark late.
* Excuse.

---

### AttendanceSummary

Display:

* Attendance percentage.
* Top attendees.

---

# Reporting Components

### ReportBuilder

Steps:

1. Select report type.
2. Select columns.
3. Preview.
4. Export.

---

### ColumnSelector

Features:

* Checkbox selection.
* Search.
* Save presets.

---

### ReportPreview

Features:

* Table preview.
* Export options.

---

# Empty States

Every module must include:

* Friendly illustration.
* Clear message.
* Call-to-action button.

Example:

"No players have been added yet."

Button:

"Add your first player"

---

# Accessibility Rules

Every component must:

* Support keyboard navigation.
* Have proper labels.
* Use semantic HTML.
* Maintain contrast ratios.
* Be usable on low-end devices.

---

# Performance Rules

Avoid:

* Large bundles.
* Heavy charts.
* Unnecessary re-renders.

Prefer:

* Lazy loading.
* Skeleton loaders.
* Optimized images.

---

# UI Inspiration

Primary inspiration:

* 21st.dev

Secondary inspiration:

* Modern SaaS dashboards.
* Sports applications.
* Mobile-first products.

The product should feel like:

"Professional football software designed for Ghanaian grassroots football."
