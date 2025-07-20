import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import VoiceRecorder from "./components/VoiceRecorder";
import PassageForm from "./components/PassageForm";

function App() {
  const [audioFile, setAudioFile] = useState(null);

  const handleUpload = (file) => {
    setAudioFile(file);
    console.log("Uploaded:", file);
  };

  const handleRecord = (file) => {
    setAudioFile(file);
    console.log("Recorded:", file);
  };

  const handleSubmitPassage = (data) => {
    console.log("Final Submission:", {
      audioFile,
      passage: data.passage,
      voiceMap: data.voiceMap,
    });
    // TODO: send to backend here
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">🎧 Voice Reader App</h1>
      <FileUpload onUpload={handleUpload} />
      <VoiceRecorder onRecordComplete={handleRecord} />
      <PassageForm onSubmit={handleSubmitPassage} />
    </div>
  );
}

export default App;
