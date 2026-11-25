# Regression checklist

A manual click-through before merging bigger changes to `main`. Run `pnpm dev` (dashboard on :3000, customer site on
:3001) against a local API and a Supabase project with the redirect URLs set. Tick what a change could have touched;
for structural refactors go through all of it. Labels in quotes are what the screen shows. For visual changes,
`pnpm dev:mock` runs both apps on sample data (demo accounts in `apps/mock-api/README.md`), no backend needed.

## Look and feel (both apps)

- [ ] Every screen you touched in the light and the dark theme: text readable, no white or black patches, borders and
      status colours visible, nothing styled for one theme only.
- [ ] The theme switch (dashboard user menu, site header): "Systemowy", "Jasny", "Ciemny" apply at once, survive a
      reload, and "Systemowy" follows the OS setting while the page is open.
- [ ] Reloading in dark shows no light flash before the page appears (dashboard and site, also `/for-studios`).
- [ ] At 390px wide (phone): no horizontal page scroll, menus and tables usable, dialogs fit the screen.
- [ ] Keyboard only: Tab reaches every control in order with a visible focus ring; menus and tabs work with arrows.
- [ ] Dialogs and confirm dialogs: focus moves in and stays inside, `Esc` and the backdrop close them, focus returns
      to the button that opened them.
- [ ] Maps (site search, studio page, dashboard public profile pin) use the dark map style in the dark theme.
- [ ] Fonts are Geist and Geist Mono (times, prices and counts in mono); nothing falls back to a serif.
- [ ] `/dev/ui` and `/dev/ui/interactive` on the site (dev only) still show every shared component in both themes.

## Dashboard

**Sign-in and access**

- [ ] `/login` signs in; a wrong password shows an error; "forgot password" sends the reset email.
- [ ] A signed-out visit to `/s/<id>/requests` goes to `/login?redirect=…` and comes back after signing in.
- [ ] An invitation link (`/accept-invitation?token=…`) shows the studio and role; accepting adds the studio.
- [ ] An invite or reset email link leads to `/set-password`; after saving, the app opens without a delay.
- [ ] `/` reopens the last studio; with no studios, `/studios` opens the "new studio" form and can't be closed.

**Inside a studio**

- [ ] Home: stats, today's schedule, upcoming bookings, stock alerts, revenue chart; quick actions open their forms.
- [ ] Tasks: calendar, in progress and search tabs; a booking card opens its details; status changes stick.
- [ ] New booking: pick an existing client and car, or create both inline; services fill the price; a free slot
      sets the time and bay; the saved booking shows its end time and bay.
- [ ] Archive lists completed and cancelled bookings; a completed visit shows the materials it used.
- [ ] Board ("Grafik"): bays as lanes, free gaps, the day's pending requests; `?date=` survives a reload.
- [ ] Requests ("Zapytania"): filter and paging in the URL; accept at the preferred time or a suggested slot; reject
      with a reason; the sidebar badge updates; an email link with `?id=` opens that request.
- [ ] Clients: search, add, edit, add a vehicle with its size, delete.
- [ ] Inventory: stock list and categories; a delivery and a stocktake change stock through the history; the
      "Prognoza" view shows when items run out.
- [ ] Reports load for a chosen period.
- [ ] Team: invite an employee, change a role; an employee doesn't see the team screen or the employees tab.

**Settings**

- [ ] Services: add and edit with prices per car size and the materials used.
- [ ] "Magazyn": categories and the size factors.
- [ ] Employees, "Planowanie" (bays, opening hours with breaks, rules, closure days), "Profil publiczny" (description,
      address, map pin, publish/hide, link to the public page), "Studio" (time zone).
- [ ] User settings: change password.

**Everywhere**

- [ ] Modals close with the button, the backdrop and `Esc`; focus goes back to where it was.
- [ ] Success and error toasts appear; times show in the studio's time zone, not the browser's.
- [ ] The logo shows on the login page and in the sidebar; the mobile menu opens and closes.

## Customer site

- [ ] `/`: the map shows published studios; type of service and car size filters change pins and prices; the map
      position and filters stay in the URL (`?lat&lng&z&category&size`).
- [ ] `/studio/<id>`: skeleton while loading, then profile, prices for the chosen size, estimate, location map,
      reviews; an unknown or malformed id shows the 404 page.
- [ ] "Book" while signed out → `/sign-in?next=…` (no skeleton flash) → back to `/studio/<id>/book` after signing in.
- [ ] Sign-up sends the confirmation email; "send again" waits a minute between sends; the link signs in.
- [ ] An unconfirmed account at sign-in offers to resend the link (`/confirm-email`).
- [ ] Forgot password → email → `/reset-password` sets a new one and signs out other devices; an expired link lands
      on `/sign-in?error=link` with an explanation.
- [ ] Booking request: services, a saved or new car, a free slot or preferred time, notes; after sending,
      `/account/bookings?sent=1` shows the notice.
- [ ] Account: contact details, cars (add, edit, delete, garage full / duplicate plate messages), requests (withdraw a
      pending one), reviews of finished visits, password change (with the emailed code when asked).
- [ ] `/for-studios`: the landing page and its dashboard demo in both themes and at phone width; its links work.
- [ ] Page source: `noindex` on sign-in, password, account and booking pages, not on `/` or studio pages;
      `/robots.txt` lists the same paths; `/sitemap.xml` lists the published studios.
