# Frontend Architecture Notes

## Booking feature building blocks
- Shared booking DTO builder:
  - `features/bookings/utils/buildBookingCreateDto.ts`
- Shared search hooks:
  - `hooks/useClientVehicleSearch.ts`
- Shared selection helper:
  - `utils/selection.ts`

## Toast system
- Canonical toast API:
  - `contexts/ToastContext.tsx`
- View layers should call:
  - `addToast(message, type)`
- Legacy local hook (`components/ui/useToast.tsx`) is deprecated for view-level notifications.

## Role model
- Normalized role helpers:
  - `utils/studioRole.ts`
- Canonical role type:
  - `StudioRole` in `types.ts`

## Modal system
- Canonical component:
  - `components/ui/Modal.tsx`
- Includes:
  - `role="dialog"`
  - `aria-modal`
  - `aria-labelledby`
  - close on `Esc`
  - body scroll lock
  - focus restore

