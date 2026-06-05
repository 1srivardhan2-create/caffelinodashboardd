# Organizer (Cafe Owner) Dashboard

## Files Found
- `src/app/components/DashboardLayout.tsx` (Shared with Cafe management)
- `src/app/components/events/EventsLayout.tsx` (Legacy standalone portal layout)
- `src/app/pages/events/EventsDashboard.tsx`
- `src/app/pages/events/MyEvents.tsx`
- `src/app/pages/events/CreateEvent.tsx`
- `src/app/pages/events/ManageEvents.tsx`

## Scope
- Integrated directly into the main Cafe Owner workflow.
- Responsible for all Event creation, drafting, and publishing actions.
- Automatically pulls `cafeId` and `ownerId` contexts from the parent `AuthContext`.
- Manages local ticket configurations and revenue aggregation.
