# Design system: Grafit

The one look of the dashboard, the customer site and `/for-studios`: monochrome greys, Geist and Geist Mono, inverted
primary buttons, thin borders, no gradients, light and dark themes. Everything here lives in `packages/ui`
(`@detaileed/ui`): tokens and base styles in `src/styles/theme.css` (imported by both apps as `@detaileed/ui/theme.css`),
the theme code in `src/theme/`, components in `src/components/`. The approved mockup is in `docs/design/grafit-mockup/`;
where it and this guide disagree, this guide wins.

While phase 11 is in progress the old Forest & Cream palette (`green-*`, `cream*`, `amber*`, `text-dim`/`text-mid`),
fonts (`font-serif`, `font-syne`) and utilities (`.floating-card*`, `.premium-shadow`, `.mesh-bg`,
`bg-brand-gradient`) are still defined for screens not migrated yet. They are deprecated: migrated and new code never
uses them. Task T13 removes them and adds a lint rule.

## Colour tokens

Use these utilities (`bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*`, …) and nothing else. They switch with the
theme by themselves, so never add `dark:` variants for colours. In inline styles and custom CSS use the variables
(`var(--surface)`, `var(--danger)`); in charts and canvas code read them with `getComputedStyle`.

| Token                      | Use it for                                                                         | Light             | Dark                            |
| -------------------------- | ---------------------------------------------------------------------------------- | ----------------- | ------------------------------- |
| `background`               | the page                                                                           | #ffffff           | #0a0a0a                         |
| `subtle`                   | sidebar, table head, segmented-control track, quiet panels                         | #fafafa           | #0f0f0f                         |
| `surface`                  | cards, inputs, menus, dialogs, popovers                                            | #ffffff           | #141414                         |
| `muted`                    | hover and selected fill, skeletons, neutral badge fill                             | #f4f4f5           | #1c1c1c                         |
| `border`                   | dividers, card and table borders (the default border colour)                       | #e7e7e7           | #262626                         |
| `border-strong`            | inputs, outline buttons, anything that must read as a control                      | #d4d4d4           | #383838                         |
| `foreground`               | main text, icons next to it                                                        | #0a0a0a           | #ededed                         |
| `muted-foreground`         | secondary text: descriptions, inactive nav items, helper text                      | #525252           | #a3a3a3                         |
| `faint`                    | meta text, table heads, placeholders, timestamps                                   | #666666           | #8f8f8f                         |
| `primary`                  | the main button, the active pill or tab: inverted (dark on light, light on dark)   | #0a0a0a           | #ededed                         |
| `primary-foreground`       | text and icons on `primary`                                                        | #ffffff           | #0a0a0a                         |
| `ring`                     | focus rings: `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background` | #525252           | #a3a3a3                         |
| `success` / `success-soft` | paid, accepted, in stock, saved: text or dot / badge or alert fill                 | #15803d / #ecfdf3 | #4ade80 / rgba(74,222,128,.12)  |
| `info` / `info-soft`       | planned, new, informational                                                        | #1d4ed8 / #eff6ff | #7cb4ff / rgba(96,165,250,.12)  |
| `warning` / `warning-soft` | waiting, pending, low stock                                                        | #a16207 / #fefce8 | #fbbf24 / rgba(251,191,36,.12)  |
| `danger` / `danger-soft`   | errors, cancelled, rejected, out of stock, destructive actions                     | #b91c1c / #fef2f2 | #f87171 / rgba(248,113,113,.12) |
| `danger-foreground`        | text on a solid `danger` button                                                    | #ffffff           | #0a0a0a                         |
| `star`                     | rating stars only                                                                  | #d97706           | #fbbf24                         |
| `overlay`                  | the backdrop behind dialogs and the mobile menu                                    | rgba(0,0,0,.4)    | rgba(0,0,0,.6)                  |

Rules:

- Never `white`, `black`, `slate-*`, `gray-*`, `zinc-*`, `red-*`, `emerald-*` or any other default Tailwind palette
  class, never hex or `rgb()` in class names or inline styles. If a colour is missing, ask for a token.
- Status colours are for status only. A tone is a pair: `text-<tone>` (or a dot in `bg-<tone>`) on `bg-<tone>-soft`.
  Never put `<tone>` text on `surface` for body copy; never use a tone as decoration.
- Opacity modifiers work (`bg-foreground/5`), but prefer a token: `muted` for fills, `faint` for quiet text.

### Status → tone

