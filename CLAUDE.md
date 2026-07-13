@AGENTS.md
# KickStartGH Development Rules

You are building KickStartGH, a mobile-first football management platform for grassroots football teams in Ghana.

Core principles:

* Mobile-first.
* Offline-friendly.
* WhatsApp-first.
* Extremely simple.
* Accessible for non-technical users.

Tech stack:

* Next.js App Router.
* TypeScript.
* Tailwind CSS.
* Shadcn UI.
* Framer Motion.
* Zustand.
* React Query.

UI requirements:

* Prioritize touch-friendly interfaces.
* Large buttons.
* Clear empty states.
* Fast loading screens.
* Dark Grey (#323232).
* Vivid Yellow (#ffdb00).

Design inspiration:

* 21st.dev
* Modern football dashboards.
* Clean SaaS products.

Rules:

* Build reusable components.
* Avoid duplicated code.
* Use server components when possible.
* Prefer composition over inheritance.
* Use feature-based architecture.
* Every component must support mobile and desktop.
* Minimize modal usage on mobile.
* Optimize for low-end Android devices.

Before creating any new component:

1. Check if an existing component can be reused.
2. Follow the design system.
3. Ensure accessibility.
4. Add smooth but subtle Framer Motion animations.

Target users:

* Coaches.
* Team managers.
* Players.
* Tournament organizers.

The system should feel professional but simple enough for users who primarily manage football teams through WhatsApp.
