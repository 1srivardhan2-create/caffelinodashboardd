# Cloudinary Configuration

- **Config file location**: `server/config/cloudinary.js`
- **Upload middleware**: `server/middlewares/upload.js` (using `multer.memoryStorage()`)
- **Upload folders**: `caffelino/events/banner` (defined inside `event.controller.js`)
- **Environment variables used**: 
  - `CLOUDINARY_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
