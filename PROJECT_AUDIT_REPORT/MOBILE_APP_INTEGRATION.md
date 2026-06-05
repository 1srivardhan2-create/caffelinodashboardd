# Mobile App Integration

## APIs Already Available for Mobile App
- `GET /api/mobile/events` -> Returns a filtered list of all upcoming `published` events.
- `GET /api/mobile/events/featured` -> Returns a filtered list of upcoming `published` events with `isFeatured: true`.
- `GET /api/mobile/events/search?q=` -> Full-text search for upcoming events.
- `GET /api/mobile/events/:id` -> Detailed payload for a specific event. Includes view analytics incrementation.
- `POST /api/events/register` -> Endpoint to register users and allocate tickets.

## Security Controls
- Mobile APIs strip out ALL sensitive bank and payout data (`accountHolderName`, `bankName`, `accountNumber`, `ifscCode`, `upiId`).

## APIs Missing for Mobile App
- Currently none explicitly blocked out, though Mobile App might require specific user-profile endpoints if user sessions are required for Event Bookings.

## Required APIs for Event Listing
- `GET /api/mobile/events`

## Required APIs for Event Details
- `GET /api/mobile/events/:id`

## Required APIs for Registration
- `POST /api/events/register`
