# Frontend Refactor Baseline Checklist

## Scope map

- Booking creation/editing flow appears in:
  - `views/dashboard/Dashboard.tsx`
  - `views/bookings/BookingsView.tsx`
  - `views/tasks/TasksView.tsx`
  - `views/clients/ClientsView.tsx`
  - `views/team/TeamView.tsx`
- Shared modal usage baseline:
  - Canonical: `components/ui/Modal.tsx`
  - Compatibility re-export: `components/Modal.tsx`

## Regression checklist

- Create booking with existing client/vehicle.
- Create booking with newly created client + vehicle.
- Add custom service and select it in booking.
- Open booking details and close modal via close button, backdrop click, and `Esc`.
- Verify focus returns to previously focused element after closing modal.
- Verify studio role-based visibility in sidebar (`Team` hidden for employee role).
- Verify toasts display for success/error/info paths in reports, inventory, archived, bookings, studio settings.

## Data consistency checks

- Booking list refreshes after `createBooking`.
- Clients list refreshes after `createClient`.
- Services list refreshes after `createService`.
- No `alert()` usage in `views`.
