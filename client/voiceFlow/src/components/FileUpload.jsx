import React, { useState } from "react";

const FileUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Upload .wav File</label>
      <input type="file" accept=".wav" onChange={handleChange} />
      <button
        onClick={handleSubmit}
        className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
      >
        Upload
      </button>
    </div>
  );
};

export default FileUpload;
