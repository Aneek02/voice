// server/src/config/db.js
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let isConnected = false;
let db;

export const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  db = mongoose.connection.db;
  isConnected = true;
  console.log('✅ MongoDB connected and GridFSBucket initialized');
};

// For direct GridFS access without mongoose
export const getDb = () => {
  if (!isConnected) throw new Error('DB not connected');
  return db;
};

export const getGFS = () => {
  if (!isConnected) throw new Error('DB not connected');
  return new GridFSBucket(db, { bucketName: 'audios' });
};
