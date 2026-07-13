# Sprint 003: Player Management System

## Context

You are continuing development of KickStartGH, a mobile-first football management platform for grassroots football teams in Ghana.

Before implementing this sprint, review:

* CLAUDE.md
* PRODUCT.md
* ROADMAP.md
* COMPONENTS.md
* USER_FLOWS.md
* FRONTEND_GUIDELINES.md

Follow the existing architecture and design patterns from Sprint 001 and Sprint 002.

The system currently supports:

* Team onboarding.
* Team profile creation.
* Staff management.
* Dashboard foundation.

---

# Sprint Goal

Build a complete player management system that allows team managers and coaches to:

* Register players.
* Maintain player profiles.
* Search and filter players.
* View player information.
* Prepare the foundation for future statistics and scouting.

Do not connect to the backend yet.

Use mock data and local state.

---

# User Goals

## Team Manager

Should be able to:

* Add players.
* Update player details.
* View squad information.
* Export player lists.

## Coach

Should be able to:

* Quickly view available players.
* Check player positions.
* Review player history.

## Player

Future:

* View personal profile.
* Track performance.

---

# Step 1: Create Player Routes

Create:

```text
/players

/players/new

/players/[id]
```

---

# Step 2: Player List Page

Create a professional squad management page.

Display:

* Total players.
* Active players.
* Positions summary.
* Recent additions.

Include:

* Search.
* Filters.
* Sorting.

Filters:

* Position.
* Age group.
* Availability.
* Jersey number.

---

# Step 3: Player Registration

Create:

```text
/players/new
```

Build a multi-section form.

Use:

* React Hook Form.
* Zod validation.

---

## Personal Information

Fields:

Required:

* Full name.
* Date of birth.
* Position.

Optional:

* Player photo.
* Nickname.
* Phone number.
* Emergency contact.

---

## Football Information

Fields:

* Jersey number.
* Primary position.
* Secondary position.
* Preferred foot.

Positions:

* Goalkeeper.
* Defender.
* Midfielder.
* Forward.

Preferred foot:

* Left.
* Right.
* Both.

---

## Additional Information

Fields:

* Village/Town.
* Previous club.
* Player status.

Status:

* Active.
* Injured.
* Inactive.

---

# Step 4: Player Profile Page

Create:

```text
/players/[id]
```

Design a professional football profile.

Include:

## Profile Header

Display:

* Player photo.
* Name.
* Position.
* Jersey number.
* Status.

---

## Player Information Card

Display:

* Date of birth.
* Age.
* Phone.
* Location.
* Preferred foot.

---

## Statistics Section

For now display placeholders:

* Matches played.
* Goals.
* Assists.
* Attendance.
* Rating.

Prepare components for future match integration.

---

## Activity Timeline

Create placeholder:

Example:

```
Joined team

Registered for season

Played first match
```

---

# Step 5: Player Cards

Create reusable:

```text
PlayerCard
```

Display:

* Photo.
* Name.
* Position.
* Jersey number.
* Status.

Support:

* Mobile card view.
* Desktop grid view.

---

# Step 6: Player Search Experience

Implement:

Search by:

* Name.
* Nickname.
* Jersey number.

Requirements:

* Instant filtering.
* Empty state.

Example:

```
No players found.

Try searching another name.
```

---

# Step 7: Player Statistics Foundation

Create reusable:

```text
PlayerStatsCard
```

Fields:

* Matches.
* Goals.
* Assists.
* Attendance.
* Rating.

Use mock values.

---

# Step 8: Export Player Report Preparation

Prepare UI for future reporting.

Add:

Button:

```
Export Player List
```

Options:

* PDF.
* Excel.

For now:

Show mock download action.

---

# Step 9: WhatsApp Integration Preparation

Add:

Button:

```
Share Player Profile
```

Generate:

Example:

```
⚽ Player Profile

Name:
Kwesi Mensah

Position:
Forward

Team:
Osagyefo FC
```

Prepare for future WhatsApp sharing.

---

# Step 10: Components Required

Create reusable components:

```
PlayerCard

PlayerForm

PlayerProfileHeader

PlayerInfoCard

PlayerStatsCard

PlayerFilter

SearchBar

EmptyPlayerState
```

---

# Step 11: State Management

Use Zustand.

Create:

```
playersStore
```

Manage:

* Player list.
* Selected player.
* Add player.
* Update player.
* Delete player.

Persist locally.

---

# Step 12: Mock Data

Create realistic Ghana grassroots football data.

Example:

```json
{
"name": "Kwesi Mensah",
"position": "Forward",
"team": "Osagyefo FC",
"jerseyNumber": 9
}
```

Include:

* Different positions.
* Different ages.
* Different statuses.

---

# Step 13: UX Requirements

The interface must:

* Require minimal typing.
* Work well on mobile.
* Use large touch areas.
* Have clear actions.

The coach should be able to:

Add a player within:

< 60 seconds.

---

# Step 14: Testing Checklist

Verify:

✓ Player creation

✓ Player editing

✓ Player search

✓ Filters

✓ Responsive design

✓ Empty states

✓ Loading states

✓ Form validation

✓ Component reuse

✓ Type safety

---

# Deliverables

At the end of Sprint 003:

Users should be able to:

✓ Register players

✓ View squad

✓ Search players

✓ View player profiles

✓ Manage player information

✓ Prepare player data for future statistics and reports

The result should feel like:

"A professional club squad management system simplified for grassroots football teams in Ghana."
