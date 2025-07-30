// src/models/PassageSample.js
import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const ParagraphSchema = new Schema({
  text: String,
  voice: { type: Types.ObjectId, ref: 'VoiceSample' },
  order: Number,
  audioFileId: Types.ObjectId, // GridFS file ID
});

const PassageSchema = new Schema({
  title: String,
  paragraphs: [ParagraphSchema],
  createdAt: { type: Date, default: Date.now },
});

const PassageSample = mongoose.model('PassageSample', PassageSchema);

export default PassageSample;
