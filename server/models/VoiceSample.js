const mongoose = require('mongoose');

const voiceSampleSchema = new mongoose.Schema({
  audioPath: {
    type: String,
    required: true,
  },
  passage: {
    type: String,
    required: true,
  },
  voiceMap: [
    {
      paragraph: Number,
      voiceName: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('VoiceSample', voiceSampleSchema);
