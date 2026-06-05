# MongoDB API Endpoints Directory

This file documents all the active REST API endpoints in the Caffelino backend that directly read from or write to the MongoDB database. You can use these endpoints in your frontend applications or Mobile App integrations.

---

## 1. Mobile App APIs (Events)
*These endpoints fetch data from the `events` collection for the Caffelino Mobile App.*

- **Fetch All Published Events**
  - `GET /api/mobile/events`
  - *Returns upcoming events with status: 'published'*

- **Fetch Featured Events**
  - `GET /api/mobile/events/featured`
  - *Returns events with status: 'published' and isFeatured: true*

- **Search Events**
  - `GET /api/mobile/events/search?q={keyword}`
  - *Performs a regex search across eventName, category, city, and cafeName*

- **Get Specific Event Details**
  - `GET /api/mobile/events/:id`
  - *Returns a single event by its MongoDB _id, and increments the view count.*

---

## 2. Event Organizer APIs (Dashboard)
*These endpoints write data to the `events` collection from the Cafe Owner Dashboard.*

- **Save Event as Draft**
  - `POST /api/events/save-draft`
  - *Creates or updates a document with status: 'draft'*

- **Publish Event**
  - `POST /api/events/publish/:id`
  - *Changes the document status from 'draft' to 'published'*

- **Update Event**
  - `POST /api/events/update/:id`
  - *Modifies an existing event document*

- **Delete Event**
  - `DELETE /api/events/delete/:id`
  - *Permanently removes the document from MongoDB*

- **Get Organizer's Events**
  - `GET /api/events/my-events`
  - *Fetches all events where organizerId matches the logged-in user.*

---

## 3. Cafe Owner APIs
*These endpoints interact with the `cafes` collection.*

- **Register New Cafe**
  - `POST /api/cafe/register`
  - *Creates a new Cafe document and uploads profile pictures to Cloudinary.*

- **Get Cafe Status/Profile**
  - `GET /api/cafe/status`
  - *Fetches the cafe associated with the logged-in user.*

- **Update Cafe Details**
  - `PUT /api/cafe/update`
  - *Modifies cafe profile data in MongoDB.*

---

## 4. User / Auth APIs
*These endpoints interact with the `users` collection.*

- **Google Login / Sign Up**
  - `POST /api/auth/google`
  - *Creates or fetches a User document using Google OAuth.*

- **Get Current User**
  - `GET /api/auth/me`
  - *Fetches the user document using the provided JWT token.*

---

## 5. Event Ticketing APIs
*These endpoints interact with `tickets` and `registrations` collections.*

- **Register for an Event**
  - `POST /api/events/register`
  - *Creates a Registration document and generates a Ticket document. Decrements availableSeats in the Event document.*

- **Verify Ticket (Scanner)**
  - `POST /api/events/verify-ticket`
  - *Updates a Ticket document status from 'active' to 'used'.*
