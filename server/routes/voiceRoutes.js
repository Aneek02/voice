const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const VoiceSample = require('../models/VoiceSample');

// 🧹 Optional Cleanup: delete old output folders
const cleanOldFolders = (dir, maxAgeMinutes = 15) => {
  const now = Date.now();
  fs.readdirSync(dir).forEach(file => {
    const folderPath = path.join(dir, file);
    if (fs.lstatSync(folderPath).isDirectory()) {
      const age = (now - fs.statSync(folderPath).ctimeMs) / (1000 * 60);
      if (age > maxAgeMinutes) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`🧹 Deleted old folder: ${folderPath}`);
      }
    }
  });
};

router.post('/', upload.single('voiceSample'), async (req, res) => {
  try {
    const { passage, voiceMap } = req.body;
    const voicePath = req.file?.path;

    if (!passage || !voicePath) {
      return res.status(400).json({ error: "Missing passage or voice sample file" });
    }

    let voiceMapParsed = [];
    try {
      voiceMapParsed = JSON.parse(voiceMap);
    } catch (e) {
      console.warn('⚠️ voiceMap not valid JSON, using default EN');
    }

    // Write passage to temp file
    const tempPassagePath = path.join(__dirname, '../../voice_cloner', `passage_${Date.now()}.txt`);
    fs.writeFileSync(tempPassagePath, passage, 'utf-8');

    // Clean old outputs and prepare output dir
    const outputsBase = path.join(__dirname, '../../voice_cloner/outputs');
    cleanOldFolders(outputsBase);

    const outputFolder = `output_${uuidv4()}`;
    const outputPath = path.join(outputsBase, outputFolder);
    fs.mkdirSync(outputPath, { recursive: true });

    // 🚀 Run Python script
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../voice_cloner/generate_audio.py'),
      tempPassagePath,
      voicePath,
      outputPath,
      voiceMap ? JSON.stringify(voiceMapParsed) : '' // pass voiceMap if exists
    ]);

    pythonProcess.stdout.on('data', (data) => console.log(`stdout: ${data}`));
    pythonProcess.stderr.on('data', (data) => console.error(`stderr: ${data}`));

    pythonProcess.on('close', async (code) => {
      if (fs.existsSync(tempPassagePath)) fs.unlinkSync(tempPassagePath);

      if (code === 0) {
        const finalAudio = path.join(outputPath, 'final_output.wav');
        if (!fs.existsSync(finalAudio)) {
          return res.status(500).json({ error: 'Final audio not found' });
        }

        // 💾 Save to MongoDB
        const newSample = new VoiceSample({
          audioPath: voicePath,
          passage,
          voiceMap: voiceMapParsed
        });
        await newSample.save();

        res.status(201).json({
          message: 'Voice cloned successfully',
          audioUrl: `/voice/${outputFolder}/final_output.wav`,
          sample: newSample
        });
      } else {
        return res.status(500).json({ error: 'Voice generation failed (Python)' });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
