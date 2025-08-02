import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Mic, FileText, Play, Loader2, Sparkles } from "lucide-react";
import './App.css';
import FileUpload from "./components/FileUpload";
import VoiceRecorder from "./components/VoiceRecorder";
import PassageForm from "./components/PassageForm";

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioResultUrl, setAudioResultUrl] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  const handleUpload = (file) => {
    setAudioFile(file);
    console.log("Uploaded:", file);
    setActiveStep(2);
  };

  const handleRecord = (file) => {
    setAudioFile(file);
    console.log("Recorded:", file);
    setActiveStep(2);
  };

  const handleSubmitPassage = async (data) => {
    if (!audioFile || !data.passage) {
      alert("Please upload or record an audio file and enter a passage.");
      return;
    }

    setIsLoading(true);
    setAudioResultUrl(null);
    setActiveStep(3);

    const formData = new FormData();
    formData.append("voiceSample", audioFile);
    formData.append("passage", data.passage);
    formData.append("voiceMap", JSON.stringify(data.voiceMap || { 
      "1": { "lang": "en", "voice": "default" } 
    }));

    try {
      const response = await fetch("http://localhost:5000/api/clone", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const fullAudioUrl = `http://localhost:5000${result.audioUrl}`;
        console.log("🎧 Audio URL:", fullAudioUrl);
        setAudioResultUrl(fullAudioUrl);
        setActiveStep(4);
      } else {
        alert(`Error: ${result.error || "Something went wrong"}`);
        setActiveStep(2);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Is the backend running?");
      setActiveStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="appContainer">
      <motion.div 
        className="appContent"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Header */}
        <motion.div 
          className="header"
          variants={itemVariants}
        >
          <motion.div 
            className="titleContainer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="sparkleIcon"
            >
              <Sparkles size={32} />
            </motion.div>
            <h1 className="appTitle">Voice Reader App</h1>
          </motion.div>
          
          {/* Progress Steps */}
          <motion.div 
            className="progressSteps"
            variants={itemVariants}
          >
            {[1, 2, 3, 4].map((step) => (
              <motion.div
                key={step}
                className={`progressStep ${activeStep >= step ? 'active' : ''}`}
                whileHover={{ scale: 1.1 }}
                animate={{
                  backgroundColor: activeStep >= step ? "#3b82f6" : "#e5e7eb",
                  color: activeStep >= step ? "#ffffff" : "#6b7280"
                }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && <Upload size={16} />}
                {step === 2 && <FileText size={16} />}
                {step === 3 && <Loader2 size={16} />}
                {step === 4 && <Play size={16} />}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* File Upload Section */}
        <motion.div
          className="card uploadCard"
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FileUpload onUpload={handleUpload} />
        </motion.div>

        {/* Voice Recorder Section */}
        <motion.div
          className="card recorderCard"
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <VoiceRecorder onRecordComplete={handleRecord} />
        </motion.div>

        {/* Passage Form Section */}
        <AnimatePresence>
          {audioFile && (
            <motion.div
              className="card passageCard"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { duration: 0.5, type: "spring", stiffness: 300 }
              }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
            >
              <PassageForm onSubmit={handleSubmitPassage} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Animation */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="loadingOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="loadingSpinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={48} />
              </motion.div>
              <motion.p
                className="loadingText"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Cloning voice, please wait...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio Result */}
        <AnimatePresence>
          {audioResultUrl && (
            <motion.div
              className="card resultCard"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { duration: 0.6, type: "spring", stiffness: 300 }
              }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
            >
              <motion.h3 
                className="resultTitle"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
              >
                🎉 Cloned Voice Result
              </motion.h3>
              <motion.div
                className="audioContainer"
                whileHover={{ scale: 1.02 }}
              >
                <audio controls src={audioResultUrl} className="audioPlayer">
                  Your browser does not support the audio element.
                </audio>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App;
