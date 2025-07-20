const multer = require('multer');// multer is a middleware for handling multipart/form-data, which is primarily used for uploading files
const path = require('path');// path module provides utilities for working with file and directory paths(o extract file extensions)

const storage = multer.diskStorage({//ells Multer to save files on disk (to a folder), not in memory.
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {//cb: a callback function that Multer calls to indicate that the file has been processed
    
    const uniqueName = `audio_${Date.now()}${path.extname(file.originalname)}`;// Generate a unique filename using the current timestamp and the original file extension
    cb(null, uniqueName);// Pass the unique filename to the callback function, which will be used to save the file
  },
});

const upload = multer({ storage });// Create an instance of multer with the defined storage configuration
// This instance can be used as middleware in routes to handle file uploads

module.exports = upload;
