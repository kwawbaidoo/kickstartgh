# Sprint 005: Reporting & Analytics Engine

## Context

You are continuing development of KickStartGH, a mobile-first football management platform for grassroots football teams in Ghana.

Before implementing this sprint, review:

* CLAUDE.md
* PRODUCT.md
* ROADMAP.md
* COMPONENTS.md
* USER_FLOWS.md
* FRONTEND_GUIDELINES.md

The application currently supports:

* Team onboarding.
* Staff management.
* Player management.
* Match management.
* Statistics generation.

Follow all existing architecture, design patterns, and reusable components.

Do not connect to the backend yet.

Use mock data and local state.

---

# Sprint Goal

Build a powerful but simple reporting engine that allows coaches and managers to generate professional football reports.

Users should be able to:

* Generate player reports.
* Generate team reports.
* Generate match reports.
* Generate attendance reports.
* Select which columns to include.
* Preview reports.
* Export reports.
* Share reports.

The reporting system should be simple enough for village teams but powerful enough for academies and tournament organizers.

---

# Core Philosophy

The report builder must feel like:

```text
WhatsApp simplicity + Excel flexibility.
```

Users should not need technical knowledge.

---

# Step 1: Create Routes

Create:

```text
/reports

/reports/player

/reports/team

/reports/match

/reports/attendance

/reports/history
```

---

# Step 2: Reports Dashboard

Create a report home page.

Display:

* Recently generated reports.
* Favorite templates.
* Quick actions.

Quick actions:

* Generate Player Report.
* Generate Team Report.
* Generate Match Report.
* Generate Attendance Report.

---

# Step 3: Build Report Wizard

Create a reusable report builder.

Flow:

```text
Choose report type

↓

Choose filters

↓

Choose columns

↓

Preview

↓

Export

↓

Share
```

Create:

```text
ReportWizard
```

---

# Step 4: Player Reports

Create:

```text
/reports/player
```

Allow users to select:

Filters:

* Position.
* Age group.
* Status.
* Team.

Selectable columns:

* Player photo.
* Full name.
* Nickname.
* Date of birth.
* Position.
* Jersey number.
* Preferred foot.
* Phone number.
* Matches played.
* Goals.
* Assists.
* Yellow cards.
* Red cards.
* Attendance.

Allow:

* Select all.
* Save template.
* Reorder columns.

Example:

```text
☑ Name

☑ Position

☑ Goals

☑ Matches

☐ Phone Number

☐ Date of Birth
```

---

# Step 5: Team Reports

Create:

```text
/reports/team
```

Allow users to include:

* Team name.
* Logo.
* Region.
* Home ground.
* Head coach.
* Assistant coach.
* Captain.
* Number of players.
* Matches played.
* Wins.
* Draws.
* Losses.
* Goals scored.
* Goals conceded.
* Win percentage.

---

# Step 6: Match Reports

Create:

```text
/reports/match
```

Allow users to generate:

* Fixture reports.
* Match summaries.
* Competition reports.

Include:

* Opponent.
* Scoreline.
* Date.
* Venue.
* Scorers.
* Assists.
* Cards.
* Substitutions.
* Match notes.

---

# Step 7: Attendance Reports

Create:

```text
/reports/attendance
```

Allow users to include:

* Attendance percentage.
* Present sessions.
* Missed sessions.
* Late arrivals.
* Attendance ranking.

Support:

* Weekly report.
* Monthly report.
* Seasonal report.

---

# Step 8: Column Selector Engine

Create:

```text
ColumnSelector
```

Features:

* Search columns.
* Select columns.
* Drag to reorder.
* Save presets.

Example presets:

```text
Basic Squad List

Scouting Report

Match Statistics

Full Team Report
```

---

# Step 9: Report Preview

Create:

```text
ReportPreview
```

Features:

* Responsive table preview.
* Mobile-friendly cards.
* Pagination.
* Print-friendly layout.

Support:

* Dark mode.
* Light mode.

---

# Step 10: Export System

Add export actions:

* Export PDF.
* Export Excel.
* Export CSV.
* Print.

For now:

Use mock downloads.

Create reusable:

```text
ExportActions
```

---

# Step 11: WhatsApp Sharing

Generate shareable summaries.

Examples:

## Team Summary

```text
⚽ Team Report

Osagyefo FC

Matches: 15

Wins: 10

Draws: 3

Losses: 2
```

---

## Player Summary

```text
⚽ Player Report

Kwesi Mensah

Position: Forward

Goals: 12

Assists: 6
```

Create:

* Copy action.
* WhatsApp share button.

---

# Step 12: Saved Templates

Create:

```text
SavedTemplates
```

Allow users to:

* Save report configurations.
* Rename templates.
* Duplicate templates.
* Delete templates.

Examples:

* Coach Report.
* Squad List.
* Tournament Report.

---

# Step 13: Report History

Create:

```text
/reports/history
```

Display:

* Recently generated reports.
* Export format.
* Creation date.
* Template used.

---

# Step 14: Components Required

Create:

```text
ReportWizard

ReportCard

ColumnSelector

ReportPreview

ExportActions

SavedTemplates

ReportHistory

FilterPanel

TemplateCard
```

---

# Step 15: State Management

Create:

```text
reportsStore
```

Manage:

* Current report.
* Filters.
* Columns.
* Templates.
* History.

Persist locally.

---

# Step 16: UX Requirements

The reporting system must:

* Work on small Android phones.
* Minimize typing.
* Use large buttons.
* Require no technical knowledge.

A coach should be able to generate a report in less than two minutes.

---

# Step 17: Testing Checklist

Verify:

✓ Report creation

✓ Filtering

✓ Column selection

✓ Export actions

✓ Saved templates

✓ Report history

✓ Mobile responsiveness

✓ Accessibility

✓ Empty states

✓ Type safety

---

# Deliverables

At the end of Sprint 005, users should be able to:

✓ Generate player reports

✓ Generate team reports

✓ Generate match reports

✓ Generate attendance reports

✓ Customize report columns

✓ Save templates

✓ Export reports

✓ Share reports

The result should feel like:

"A professional reporting engine built for grassroots football teams in Ghana."
