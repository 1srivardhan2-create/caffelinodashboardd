# Missing Features

Based on the architectural audit, the following items are potentially missing or incomplete for a production-ready state:

1. **Mobile App Payment Gateway**: The endpoints for `POST /api/events/register` exist, but payment gateway webhooks (e.g., Razorpay/Stripe) are not fully mapped to verify real-time financial transitions.
2. **Push Notifications**: `Notification.model.js` exists, but there is no integration with FCM (Firebase Cloud Messaging) or APNS to notify users on their mobile app when their favorite Cafe publishes a new event.
3. **Advanced Settlement Automation**: The `Settlement.model.js` exists, but an automated cron job or Admin interface to trigger the actual bank payouts to Organizers is not fully built.
4. **Ticket QR Generation Details**: The backend controller generates a QR code string for tickets, but there isn't a robust PDF ticketing generator (like `pdfkit`) in place for users to download their tickets.
