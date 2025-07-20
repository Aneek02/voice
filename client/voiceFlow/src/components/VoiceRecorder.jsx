import React, { useState, useRef } from "react";

const VoiceRecorder = ({ onRecordComplete }) => {
  const mediaRecorder = useRef(null);
  const [recording, setRecording] = useState(false);
  const chunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];//resets chunks to empty array

    mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/wav" });
      const file = new File([blob], "recorded.wav", { type: "audio/wav" });
      onRecordComplete(file);
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setRecording(false);
  };

  return (
    <div className="mb-4">
      <p className="text-sm font-medium mb-1">Record Voice</p>
      {!recording ? (
        <button
          onClick={startRecording}
          className="px-4 py-1 bg-green-600 text-white rounded"
        >
          🎙 Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-4 py-1 bg-red-600 text-white rounded"
        >
          🛑 Stop Recording
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;

/*User clicks record 
→ Request microphone access 
→ Create MediaRecorder 
→ Start recording 
→ Collect audio chunks 
→ User stops recording 
→ Combine chunks into Blob 
→ Convert to File 
→ Send to parent component*/
