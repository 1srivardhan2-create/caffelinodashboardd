# Event System Flow

## 1. Event Creation Flow
- Organizers navigate to `/dashboard/events/create`.
- Basic Info, Banner, Location, Time, and Ticket data are inputted.
- `POST /api/events/save-draft` stores the document as a Draft in MongoDB.
- Drafts auto-save using the `_id` tied to `localStorage` or session.

## 2. Event Publishing Flow
- From the Draft screen or My Events table, the Organizer clicks `Publish`.
- `POST /api/events/publish/:id` is invoked.
- Status updates immediately from `draft` to `published`.
- Event becomes visible in the Caffelino Mobile App.

## 3. Event Approval Flow
- Currently skipped (as per recent architectural changes). Organizers publish their events without needing Admin oversight. No `pending_review` state is used.

## 4. Event Deletion Flow
- Organizer clicks Delete.
- `DELETE /api/events/delete/:id` is triggered.
- MongoDB document is removed.
- Cloudinary banner image is wiped from `bannerPublicId` to prevent orphaned files.

## 5. Event Registration Flow
- App triggers `POST /api/events/register`.
- Ticket is generated via `Ticket.model.js`.
- Capacity in `Event.model.js` is reduced. `ticketsSold` increments.
- Status of ticket is tracked (`active`, `used`).
