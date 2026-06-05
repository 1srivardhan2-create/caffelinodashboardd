# MongoDB Configuration

- **Mongo URI location**: `server/.env` (`MONGO_URI`) mapped inside `server/index.js`
- **Database name**: Database specified inside URI string (`caffelino`).
- **Collections used**: 
  - `cafes`
  - `events`
  - `notifications`
  - `payments`
  - `registrations`
  - `settlements`
  - `tickets`
  - `users`

- **Models used**:
  - `Cafe.model.js` (Cafe owner data)
  - `Event.model.js` (Event drafts and published events)
  - `Notification.model.js` (System alerts)
  - `Payment.model.js` (Financial transactions)
  - `Registration.model.js` (User registration for events)
  - `Settlement.model.js` (Organizer payouts)
  - `Ticket.model.js` (Event ticketing)
  - `User.model.js` (Users, Admins, Organizers)
