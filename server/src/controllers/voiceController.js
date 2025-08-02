// src/controllers/voiceController.js
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { spawn } from "child_process";
import { promises as fsPromises } from "fs";

import VoiceSample from "../models/VoiceSample.js";
import PassageSample from "../models/PassageSample.js";
import { getGFS } from "../config/db.js";
import { synthesizeParagraph } from "../services/spawnXtts.js";
import { saveToGridFS } from "../middlewares/upload.js";

const cleanOldFolders = (dir, maxAgeMinutes = 15) => {
  const now = Date.now();
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((file) => {
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

export const handleUpload = async (req, res) => {
  try {
    const { passage, voiceMap } = req.body;
    if (!req.file || !passage || !voiceMap)
      return res.status(400).json({ error: "Missing required fields" });

    // Save uploaded file to GridFS
    const audioFileId = await saveToGridFS(
      req.file.path,
      req.file.originalname
    );

    const parsedVoiceMap = JSON.parse(voiceMap);
    const sample = new VoiceSample({
      audioFileId,
      passage,
      voiceMap: parsedVoiceMap,
    });
    await sample.save();
    return res.status(201).json({ message: "Voice data saved", sample });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error uploading voice sample" });
  }
};

export const createVoice = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No voice sample uploaded" });
    const audioFileId = await saveToGridFS(
      req.file.path,
      req.file.originalname
    );
    const sample = new VoiceSample({
      audioFileId,
      name: req.body.name || "Unnamed",
      language: req.body.language || "en",
    });
    await sample.save();
    return res.status(201).json({ message: "Voice saved", sample });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save voice" });
  }
};

export const listVoices = async (req, res) => {
  try {
    const voices = await VoiceSample.find().select(
      "-voiceMap -passage -audioPath"
    );
    return res.json(voices);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch voices" });
  }
};

export const createPassage = async (req, res) => {
  try {
    const { title, text } = req.body;
    if (!text)
      return res.status(400).json({ error: "No passage text provided" });
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((para, i) => ({ order: i + 1, text: para.trim() }));
    const passage = new PassageSample({ title, paragraphs });
    await passage.save();
    return res.status(201).json({ message: "Passage saved", passage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create passage" });
  }
};

export const assignVoices = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignments } = req.body;
    if (!assignments || !Array.isArray(assignments))
      return res.status(400).json({ error: "Invalid assignments data" });
    const passage = await PassageSample.findById(id);
    if (!passage) return res.status(404).json({ error: "Passage not found" });
    assignments.forEach(({ paragraphOrder, voiceId }) => {
      const para = passage.paragraphs.find((p) => p.order === paragraphOrder);
      if (para) para.voice = voiceId;
    });
    await passage.save();
    return res.json({ message: "Voice assignments saved", passage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to assign voices" });
  }
};

export const synthesize = async (req, res) => {
  try {
    const { id } = req.params;
    const passage = await PassageSample.findById(id).populate(
      "paragraphs.voice"
    );
    if (!passage) return res.status(404).json({ error: "Passage not found" });
    const tempDir = path.resolve("./tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    for (const para of passage.paragraphs) {
      if (!para.voice || !para.voice.audioFileId) {
        console.warn(`Skipping para ${para.order}: missing voice sample`);
        continue;
      }
      const outputPath = path.join(tempDir, `para_${para.order}_${id}.wav`);
      await synthesizeParagraph(para.text, para.voice.audioFileId, outputPath);
      // TODO: Save output to GridFS and set para.audioFileId
      // (Same as saveToGridFS but with temp file and link to Passage's paragraph)
      // Use same logic as createVoice/handleUpload here if needed
      await fsPromises.unlink(outputPath);
    }
    await passage.save();
    return res.json({ message: "Synthesis completed", passage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to synthesize audio" });
  }
};

export const streamAudio = async (req, res) => {
  try {
    const { fileId } = req.params;
    const gfs = getGFS();
    if (!gfs) return res.status(500).json({ error: "GridFS not initialized" });
    const _id = new mongoose.Types.ObjectId(fileId);
    const downloadStream = gfs.openDownloadStream(_id);
    downloadStream.on("error", () =>
      res.status(404).json({ error: "Audio not found" })
    );
    res.set("Content-Type", "audio/wav");
    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to stream audio" });
  }
};

// src/controllers/voiceController.js

export const cloneVoiceSample = async (req, res) => {
  try {
    const { passage, voiceMap } = req.body;
    if (!req.file || !passage) {
      return res.status(400).json({ error: "Missing passage or voice sample file" });
    }

    // 1. Save to GridFS as before
    const audioFileId = await saveToGridFS(req.file.path, req.file.originalname);

    // 2. Prepare workspace
    const baseDir = path.resolve("./voice_cloner");
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
    const tempPassagePath = path.join(baseDir, `passage_${Date.now()}.txt`);
    fs.writeFileSync(tempPassagePath, passage, "utf-8");
    cleanOldFolders(path.join(baseDir, "outputs"));
    const outputFolder = `output_${uuidv4()}`;
    const outputPath = path.join(baseDir, "outputs", outputFolder);
    fs.mkdirSync(outputPath, { recursive: true });

    // 3. Create new temp file for voice sample (from GridFS)
    const tempVoicePath = path.join(baseDir, `voice_temp_${Date.now()}.wav`);
    const gfs = getGFS();
    const downloadStream = gfs.openDownloadStream(audioFileId);
    const fileWriteStream = fs.createWriteStream(tempVoicePath);
    await new Promise((resolve, reject) => {
      downloadStream.pipe(fileWriteStream);
      fileWriteStream.on("finish", resolve);
      fileWriteStream.on("error", reject);
    });

    // 4. Parse voice map with error handling
    let voiceMapParsed = [];
    try {
      voiceMapParsed = voiceMap ? JSON.parse(voiceMap) : [];
    } catch {
      console.warn("⚠️ voiceMap not valid JSON, using default EN");
    }

    // 5. Run Python script with the CORRECT environment settings
    const pyExe = process.env.XTTS_PYTHON || "D:\\voiceFlow2.0\\server\\tts_venv\\Scripts\\python.exe";
    const pythonProcess = spawn(pyExe, [
        path.join(baseDir, "generate_audio.py"),
        path.resolve(tempPassagePath),
        path.resolve(tempVoicePath),
        path.resolve(outputPath),
        voiceMap ? JSON.stringify(voiceMapParsed) : "",
    ], {
        // THIS IS THE CORRECTED BLOCK
        env: {
            ...process.env, // Inherit existing environment variables
            "PYTHONIOENCODING": "utf-8", // Force Python to use UTF-8
            "PATH": `D:\\voiceFlow2.0\\server\\tts_venv\\Scripts;${process.env.PATH}`
        }
    });

    pythonProcess.stdout.on("data", (data) => console.log(`stdout: ${data.toString()}`));
    pythonProcess.stderr.on("data", (data) => console.error(`stderr: ${data.toString()}`));

    pythonProcess.on("close", async (code) => {
      // 6. Cleanup: remove temp passage and voice files
      if (fs.existsSync(tempPassagePath)) fs.unlinkSync(tempPassagePath);
      if (fs.existsSync(tempVoicePath)) fs.unlinkSync(tempVoicePath);
      if (code !== 0) {
        return res.status(500).json({ error: "Voice generation failed (Python)" });
      }
      const finalAudio = path.join(outputPath, "final_output.wav");
      if (!fs.existsSync(finalAudio)) {
        return res.status(500).json({ error: "Final audio not found" });
      }

      // 7. Save result and respond
      const newSample = new VoiceSample({
        audioFileId,
        passage,
        voiceMap: voiceMapParsed,
      });
      await newSample.save();
      return res.status(201).json({
        message: "Voice cloned successfully",
        audioUrl: `/voice/${outputFolder}/final_output.wav`,
        sample: newSample,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
