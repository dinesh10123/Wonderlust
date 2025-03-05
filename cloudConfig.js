const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // ✅ Correct import

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wonderlust_DEV',
      allowedFormats: ["png", "jpg", "jpeg"], // ✅ Fixed typo
    },
});

module.exports = { cloudinary, storage };
