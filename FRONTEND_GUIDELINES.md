# FRONTEND_GUIDELINES.md

# KickStartGH Frontend Development Guidelines

## Purpose

Define frontend development standards to maintain a clean, scalable, and consistent application.

---

# Technology Stack

Framework:

* Next.js App Router

Language:

* TypeScript

Styling:

* Tailwind CSS

Components:

* Shadcn UI

Animations:

* Framer Motion

State:

* Zustand

Server Data:

* TanStack Query

Forms:

* React Hook Form

Validation:

* Zod

Icons:

* Lucide React

---

# Architecture Rules

Use feature-based architecture.

Example:

```
src/

features/

players/

components/

hooks/

services/

types/
```

Each feature owns its:

* Components.
* Hooks.
* API calls.
* Types.
* Validation.

---

# Component Rules

Every component must:

* Have one responsibility.
* Be reusable.
* Support mobile and desktop.
* Avoid business logic where possible.

Example:

Good:

```
<PlayerCard />

<PlayerStats />

<PlayerActions />
```

Avoid:

```
<PlayerEverythingComponent />
```

---

# List Page Convention

Every page that renders a collection as cards or a table follows the same shape:

* A `ViewToggle` (card/list) paired with a `SearchBar`, and any filter `Select`s, above
  the collection.
* A `Pagination` component below it, `16` items per page.
* Every filter, search, sort, or view-toggle change resets the page back to `1`.

Reuse `ViewToggle` (`src/components/common/ViewToggle.tsx`) and `Pagination`
(`src/components/common/Pagination.tsx`) rather than building page-specific versions.

---

# Naming Convention

Components:

PascalCase

Example:

```
PlayerCard.tsx
MatchForm.tsx
ReportBuilder.tsx
```

Hooks:

camelCase with "use"

Example:

```
usePlayers.ts
useMatches.ts
```

Files:

camelCase where applicable.

---

# Styling Rules

Use Tailwind classes.

Avoid:

Inline styles.

Avoid:

Hardcoded colors.

Use theme variables.

Example:

Good:

```
bg-primary
text-accent
```

Bad:

```
bg-[#1e3a8a]
```

---

# Brand Theme

Primary:

```
Navy Blue
#1e3a8a
```

Accent:

```
Bright Blue
#2563eb
```

Ink (text):

```
Slate Ink
#1f2937
```

Tint (light surfaces):

```
Sky Tint
#e0f2fe
```

Use accent blue for:

* Primary actions.
* Highlights.
* Important statistics.

---

# Responsive Rules

Mobile first.

Build:

1. Mobile.
2. Tablet.
3. Desktop.

Required testing:

* Small Android screens.
* iPhone.
* Desktop.

---

# API Integration

Never call APIs directly inside components.

Use services.

Example:

```
services/

players.service.ts

matches.service.ts
```

Components consume hooks:

```
usePlayers()
```

---

# State Management

Use Zustand for:

* Authentication state.
* User preferences.
* Offline queue.

Use React Query for:

* Server data.
* API caching.
* Synchronization.

---

# Forms

All forms must have:

* Validation.
* Loading state.
* Error handling.
* Success feedback.

Use:

React Hook Form + Zod.

---

# Loading States

Never show blank screens.

Use:

* Skeleton loaders.
* Progress indicators.

---

# Error Handling

Errors should be human-friendly.

Bad:

```
Error 500
```

Good:

```
Unable to save player.

Please check your internet connection.
```

---

# Accessibility

All components must:

* Have labels.
* Support keyboard navigation.
* Use semantic HTML.
* Maintain readable contrast.

---

# Performance

Optimize for:

* Slow internet.
* Low-end Android phones.

Avoid:

* Large dependencies.
* Heavy animations.
* Unnecessary renders.

---

# Animation Guidelines

Use Framer Motion for:

Allowed:

* Page transitions.
* Card entrance.
* Button feedback.
* Loading states.

Avoid:

* Excessive movement.
* Distracting animations.

---

# Git Workflow

Branches:

```
main

develop

feature/*
```

Commit style:

```
feat: add player registration

fix: resolve match form validation

ui: update dashboard cards
```

---

# Code Quality

Before completing a feature:

Check:

✓ Mobile responsive

✓ Loading state

✓ Error state

✓ Empty state

✓ Reusable components

✓ Type safety

✓ Accessibility

---

# Development Philosophy

Build software that feels like:

"A professional football club system simplified for grassroots teams in Ghana."