| Tone      | Booking                     | Booking request (`OnlineRequestStatus`) | Stock        | Other                         |
| --------- | --------------------------- | --------------------------------------- | ------------ | ----------------------------- |
| `info`    | Utworzona (planned)         |                                         |              | new, informational notices    |
| `warning` |                             | Pending                                 | low stock    | unsaved changes, expiring     |
| `success` |                             | Accepted                                | in stock     | paid, saved, invitation taken |
| `danger`  | Anulowana                   | Rejected                                | out of stock | errors, failed payments       |
| `neutral` | Zakończona (done, archived) | Withdrawn                               | not tracked  | drafts, disabled, unknown     |

`neutral` is `muted` fill with `muted-foreground` text. Booking statuses also carry a colour of their own
(`features/bookings/model/statuses.ts`); it may only colour the badge's dot, never text or fills.

## Typography

- `font-sans` is Geist, `font-mono` Geist Mono. Times, dates in tables, money, counts, plates and ids use
  `font-mono tabular-nums`, so columns line up.
- Weights 400 (`font-normal`), 500 (`font-medium`) and 600 (`font-semibold`) only. No `font-bold`, `font-black`,
  `italic` headings or letter-spaced uppercase labels (`text-[10px] uppercase tracking-widest`).
- Sizes: `text-xs` meta, table heads, badges; `text-sm` dashboard body and every control; `text-base` site body;
  `text-lg font-semibold` card and dialog titles; `text-2xl font-semibold tracking-tight` page titles; `text-4xl
font-semibold tracking-tight` only for the studio name on the site and the landing hero.
- Labels and buttons are sentence case in Polish: "Nowa rezerwacja", not "NOWA REZERWACJA" or "Nowa Rezerwacja".
- Secondary text is `text-muted-foreground`; meta is `text-faint`. Don't use opacity for text colour.

## Spacing, shape and elevation

- Tailwind's 4px scale. Common steps: `gap-2` inside controls, `gap-3`/`gap-4` between fields and cards, `gap-6`
  between page sections, `p-4`/`p-5` in cards, `px-3` in controls.
- Controls (buttons, inputs, selects, segmented controls) are 36px high (`h-9`) with `rounded-md`; the small size is
  32px (`h-8`). Icons are 16px (`size-4`) with stroke 1.75.
- Cards, dialogs, menus and tables: `rounded-lg`, `border border-border`, `bg-surface`. No shadow on cards; menus,
  popovers and dialogs get one soft shadow (`shadow-lg`).
- Badges are pills (`rounded-full`) with a 6px dot. Avatars are round.
- Tables: row borders only (`border-b border-border`), head in `bg-subtle text-xs text-faint font-medium`, no zebra
  stripes, no vertical lines.

## Motion

- Only 150 ms colour transitions: `transition-colors duration-150`. No hover lifts (`-translate-y`), scaling,
  shadows growing on hover, gradients or shimmer.
- Dialogs and menus may fade in; put such animations behind `motion-safe:` so `prefers-reduced-motion` turns them off.
- Spinners (`animate-spin`) are the exception and stay on.

## Themes

- Three choices, saved per device in `localStorage['detaileed-theme']`: `system` (the default, follows the OS),
  `light`, `dark`. The switch lives in the dashboard's user menu and the site header (`ThemeSwitch`).
- `themeInitScript` (from `@detaileed/ui`) runs inline in `<head>` before the first paint and sets `data-theme` and
  `color-scheme` on `<html>`; it also follows OS changes (with `system`) and choices saved in other tabs. The dashboard
  has a copy in `index.html` (a test keeps it equal); the site renders it in the root layout. Without the script, the
  CSS falls back to `prefers-color-scheme`.
- In components read the theme with `useTheme()`: `{ theme, resolved, setTheme }`. `resolved` is `light` or `dark`;
  on the server and during hydration it is `light`, so don't render theme-dependent markup on the server.
- The `dark:` variant follows `data-theme`, not the media query. You rarely need it: the tokens already switch. Use it
  only for things tokens can't express (an image, a map style).
- Maps use the OpenFreeMap positron style in light and the dark style in dark (an env style URL overrides both);
  Turnstile uses `theme: 'auto'`; charts read the CSS variables.
- Check every screen in both themes, at 1440 and at 390 px wide.

## Class names: `cn()`

Join and merge classes with `cn()` from `@detaileed/ui` (clsx + tailwind-merge). Later classes win over earlier ones of
the same kind, so components put their defaults first and the caller's `className` last:

```tsx
<div className={cn('rounded-lg border bg-surface p-5', selected && 'bg-muted', className)} />
```

`className` on a component is for layout (margins, width, grid placement); restyling colours from outside is a sign a
variant is missing.

## Layout patterns

- **Dashboard shell**: a 240px sidebar (`bg-subtle`, `border-r`), a slim top bar (breadcrumb, actions), content up to
  about 1180px wide with 28px padding (`p-7`), sections `gap-6`. Below `lg` the sidebar becomes a drawer over the
  `overlay`.
