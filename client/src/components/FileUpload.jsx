import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Check, File } from "lucide-react";
import styles from "./FileUpload.module.css";

const FileUpload = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      onUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      onUpload(file);
    }
  };

  return (
    <div className={styles.fileUploadContainer}>
      <motion.h2 
        className={styles.uploadTitle}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Upload Audio File
      </motion.h2>
      
      <motion.div
        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          borderColor: isDragOver ? "#3b82f6" : selectedFile ? "#10b981" : "#cbd5e1",
          backgroundColor: isDragOver ? "rgba(59, 130, 246, 0.05)" : selectedFile ? "rgba(16, 185, 129, 0.05)" : "transparent"
        }}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={handleChange}
          className={styles.fileInput}
          id="audio-upload"
        />
        
        <motion.div 
          className={styles.dropContent}
          animate={{ y: isDragOver ? -5 : 0 }}
        >
          <motion.div
            className={styles.iconContainer}
            animate={{ 
              scale: selectedFile ? 1.2 : 1,
              color: selectedFile ? "#10b981" : "#6b7280"
            }}
          >
            {selectedFile ? <Check size={32} /> : <Upload size={32} />}
          </motion.div>
          
          <div className={styles.textContent}>
            <motion.p 
              className={styles.primaryText}
              animate={{ 
                color: selectedFile ? "#10b981" : "#374151"
              }}
            >
              {selectedFile ? "File uploaded successfully!" : "Drop your audio file here"}
            </motion.p>
            <p className={styles.secondaryText}>
              or click to browse
            </p>
          </div>
        </motion.div>
        
        <label htmlFor="audio-upload" className={styles.fileLabel}>
          Choose File
        </label>
      </motion.div>
      
      {selectedFile && (
        <motion.div
          className={styles.selectedFile}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <File size={16} />
          <span>{selectedFile.name}</span>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
