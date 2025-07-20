import React, { useState } from "react";

const PassageForm = ({ onSubmit }) => {
  const [passage, setPassage] = useState("");
  const [voiceMap, setVoiceMap] = useState([{ paragraph: 1, voiceName: "" }]);

  const handleMapChange = (index, field, value) => {
    const updated = [...voiceMap];
    updated[index][field] = value;
    setVoiceMap(updated);
  };

  const addMapping = () => {
    setVoiceMap([...voiceMap, { paragraph: voiceMap.length + 1, voiceName: "" }]);
  };

  const handleSubmit = () => {
    onSubmit({ passage, voiceMap });
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Enter Passage</label>
      <textarea
        rows="6"
        className="w-full p-2 border rounded"
        value={passage}
        onChange={(e) => setPassage(e.target.value)}
      />

      <div className="mt-4">
        <p className="text-sm font-medium">Paragraph Voice Mapping</p>
        {voiceMap.map((map, index) => (
          <div key={index} className="flex gap-2 items-center mt-2">
            <span>Paragraph {index + 1}:</span>
            <input
              className="p-1 border rounded"
              value={map.voiceName}
              onChange={(e) => handleMapChange(index, "voiceName", e.target.value)}
              placeholder="Voice ID or Name"
            />
          </div>
        ))}
        <button
          onClick={addMapping}
          className="mt-2 px-2 py-1 text-sm bg-gray-700 text-white rounded"
        >
          ➕ Add Mapping
        </button>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-indigo-700 text-white rounded"
      >
        🧠 Process
      </button>
    </div>
  );
};

export default PassageForm;
