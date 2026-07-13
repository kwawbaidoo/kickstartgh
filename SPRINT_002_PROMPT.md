# Sprint 002: Team Onboarding & Team Setup

## Role

You are continuing as the Senior Frontend Engineer and UI/UX Engineer for KickStartGH.

Before implementing this sprint, review:

* CLAUDE.md
* PRODUCT.md
* ROADMAP.md
* COMPONENTS.md
* USER_FLOWS.md
* FRONTEND_GUIDELINES.md

Follow all project conventions and existing design patterns created in Sprint 001.

---

# Sprint Goal

Build the onboarding experience that allows a football team to create its digital identity.

The onboarding experience must feel:

* Fast.
* Friendly.
* Mobile-first.
* Simple enough for users who primarily use WhatsApp.

Do not integrate with the backend yet. Use local state and mock data.

---

# User Journey

The onboarding should follow this flow:

```text
Landing Page

↓

Create Account

↓

Choose Role

↓

Create Team

↓

Add Team Management

↓

Invite Players

↓

Success Screen

↓

Dashboard
```

---

# Step 1: Build Onboarding Routes

Create:

```text
/onboarding

/onboarding/role

/onboarding/team

/onboarding/staff

/onboarding/invite

/onboarding/success
```

The onboarding experience should behave like a wizard with progress indicators.

---

# Step 2: Role Selection

Allow users to choose:

* Team Manager
* Head Coach
* Assistant Coach
* Team Captain

For MVP, emphasize Team Manager.

Each role should have:

* Icon
* Short description
* Visual selection state

---

# Step 3: Team Creation Form

Create a multi-step form with validation.

Collect:

Required:

* Team name
* Region
* District
* Home ground
* Year established

Optional:

* Team logo
* Team nickname
* Team colors
* Team slogan

Use:

* React Hook Form
* Zod validation

Requirements:

* Large touch-friendly inputs
* Searchable region selector
* Image upload preview

---

# Step 4: Management Team Setup

Allow users to add:

* Head coach
* Assistant coach
* Team manager
* Captain

Fields:

* Full name
* Phone number
* Photo (optional)

Allow skipping this step.

---

# Step 5: WhatsApp Invite System

Generate a mock invite link:

```text
kickstartgh.com/join/ABC123
```

Create:

* Copy button
* Share to WhatsApp button
* QR code preview

Display sample message:

"Join Osagyefo FC on KickStartGH."

---

# Step 6: Success Screen

Show:

* Team logo
* Team name
* Home ground
* Region
* Management team summary

Message:

"Your team is now ready."

Primary action:

```text
Go to Dashboard
```

Secondary action:

```text
Add Players
```

---

# Step 7: Dashboard Integration

Update the dashboard created in Sprint 001.

Display:

* Team name
* Team logo
* Region
* Home ground
* Staff summary

Use mock data from onboarding.

---

# Step 8: Create Reusable Components

Build:

```text
RoleCard

OnboardingLayout

ProgressStepper

TeamForm

StaffCard

InviteCard

SuccessCard
```

Ensure all components:

* Support mobile and desktop
* Follow the design system
* Use Framer Motion transitions

---

# Step 9: States & UX

Implement:

## Loading state

* Skeletons

## Empty state

Example:

"No staff members added yet."

## Validation state

* Friendly messages

Example:

"Please enter your team name."

## Success state

* Confirmation screen

---

# Step 10: Testing Checklist

Verify:

✓ Mobile responsiveness

✓ Form validation

✓ Step navigation

✓ Progress persistence

✓ Accessibility

✓ Reusable components

✓ Smooth animations

✓ Dashboard integration

---

# Deliverables

At the end of Sprint 002, users should be able to:

✓ Create a football team

✓ Define their role

✓ Add staff members

✓ Generate invite links

✓ Complete onboarding

✓ Enter the dashboard

The result should feel like creating a professional football club profile in under five minutes.
