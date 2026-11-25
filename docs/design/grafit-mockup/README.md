# Grafit mockup (design reference)

The look the redesign (phase 11 in `docs/re-architecture-plan.md`) builds towards: direction **A · Grafit**, chosen
from three mockups. Two screens:

- `dashboard.dc.html`: the studio dashboard home (sidebar, top bar, stats, today's schedule, requests, stock alerts).
- `studio-page.dc.html`: a studio's page on the customer site (header, services with prices, car size switch, estimate
  card, opening hours, reviews).

They are Design Component sources from the mockup canvas, not app code: plain HTML with inline styles, a
`{{themeClass}}` hole that switches between the `.t-dark` and `.t-light` token sets, and a small script block for the
interactive studio page. They don't render on their own (the canvas runtime, `support.js`, isn't here); read them for
layout, spacing and markup structure.

When the mockup and `docs/design-system.md` disagree, the design system wins: it holds the final token names and values.
