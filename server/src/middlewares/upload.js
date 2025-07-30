// server/src/middlewares/upload.js
import multer from 'multer';
import path from 'path';
import { promises as fsPromises } from 'fs';
import * as fs from 'fs';  // <-- This is the standard Node.js fs module
import { getDb } from '../config/db.js';
import { GridFSBucket } from 'mongodb';

const upload = multer({ dest: path.resolve('./uploads') });


export async function saveToGridFS(filePath, originalName) {
  const db = await getDb();
  const bucket = new GridFSBucket(db, { bucketName: 'audios' });
  const stream = fs.createReadStream(filePath);  // <-- Use fs.createReadStream
  const uploadStream = bucket.openUploadStream(originalName);
  stream.pipe(uploadStream);
  return new Promise((resolve, reject) => {
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      fsPromises.unlink(filePath).catch(console.error); // Optional: clean up temp file
      resolve(uploadStream.id);
    });
  });
}

export default upload;
