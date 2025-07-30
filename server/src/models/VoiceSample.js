// src/models/VoiceSample.js
import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const VoiceSampleSchema = new Schema({
  name: { type: String, default: 'Unnamed' },
  audioFileId: { type: Types.ObjectId, required: true }, // GridFS file ID
  language: { type: String, default: 'en' },
  passage: String,
  voiceMap: Object,
}, { timestamps: true });

const VoiceSample = mongoose.model('VoiceSample', VoiceSampleSchema);

export default VoiceSample;
