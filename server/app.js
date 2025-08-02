import dotenv from 'dotenv';//dotenv is used to load environment variables from a .env file
dotenv.config(); // this loads the environment variables from the .env file into process.env,process.env is a global object in Node.js that contains the user environment variables
// This allows you to access environment variables in your application, such as database connection strings, API
import express from 'express';
import cors from 'cors';// CORS is used to enable Cross-Origin Resource Sharing, allowing your server to accept requests from different origins
// This is useful when your frontend and backend are hosted on different domains or ports
import path from 'path';// path is used to handle and transform file paths in a cross-platform way
// It provides utilities for working with file and directory paths, such as joining paths, resolving absolute paths, and extracting file extensions
import { fileURLToPath } from 'url';// fileURLToPath is used to convert a URL to a file path, which is necessary when working with ES modules in Node.js

import { connectDB } from './src/config/db.js';// connectDB is a function that connects to the MongoDB database
import voiceRoutes from './src/routes/voiceRoutes.js';// voiceRoutes is an Express router that handles routes related to voice cloning

// __filename and __dirname setup in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());                      // For parsing JSON request bodies
app.use(express.urlencoded({ extended: true }));  // For URL-encoded data (forms)

// Connect to MongoDB database
connectDB()
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Mount your API routes under /api
app.use('/api', voiceRoutes);

// --- THIS IS THE CORRECTED LINE ---
// Serve static files from the correct output directory
app.use('/voice', express.static(path.join(__dirname, 'voice_cloner/outputs')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});