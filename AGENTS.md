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
Use:
- size
- contrast
- spacing
- placement
- color restraint

to guide attention intentionally.

Most important content should dominate visually.

Users scan, not read.

---

## Whitespace
Whitespace is critical.

Premium interfaces breathe.
Avoid cramped layouts.

Use generous spacing between sections and grouped spacing within related content.

---

## Typography
Typography carries the design.

Requirements:
- modern sans-serif fonts
- tight tracking on large headings
- slightly reduced line-height on hero text
- clear contrast between headline, body, metadata, and labels
- maximum ~6 font sizes per page

Prefer:
- confidence
- clarity
- readability

over decorative typography.

---

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

---

## Depth & Shadows

Shadows should be FELT, not noticed.

Use:
- soft blur
- low opacity
- subtle elevation

Avoid aggressive shadows.

In dark mode:
- elevation comes from lighter surfaces, not stronger shadows.

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

Reduce cognitive load:
- simple navigation
- predictable layouts
- obvious hierarchy
- intentional spacing

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
1. Generate fast
2. Simplify aggressively
3. Improve hierarchy
4. Reduce clutter
5. Improve spacing
6. Add polish
7. Audit security
8. Refine interactions
9. Deploy

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