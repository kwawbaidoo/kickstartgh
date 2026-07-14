# Sprint 006.5: Settings, Preferences & Team Administration

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
* Reports and analytics.
* Training and attendance.

Continue using the existing architecture, reusable components, and design patterns.

Do not connect to the backend yet.

Use mock data and local state.

---

# Sprint Goal

Build a centralized settings and administration module where coaches, managers, and administrators can customize their team and application experience.

The settings module should feel:

* Familiar.
* Simple.
* Organized.
* Mobile-first.

The user should never need more than three taps to find a setting.

---

# Step 1: Create Routes

Create:

```text
/settings

/settings/profile

/settings/team

/settings/staff

/settings/preferences

/settings/notifications

/settings/security

/settings/export

/settings/about
```

Use nested layouts where appropriate.

---

# Step 2: Settings Home Page

Create:

```text
/settings
```

Display sections:

* My Profile
* Team Settings
* Staff & Roles
* Preferences
* Notifications
* Security
* Data & Export
* About

Each section should contain:

* Icon.
* Description.
* Navigation arrow.

Include:

* Team logo.
* Team name.
* Current role.

Example:

```text
Osagyefo FC

Role: Team Manager
```

---

# Step 3: Profile Settings

Create:

```text
/settings/profile
```

Allow users to edit:

* Full name.
* Profile picture.
* Phone number.
* Email.
* Preferred role.

Display:

* Date joined.
* Team association.

---

# Step 4: Team Settings

Create:

```text
/settings/team
```

Allow users to manage:

* Team name.
* Team logo.
* Team nickname.
* Team slogan.
* Team colors.
* Region.
* District.
* Home ground.
* Year established.

Future-ready fields:

* Facebook.
* Instagram.
* TikTok.
* Website.

---

# Step 5: Staff & Roles

Create:

```text
/settings/staff
```

Display:

* Head coach.
* Assistant coach.
* Team manager.
* Captain.

Features:

* Add staff.
* Remove staff.
* Change roles.
* View permissions.

Prepare for future role-based access control.

---

# Step 6: Preferences

Create:

```text
/settings/preferences
```

Allow users to customize:

Theme:

* Light.
* Dark.
* System.

Language:

* English.
* Twi (future).
* Fante (future).

Date format:

* DD/MM/YYYY.
* MM/DD/YYYY.

Dashboard preferences:

* Default home screen.
* Favorite shortcuts.

---

# Step 7: Notifications

Create:

```text
/settings/notifications
```

Controls:

* Match reminders.
* Training reminders.
* Team announcements.
* Report notifications.

Notification channels:

* In-app.
* WhatsApp.
* SMS (future).
* Email.

Display examples:

```text
Notify players 1 hour before training.

Notify coaches after match results.
```

---

# Step 8: Security

Create:

```text
/settings/security
```

Features:

* Change password.
* Enable two-factor authentication (UI only).
* Manage sessions.
* Log out from all devices.

Display:

* Last login.
* Active sessions.

---

# Step 9: Data & Export

Create:

```text
/settings/export
```

Allow users to:

Export:

* Players.
* Team information.
* Matches.
* Reports.
* Attendance.

Formats:

* PDF.
* Excel.
* CSV.

Future:

* Google Drive backup.
* Dropbox backup.

---

# Step 10: About

Create:

```text
/settings/about
```

Display:

* App version.
* Release notes.
* Terms of service.
* Privacy policy.
* Contact support.

Include:

```text
Built for grassroots football in Ghana 🇬🇭
```

---

# Step 11: Permissions Model

Prepare a permissions structure.

Roles:

* Team Owner
* Team Manager
* Head Coach
* Assistant Coach
* Captain
* Player

Example permissions:

| Action           | Manager | Coach | Captain | Player |
| ---------------- | ------- | ----- | ------- | ------ |
| Add Player       | ✓       | ✓     | ✗       | ✗      |
| Create Match     | ✓       | ✓     | ✗       | ✗      |
| Generate Reports | ✓       | ✓     | ✗       | ✗      |
| Edit Team        | ✓       | ✗     | ✗       | ✗      |

Do not implement backend authorization yet.

---

# Step 12: Components Required

Create:

```text
SettingsCard

SettingsSection

ProfileForm

TeamSettingsForm

NotificationSettings

SecurityCard

PermissionTable

ExportCard
```

---

# Step 13: State Management

Create:

```text
settingsStore
```

Manage:

* User preferences.
* Theme.
* Notifications.
* Security settings.
* Team settings.

Persist locally.

---

# Step 14: UX Requirements

The settings experience must:

* Work on small Android phones.
* Be understandable by non-technical users.
* Use large touch targets.
* Minimize typing.

The user should be able to change any setting in less than one minute.

---

# Step 15: Empty, Loading & Error States

Implement:

Loading:

* Skeletons.
* Smooth transitions.

Errors:

```text
Unable to update settings.

Please try again.
```

Empty states:

```text
No team social links added yet.
```

---

# Step 16: Testing Checklist

Verify:

✓ Profile editing

✓ Team editing

✓ Theme switching

✓ Notifications

✓ Security settings

✓ Data export

✓ Mobile responsiveness

✓ Accessibility

✓ Type safety

✓ State persistence

---

# Deliverables

At the end of Sprint 006.5, users should be able to:

✓ Manage their profile

✓ Manage team settings

✓ Configure notifications

✓ Customize preferences

✓ View permissions

✓ Export data

✓ Access support information

The result should feel like:

"A modern, simple settings experience designed for grassroots football teams."