- **Site shell**: a 56px header (`h-14`, `border-b`), a 1160px column (`max-w-[1160px] mx-auto px-4`), the footer in
  `bg-subtle` with `border-t`.
- **Page header**: title (`text-2xl font-semibold tracking-tight`), an optional one-line description in
  `text-muted-foreground`, actions on the right (they wrap below the title on phones). One primary button per page.
- **List or table**: filters and search above in one row (`SegmentedControl`, `SearchInput`, `Select`), then the table
  in a card; on phones tables become stacked rows or scroll horizontally inside the card, never the page.
- **Card**: `rounded-lg border bg-surface`; a header row with `text-sm font-medium` title and an optional action, a body
  with `p-5`. Stats: label in `text-xs text-faint`, value in `text-2xl font-semibold font-mono tabular-nums`.
- **Form**: labels above fields (`text-sm font-medium`), help text and errors below (`text-xs`; errors in
  `text-danger`, linked with `aria-describedby`), sections as cards, actions at the bottom right (primary last).
- **Empty state**: an icon in a `bg-muted` circle, one sentence of what's missing, one action. **Loading**: skeletons
  in the shape of the content (`bg-muted`), a spinner only for actions. **Error**: an `Alert` in the danger tone with a
  retry action.
- Everything works at 390px wide: no horizontal page scroll, touch targets at least 36px.

## Do's and don'ts

Do:

- use tokens, `cn()` and the `@detaileed/ui` components; ask for a missing one instead of building a private copy;
- keep one primary action per view, secondary actions as outline or ghost buttons;
- show focus with `focus-visible:` rings, give icon-only buttons an `aria-label`;
- use `font-mono tabular-nums` for numbers that line up.

Don't:

- use `white`, `black`, default palette classes, hex, `rgb()`, gradients, or the deprecated Forest & Cream tokens;
- add shadows to cards, hover lifts, scaling, or animations longer than 150 ms on colours;
- write uppercase, letter-spaced labels or tiny `text-[9–11px]` text;
- add `dark:` colour variants (the tokens switch already) or read the OS theme yourself (use `useTheme()`).

## Components: basics

<!-- Filled by task T2b. -->

## Components: interactive

