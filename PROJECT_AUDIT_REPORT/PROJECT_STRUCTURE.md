# Project Structure

```
caffelino-dashboard/
├── server/                   # Backend Express App
│   ├── config/               # Configuration files (cloudinary.js)
│   ├── controllers/          # API Handlers (auth, cafe, event, mobile.event, order)
│   ├── middlewares/          # Security & Processing (auth.middleware, upload.js)
│   ├── models/               # MongoDB Schemas (Cafe, Event, Notification, Payment, Registration, Settlement, Ticket, User)
│   ├── routes/               # API Routes mapping (admin, auth, cafe, event, mobile.event, order)
│   ├── .env                  # Environment Variables
│   └── index.js              # Entry point & MongoDB connection
├── src/                      # Frontend React App
│   ├── app/                  
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Global State (AuthContext, EventAuthContext)
│   │   ├── pages/            
│   │   │   ├── dashboard/    # Cafe Owner / Admin Dashboard
│   │   │   ├── events/       # Organizer / Events Hub
│   │   │   ├── user/         # Public user views
│   │   └── routes.tsx        # React Router mapping
│   ├── services/             # Axios API services
│   └── index.css             # Tailwind & Base styling
```
