# MediocreMarkup Philosophy & Engineering Standards

Build premium websites and applications that feel intentional, cinematic, modern, minimal, trustworthy, and professionally crafted.

The goal is to use AI-assisted development WITHOUT producing websites that look AI-generated or “vibe coded.”

---

# Core Philosophy

- Premium websites feel calm, focused, spacious, and intentional.
- Remove aggressively. Simplicity is a luxury signal.
- Presentation matters more than complexity.
- Great UI is invisible and intuitive.
- Users should instantly understand hierarchy and interaction without explanation.
- Every element should justify its existence.
- Build trust through polish, clarity, responsiveness, and restraint.

---

# Avoid AI/Vibe-Coded Design Patterns

NEVER generate:
- excessive gradients
- neon overload
- emoji-heavy interfaces
- glassmorphism spam
- cluttered dashboards
- random accent colors
- oversized borders
- too many cards
- excessive widgets
- generic SaaS-template layouts
- repeated KPI sections
- overly decorative UI
- chaotic spacing
- excessive animations
- AI-generated sounding copy
- too many competing focal points

If a section feels noisy or overbuilt, simplify it.

---

# Visual Design Principles

## Hierarchy
Use size, contrast, spacing, placement, and restrained color to guide attention intentionally.

Most important content should dominate visually.

Users scan, not read.

## Whitespace
Whitespace is critical.

Premium interfaces breathe.

Avoid cramped layouts.

Use generous spacing between sections and grouped spacing within related content.

## Typography
Typography carries the design.

Requirements:
- modern sans-serif fonts
- tight tracking on large headings
- slightly reduced line-height on hero text
- clear contrast between headline, body, metadata, and labels
- maximum ~6 font sizes per page

Prefer confidence, clarity, and readability over decorative typography.

## Color Philosophy
Use mostly neutrals.

Typical palette distribution:
- 90–95% neutral colors
- 5–10% accent colors

Accent colors should have purpose.

Semantic meanings:
- blue = trust
- green = success
- red = destructive/danger
- yellow = warning

Do NOT use random colors for decoration.

Dark mode should feel cinematic and restrained:
- softer borders
- controlled saturation
- subtle elevation
- layered surfaces

## Depth & Shadows
Shadows should be felt, not noticed.

Use:
- soft blur
- low opacity
- subtle elevation

Avoid aggressive shadows.

In dark mode, elevation comes from lighter surfaces, not stronger shadows.

---

# Motion & Interaction

Every interaction needs feedback.

Buttons should support:
- default
- hover
- active
- disabled
- loading

Inputs should support:
- focus
- error
- success
- warning

Microinteractions should:
- confirm actions
- improve responsiveness
- feel subtle and premium

Use:
- smooth fades
- slight movement
- gentle easing
- restrained hover effects

Avoid flashy animation.

Motion should feel calm and intentional.

---

# Landing Page Standards

Landing pages are about presentation, trust, and emotional perception.

The hero section is the most important area of the website.

The first screen must create:
- confidence
- clarity
- trust
- professionalism

Use:
- large bold headline
- concise supporting text
- strong CTA hierarchy
- minimal clutter
- premium mockups/visuals

One clear purpose per section.

Reduce cognitive load aggressively.

---

# Dashboard/Product UI Standards

AI-generated dashboards often:
- repeat KPIs
- overuse icons
- overcomplicate layouts
- add unnecessary cards

Avoid this.

Dashboards should:
- prioritize useful information
- reduce visual clutter
- collapse secondary actions
- use spacing intentionally
- favor clarity over decoration

Charts and visuals should communicate meaning, not just add color.

---

# Premium Psychology Principles

Premium websites rely heavily on:
- halo effect
- cognitive fluency
- microinteraction polish

Users judge quality within milliseconds.

The interface should feel:
- effortless
- trustworthy
- calm
- refined

Reduce cognitive load through:
- simple navigation
- predictable layouts
- obvious hierarchy
- intentional spacing

---

# Agentic Engineering Principles

Do not randomly “vibe code” by stacking prompts until something works.

The correct workflow is agentic engineering: define clearly, then direct the AI to execute.

Before building any feature or section, define:
- what the final outcome should be
- who the user is
- what the user should be able to do
- what success looks like
- what information is needed
- what constraints must be respected
- what should NOT be included

Never start with vague prompts like:
- “make this better”
- “build a dashboard”
- “make it modern”
- “add a cool section”

Instead, use precise direction:
- what the section does
- what content it includes
- what data it uses
- what states it needs
- how it should behave
- how it should feel
- how it should fit the existing design system

Give the AI one clear job at a time.

Build in small verified steps:
1. Define the outcome.
2. Build one section or feature.
3. Test it.
4. Review the design and code.
5. Fix issues.
6. Continue to the next step.

Do not ask the AI to rebuild the entire app unless absolutely necessary.

Each AI task should be small enough to inspect and verify before moving forward.

After every change, review:
- Did this solve the actual goal?
- Did it introduce visual clutter?
- Did it break the design system?
- Did it create security risk?
- Did it duplicate existing logic?
- Did it make the code harder to maintain?

The human is the director.

AI is used for:
- implementation
- scaffolding
- options
- repetitive work
- fast iteration

The human is responsible for:
- defining success
- taste
- hierarchy
- architecture
- restraint
- security
- final judgment

The goal is not to prompt more.

The goal is to think more clearly before prompting.

---

# Security & Engineering Standards

Never trust the frontend.

All sensitive logic must happen server-side.

Never expose:
- API keys
- AI provider keys
- Stripe secrets
- storage credentials
- admin credentials

Never rely on frontend-only protections.

---

# Backend Security

Required:
- backend validation
- backend rate limiting
- protected API routes
- secure webhook verification
- server-side authorization checks

Rate limits should exist for:
- AI endpoints
- forms
- auth routes
- expensive operations
- public APIs

Use both:
- per-user rate limits
- IP-based rate limits

---

# Supabase/Firebase Standards

Audit RLS carefully before deployment.

Users must NEVER be able to:
- modify subscription status
- modify rate limits
- escalate permissions
- access other users' data

Sensitive fields should not exist on editable user tables.

Audit:
- RLS policies
- storage bucket permissions
- auth flows
- edge/server functions

---

# AI-Assisted Development Workflow

AI is used for:
- scaffolding
- implementation
- prototyping
- repetitive tasks

Humans are responsible for:
- taste
- hierarchy
- restraint
- architecture
- security
- final polish

Workflow:
1. Define the outcome.
2. Generate/build one focused piece.
3. Simplify aggressively.
4. Improve hierarchy.
5. Reduce clutter.
6. Improve spacing.
7. Add polish.
8. Test the change.
9. Audit security.
10. Refine interactions.
11. Deploy.

Before prompting Codex, get inspiration and animation ideas first, choose a direction, then create a precise implementation prompt.

Do not let AI invent the taste from scratch.

---

# Final Standard

The final result should feel:
- premium
- calm
- intentional
- cinematic
- trustworthy
- modern
- polished
- professionally crafted

Never generic.

Never noisy.

Never obviously AI-generated.