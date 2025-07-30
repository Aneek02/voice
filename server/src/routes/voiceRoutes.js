// src/routes/voiceRoutes.js
import express from 'express';
import upload from '../middlewares/upload.js';
import {
  createVoice,
  listVoices,
  createPassage,
  assignVoices,
  synthesize,
  streamAudio,
  cloneVoiceSample,
} from '../controllers/voiceController.js';

const router = express.Router();

router.post('/clone', upload.single('voiceSample'), cloneVoiceSample);
router.post('/voices', upload.single('sample'), createVoice);
router.get('/voices', listVoices);
router.post('/passages', createPassage);
router.post('/passages/:id/assign', assignVoices);
router.post('/passages/:id/synthesize', synthesize);
router.get('/audio/:fileId', streamAudio);

export default router;
