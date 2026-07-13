# Sprint 004: Match Management & Match Day Experience

## Context

You are continuing development of KickStartGH, a mobile-first football management platform for grassroots football teams in Ghana.

Before implementation, review:

* CLAUDE.md
* PRODUCT.md
* ROADMAP.md
* COMPONENTS.md
* USER_FLOWS.md
* FRONTEND_GUIDELINES.md

Follow all existing patterns and reusable components from previous sprints.

The system currently supports:

* Team onboarding.
* Staff management.
* Player management.
* Dashboard foundation.

---

# Sprint Goal

Build the match management and match-day experience.

Managers and coaches should be able to:

* Create fixtures.
* Manage match details.
* Record events during a match.
* Record final results.
* Automatically generate team and player statistics.

Do not connect to the backend.

Use mock data and local state.

---

# User Goals

## Team Manager

* Schedule matches.
* Review previous matches.
* Generate reports.

## Coach

* Build lineups.
* Record match events quickly.
* Update scores.

---

# Step 1: Create Routes

Create:

```text
/matches

/matches/new

/matches/[id]

/matches/[id]/lineup

/matches/[id]/events
```

---

# Step 2: Match List Page

Display:

* Upcoming matches.
* Completed matches.
* Cancelled matches.

Include:

* Search.
* Filters.
* Tabs.

Filters:

* Competition.
* Status.
* Home/Away.

---

# Step 3: Create Match

Build a multi-step form.

Collect:

Required:

* Opponent.
* Competition.
* Match date.
* Kickoff time.
* Venue.

Optional:

* Match notes.
* Match poster.
* Referee name.

Match type:

* Friendly.
* League.
* Tournament.
* Knockout.

---

# Step 4: Lineup Builder

Create:

```text
/matches/[id]/lineup
```

Allow coaches to:

* Select squad.
* Select starting XI.
* Select substitutes.
* Select captain.

Support formations:

* 4-4-2
* 4-3-3
* 3-5-2
* 5-3-2

Requirements:

* Drag-and-drop lineup builder.
* Mobile-friendly interface.
* Formation visualization.

---

# Step 5: Match Event Recorder

Create:

```text
/matches/[id]/events
```

Prioritize speed and simplicity.

Large action buttons:

⚽ Goal

🟨 Yellow Card

🟥 Red Card

🔄 Substitution

🩹 Injury

---

## Goal Flow

Select:

* Scorer.
* Assist provider.
* Minute scored.

Example:

```text
Goal

Scorer:
Kwesi Mensah

Assist:
Yaw Boateng

Minute:
73
```

---

## Card Flow

Record:

* Player.
* Card type.
* Minute.

---

## Substitution Flow

Record:

* Player out.
* Player in.
* Minute.

---

# Step 6: Match Summary

Create:

```text
/matches/[id]
```

Display:

* Opponent.
* Final score.
* Competition.
* Venue.
* Timeline.
* Match statistics.

Include:

* Goal scorers.
* Cards.
* Substitutions.
* Match notes.

---

# Step 7: Team Statistics Engine

Automatically calculate:

* Matches played.
* Wins.
* Draws.
* Losses.
* Goals scored.
* Goals conceded.
* Win percentage.

Display:

* Statistic cards.
* Trend indicators.

---

# Step 8: Player Statistics Integration

Automatically update:

* Matches played.
* Goals.
* Assists.
* Yellow cards.
* Red cards.

Prepare components for future backend integration.

---

# Step 9: Match Cards

Create reusable:

```text
MatchCard
```

Display:

* Opponent.
* Date.
* Competition.
* Result.
* Status.

Support:

* Mobile cards.
* Desktop cards.

---

# Step 10: WhatsApp Match Sharing

Add actions:

* Share fixture.
* Share result.
* Share lineup.

Example:

```text
⚽ Full Time

Osagyefo FC 3–1 Unity FC

Scorers:

Kwesi ⚽⚽

Kojo ⚽

Competition:
Community Cup
```

Generate share previews.

---

# Step 11: Components Required

Create:

```text
MatchCard

MatchForm

LineupBuilder

FormationSelector

MatchTimeline

EventRecorder

ScoreBoard

StatisticWidget
```

---

# Step 12: State Management

Create:

```text
matchesStore
```

Manage:

* Fixtures.
* Results.
* Events.
* Lineups.
* Statistics.

Persist locally.

---

# Step 13: UX Requirements

The interface must:

* Work well on small Android phones.
* Minimize typing.
* Prioritize large buttons.
* Support quick event recording.

The coach should be able to record an event in less than 10 seconds.

---

# Step 14: Testing Checklist

Verify:

✓ Fixture creation

✓ Match editing

✓ Lineup creation

✓ Event recording

✓ Statistics updates

✓ Mobile responsiveness

✓ Empty states

✓ Loading states

✓ Type safety

---

# Deliverables

At the end of Sprint 004:

Users should be able to:

✓ Create fixtures

✓ Build lineups

✓ Record match events

✓ View match summaries

✓ Update team statistics

✓ Share match information

The result should feel like:

"A match-day assistant built for grassroots football in Ghana."
