

import dotenv from 'dotenv';// Import dotenv
dotenv.config(); // Load .env variables early

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // For __dirname in ES modules

import { connectDB } from './src/config/db.js';
import voiceRoutes from './src/routes/voiceRoutes.js';

// __filename and __dirname setup in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());            // For parsing JSON request bodies
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

// Serve static files for generated audio under /voice route
app.use('/voice', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
