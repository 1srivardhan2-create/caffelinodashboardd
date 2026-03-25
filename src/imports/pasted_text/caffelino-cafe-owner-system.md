🔥 🧠 MASTER PROMPT (USE THIS ANYWHERE)
Writing

Build a complete Cafe Owner system for "Caffelino" with the following full flow:

Authentication:
Cafe owners can Sign Up and Login
Fields: Name, Email, Phone, Password
OTP verification for phone/email
After verification → allow access to onboarding
Cafe Registration (Onboarding):

Step-by-step form:
a) Cafe Details:

Cafe Name
Address
Location (Google Maps optional)
Opening & Closing Time
Category (Cafe, Restaurant, Cloud Kitchen)

b) Manager Details:

Manager Name
Phone Number
Profile Picture (required)

c) Cafe Photos:

Upload minimum 4 images
Interior, Exterior, Seating, Ambience
Store in Cloudinary
Save URLs in DB

d) Terms:

Accept 6% commission per order
After submission:
→ Status = "pending_verification"
Verification System:
Admin reviews cafe
Status:
pending → approved / rejected
Only approved cafes can access dashboard
Cafe Owner Dashboard (ONLY CASH SYSTEM):

Sections:

A) Dashboard Home:

Total Orders Today
Pending Orders
Earnings Today
Quick stats

B) Live Orders:

Show orders in real-time
Each order:
Items
Total amount
Status

Flow:

New order → status = "pending"
Button: Accept Order
After accept → status = "confirmed"
Button: Complete Order
After complete → status = "completed"

IMPORTANT:

Payment Mode: CASH ONLY
No online payment

C) Billing Logic:

Show:
Subtotal
CGST + SGST
Total
Full amount = Cash at counter

D) Earnings:

Only completed orders count
Calculate:
Total amount
6% commission
Final earning

E) Menu Management:

Add / Edit / Delete items
Fields:
Name
Price
Image
Category

F) Profile Section:

Show:
Cafe Name
Profile Picture
4 Cafe Images (gallery)
Contact details
Allow edit
Image Handling:
Upload all images to Cloudinary
Store URLs
Use URLs in:
Cafe cards
Dashboard
Profile
Error Handling:
Show proper toast messages
Handle API failures
Show loading states
Performance:
Use skeleton loaders
Limit API data
Optimize images

Goal:
A smooth, real-world cafe owner system with onboarding, verification, live orders, cash handling, and earnings tracking.

🧭 🔥 FULL FLOW (SIMPLE UNDERSTAND)
🟢 STEP 1 — SIGNUP / LOGIN
User → Signup → OTP Verify → Login
🟡 STEP 2 — REGISTER CAFE
Details → Manager → Photos (4+) → Submit
→ Status: Pending
🔵 STEP 3 — ADMIN VERIFICATION
Pending → Approved ✅ → Dashboard access
🟣 STEP 4 — DASHBOARD FLOW
📦 LIVE ORDERS
New Order → Pending
↓
Accept Order → Confirmed
↓
Complete Order → Completed
↓
Move to Earnings
💰 EARNINGS FLOW
Completed Orders only

Example:
Total = ₹1000
Commission (6%) = ₹60
Final = ₹940
🧾 BILLING (CASH ONLY)
Subtotal + GST = Total
Payment Mode = CASH
🗺️ 🔥 FULL MAPPING (ARCHITECTURE)
📁 DATABASE STRUCTURE
👤 User
name
email
phone
password
🏪 Cafe
name
address
ownerId
status (pending/approved)
profileImage
galleryImages[4]
🍽️ Menu
cafeId
name
price
image
📦 Order
cafeId
items[]
totalAmount
status (pending/confirmed/completed)
paymentMode = CASH
💰 Earnings
cafeId
orderId
totalAmount
commission
finalAmount
⚠️ IMPORTANT RULES

✅ Only CASH (no Razorpay here)
✅ Minimum 4 images required
✅ Earnings only after COMPLETE
✅ Profile pic = shown in cafe cards