Built on [Radix](https://www.radix-ui.com/) primitives (the `radix-ui` package), so focus handling, keyboard use and
ARIA roles come for free. All are client components exported from `@detaileed/ui`, styled with the tokens above,
`className` merged last with `cn()`. Dialogs, menus and tooltips render in a portal on `<body>`, so they follow the
page theme, not a `data-theme` wrapper around their trigger. The dev page `/dev/ui/interactive` on the site
(`pnpm --filter @detaileed/web dev`) shows each of them working in both themes.

### Dialogs

- **`Modal`** (`isOpen`, `onClose`, `title`, `description?`, `size?: 'sm' | 'md' | 'lg'`, `className?`, `children`): the
  dialog for forms and details. `overlay` backdrop, `bg-surface` panel with `rounded-lg`, border and `shadow-lg`, a
  header with the title (`text-lg font-semibold`), the optional description and a close button labelled "Zamknij", the
  body scrolls inside. Focus moves to the panel on open (never straight onto a destructive button), Tab stays inside,
  Escape, the close button and a click on the backdrop call `onClose`, focus returns to the element that opened it.
  Nested modals work: Escape closes only the top one. The page behind doesn't scroll.
- **`ConfirmDialog`** (`open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `cancelLabel = 'Anuluj'`,
  `tone: 'default' | 'danger'`, `onConfirm`, `loading?`): a yes/no question before an action, `role="alertdialog"`.
  Use it instead of `window.confirm` and hand-made confirm modals. Focus starts on the cancel button; the backdrop
  doesn't close it. `onConfirm` doesn't close the dialog: close it with `onOpenChange(false)` once the action has
  succeeded, and pass `loading` while it runs (both buttons and Escape are blocked meanwhile). Use `tone="danger"` for
  deleting, cancelling and anything that can't be undone; the title asks the question ("Usunąć pojazd?"), the
  description says what happens, the confirm label is the verb ("Usuń").

```tsx
<ConfirmDialog
  open={vehicle !== null}
  onOpenChange={(open) => !open && setVehicle(null)}
  tone="danger"
  title="Usunąć pojazd?"
  description="Pojazd zniknie z karty klienta. Tej operacji nie można cofnąć."
  confirmLabel="Usuń"
  loading={remove.isPending}
  onConfirm={() => remove.mutate(vehicle.id, { onSuccess: () => setVehicle(null) })}
/>
```

### Choosing a view

- **`Tabs`**, **`TabsList`**, **`TabsTrigger`**, **`TabsContent`**: sections of one screen, underlined (`border-primary`
  under the active tab, `text-muted-foreground` for the others). Arrow keys move between tabs, Home/End jump to the
  ends; the list scrolls sideways on phones. Give `TabsList` an `aria-label` when the page has more than one. When the
  tab lives in the URL (a route per tab), control `value` from the route and wrap each link in a trigger with
  `asChild`; the route renders the content:

  ```tsx
  <Tabs value={section}>
    <TabsList aria-label="Magazyn">
      <TabsTrigger value="items" asChild>
        <Link to="/s/$studioId/inventory" params={{ studioId }}>
          Produkty
        </Link>
      </TabsTrigger>
      …
    </TabsList>
  </Tabs>
  ```

- **`SegmentedControl`** (`options: { value, label, icon?, disabled? }[]`, `value`, `onValueChange`, `aria-label` or
  `aria-labelledby` (required), `size: 'sm' | 'md'`, `fullWidth?`, `iconOnly?`): one choice among two to five short
  options shown side by side: list filters, day/week/month, list/grid. `md` is 36px high, `sm` 32px. The track is
  `bg-subtle`, the chosen segment `bg-muted` with a `border-strong` inset ring. It is a `radiogroup` with one tab stop:
  arrows move, Space or Enter picks; clicking the chosen segment keeps it chosen. With `iconOnly` the labels stay as
  accessible names. More than five options, or long labels: use a `Select`.
- **`ThemeSwitch`** (`size = 'sm'`, `iconOnly?`, `fullWidth?`): a `SegmentedControl` with Systemowy / Jasny / Ciemny on
  top of `useTheme()`. It goes in the dashboard's user menu and the site header (`iconOnly` where space is tight).

### Form choices

- **`Checkbox`** (Radix props: `checked` (`true`, `false` or `'indeterminate'`), `onCheckedChange`, `defaultChecked`,
  `disabled`, `name`, `value`, plus `label?` and `description?`): a 16px box, `border-strong` when off, `bg-primary`
  with a check (or a dash for `indeterminate`) when on. With `label` it renders the label beside the box and links the
  description; without one, wrap it in a `<label>` or give it `aria-label`. Either way `getByLabelText` finds it. With
  react-hook-form use a `Controller` (it is a button, not an `<input>`).
- **`Switch`** (Radix props: `checked`, `onCheckedChange`, `disabled`, … plus `label?` and `description?`):
  `role="switch"`, for settings that take effect at once (visible on the map, notifications). With `label` it renders a
  settings row: label and description on the left, the switch on the right. Choices saved with a form's submit button
  are checkboxes.
- **`RadioCardGroup`** (`options: { value, label, description?, trailing?, disabled? }[]`, `value` (`''` while nothing is
  chosen), `onValueChange`, `columns: 1 | 2 | 3`, `aria-label` or `aria-labelledby`): one choice among options that need
  more than a word: free slots, vehicles, packages. Cards with a radio dot, the label, an optional description line
  and trailing content (a time, a price, a badge; nothing interactive). The chosen card gets a `primary` border and the
  `muted` fill. Each card is a `radio` named by its label alone, so tests and screen readers find it by the label;
  arrows move and pick within the group. One column on phones.

### Menus and hints

- **`DropdownMenu`**, **`DropdownMenuTrigger`** (use `asChild` with a `Button`), **`DropdownMenuContent`** (`align`
  defaults to `end`), **`DropdownMenuItem`** (`onSelect`, `icon?`, `danger?`, `disabled?`), **`DropdownMenuSeparator`**,
  **`DropdownMenuLabel`**, **`DropdownMenuGroup`**: actions on a row or a record ("Więcej" behind a `MoreHorizontal`
  icon button with an `aria-label`), the user menu. `bg-surface`, `rounded-lg`, border, `shadow-lg`; the highlighted
  item is `bg-muted`, a `danger` item has `text-danger` and a `danger-soft` highlight and goes last, after a separator.
  Enter, Space or ArrowDown opens it, arrows move, typing jumps to an item, Escape closes it and focus returns to the
  trigger. Use `onSelect`, not `onClick`. A destructive item opens a `ConfirmDialog` rather than acting at once.
- **`Tooltip`** (`content`, `children` (one focusable element), `side?`, `align?`, `delayDuration = 300`): a short
  hint on hover and keyboard focus, inverted (`bg-primary text-primary-foreground`, `text-xs`). The trigger gets
  `aria-describedby`. It brings its own provider. A tooltip is extra: icon-only buttons still need an `aria-label`,
  never hide information only in a tooltip, and don't put one on a disabled button (it can't take focus).

### Layers

Dialogs and their backdrop use `z-100`, menus `z-110`, tooltips `z-120`, so a menu or tooltip inside a dialog shows
above it. Don't give page content a `z-index` above 50.
