const VoiceSample = require('../models/VoiceSample');// Import the VoiceSample model to interact with the database

const handleUpload = async (req, res) => {
  try {
    const { passage, voiceMap } = req.body;// Extract passage and voiceMap from the request body
    const audioPath = req.file.path;// Get the path of the uploaded audio file from the request object

    const parsedVoiceMap = JSON.parse(voiceMap);// Parse the voiceMap from JSON string to an object

    const sample = new VoiceSample({// Create a new VoiceSample document with the provided data
      audioPath,
      passage,
      voiceMap: parsedVoiceMap,// Assign the parsed voiceMap to the voiceMap field
    });

    await sample.save();
    res.status(201).json({ message: 'Voice data saved', sample });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading voice sample' });
  }
};

module.exports = { handleUpload };// Export the handleUpload function to be used in the routes
// This function handles the file upload, processes the data, and saves it to the database
