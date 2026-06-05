# Authentication System

- **Backend Middleware**: `server/middlewares/auth.middleware.js`
  - Uses `jsonwebtoken` (`jwt.verify()`)
  - Validates `Bearer` token inside `Authorization` header.
- **Frontend Contexts**:
  - `AuthContext.tsx`: Main Dashboard context connecting User and Cafe data.
  - `EventAuthContext.tsx`: Handles Organizer sessions (can be merged into global AuthContext).
- **Security Scope**: Protects Admin paths, Cafe Owner dashboard routes, and Organizer event modification paths.
- **Environment Variables used**: `JWT_SECRET`
