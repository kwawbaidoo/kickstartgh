# Sprint 006: Training & Attendance Management

## Context

You are continuing development of KickStartGH, a mobile-first football management platform designed for grassroots football teams in Ghana.

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
* Reporting and analytics.

Continue using the existing architecture, reusable components, and design patterns established in previous sprints.

Do not connect to the backend yet.

Use mock data and local state.

---

# Sprint Goal

Build a complete training and attendance management system that helps coaches and managers:

* Schedule training sessions.
* Record attendance.
* Monitor player commitment.
* Analyze attendance trends.
* Generate attendance reports.
* Share training schedules with players.

The system must be simple enough for village football teams while providing useful analytics.

---

# Core Philosophy

Training management should feel like:

```text
A WhatsApp group attendance sheet transformed into a professional football management experience.
```

The coach should be able to take attendance for an entire team in less than three minutes.

---

# Step 1: Create Routes

Create:

```text
/training

/training/new

/training/[id]

/training/[id]/attendance

/training/calendar

/training/history
```

---

# Step 2: Training Dashboard

Create:

```text
/training
```

Display:

* Upcoming training sessions.
* Today's session.
* Attendance summary.
* Top attendees.
* Frequently absent players.

Quick actions:

* Schedule training.
* Take attendance.
* View attendance report.
* Share training details.

---

# Step 3: Schedule Training Session

Create:

```text
/training/new
```

Allow coaches to create training sessions.

Required fields:

* Session title.
* Date.
* Start time.
* End time.
* Venue.

Optional fields:

* Description.
* Training focus.
* Equipment checklist.
* Coach notes.

Training focus options:

* Fitness.
* Tactical.
* Shooting.
* Defending.
* Goalkeeping.
* Recovery.
* Friendly match.
* General training.

---

# Step 4: Training Details Page

Create:

```text
/training/[id]
```

Display:

* Session information.
* Venue.
* Coach.
* Focus area.
* Attendance summary.
* Notes.

Include quick actions:

* Edit session.
* Take attendance.
* Share session.
* Generate attendance report.

---

# Step 5: Attendance Recording

Create:

```text
/training/[id]/attendance
```

The attendance experience must prioritize speed.

For every player, allow:

* Present.
* Late.
* Excused.
* Injured.
* Absent.

Display:

* Player photo.
* Name.
* Jersey number.
* Position.

Requirements:

* Large touch-friendly buttons.
* Swipe support on mobile.
* Bulk actions.

Examples:

```text
Mark all present

Mark selected absent
```

---

# Step 6: Attendance Analytics

Automatically calculate:

Player metrics:

* Attendance percentage.
* Consecutive absences.
* Consecutive attendances.
* Total sessions attended.
* Total sessions missed.

Team metrics:

* Team attendance percentage.
* Most committed players.
* Lowest attendance players.
* Average attendance per month.

Display:

* Cards.
* Charts.
* Rankings.

Use mock data.

---

# Step 7: Training Calendar

Create:

```text
/training/calendar
```

Display:

* Weekly view.
* Monthly view.

Features:

* Upcoming sessions.
* Completed sessions.
* Canceled sessions.

Requirements:

* Mobile-friendly calendar.
* Smooth navigation.

---

# Step 8: Attendance History

Create:

```text
/training/history
```

Display:

* Training sessions.
* Attendance records.
* Attendance trends.

Filters:

* Date range.
* Player.
* Attendance status.

---

# Step 9: Notifications & Reminders

Create mock reminders:

Examples:

```text
⚽ Training Reminder

Osagyefo FC

Today, 4:00 PM

Venue: Community Park

Please arrive 15 minutes early.
```

Actions:

* Copy.
* Share to WhatsApp.

---

# Step 10: Components Required

Create:

```text
TrainingCard

TrainingForm

TrainingCalendar

AttendanceBoard

AttendancePlayerCard

AttendanceStatsCard

AttendanceChart

ReminderCard

TrainingTimeline
```

---

# Step 11: State Management

Create:

```text
trainingStore
```

Manage:

* Training sessions.
* Attendance records.
* Analytics.
* Reminders.

Persist locally.

---

# Step 12: Mock Data

Generate realistic data:

Examples:

```json
{
  "player": "Kwesi Mensah",
  "attendancePercentage": 88,
  "sessionsAttended": 22,
  "sessionsMissed": 3
}
```

Include:

* Different attendance patterns.
* Injured players.
* Excused absences.

---

# Step 13: UX Requirements

The training module must:

* Work smoothly on low-end Android phones.
* Minimize typing.
* Prioritize quick actions.
* Use large touch targets.
* Allow attendance to be recorded in less than three minutes.

---

# Step 14: Empty, Loading & Error States

Implement:

Empty state example:

```text
No training sessions scheduled yet.

Create your first training session.
```

Loading:

* Skeleton loaders.
* Smooth transitions.

Errors:

* Friendly messages.

---

# Step 15: Testing Checklist

Verify:

✓ Training creation

✓ Calendar navigation

✓ Attendance recording

✓ Attendance analytics

✓ Reminder generation

✓ Report generation

✓ Mobile responsiveness

✓ Accessibility

✓ State persistence

✓ Type safety

---

# Deliverables

At the end of Sprint 006, users should be able to:

✓ Schedule training sessions

✓ Record attendance

✓ View attendance analytics

✓ Access attendance history

✓ Share reminders

✓ Generate attendance reports

The result should feel like:

"A professional training and attendance system designed for grassroots football teams in Ghana."
