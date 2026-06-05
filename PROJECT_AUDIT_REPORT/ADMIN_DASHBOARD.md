# Admin Dashboard

## Files Found
- `src/app/pages/dashboard/AdminApproval.tsx`
- `server/routes/admin.routes.js`
- `server/controllers/auth.controller.js` (used for some admin actions)

## Scope
- Central interface for system administrators.
- Handles approval/rejection of new Cafe Owner signups.
- Controls cafe verifications (`pending_verification` -> `approved`).
- Has visibility over system-wide cafes.
- Currently does NOT handle Event approvals since Events bypass Admin review and publish directly.
