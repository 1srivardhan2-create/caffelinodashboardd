const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the folder based on the upload type
    let folder = 'caffelino/events'; // default
    
    // Naming convention: eventId_timestamp or just timestamp if eventId is not yet available
    const prefix = req.body.eventId ? `${req.body.eventId}_` : 'evt_';
    const public_id = `${prefix}${Date.now()}`;

    return {
      folder: folder,
      public_id: public_id,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

// Multer upload middleware (Max size 5MB)
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

/**
 * Deletes an image from Cloudinary by its public ID.
 * @param {string} publicId - The public ID of the image on Cloudinary.
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`Failed to delete image from Cloudinary (${publicId}):`, error);
  }
};

/**
 * Uploads a buffer directly to Cloudinary (useful for generated QR codes).
 * @param {Buffer} buffer - The image buffer.
 * @param {string} folder - The destination folder.
 * @param {string} publicId - The desired public ID.
 * @returns {Promise<Object>} - The Cloudinary upload result.
 */
const uploadBufferToCloudinary = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder, public_id: publicId },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    const streamifier = require('streamifier');
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = {
  cloudinary,
  upload,
  deleteFromCloudinary,
  uploadBufferToCloudinary
};
