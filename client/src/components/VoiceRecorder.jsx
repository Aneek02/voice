import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Play, Square } from "lucide-react";
import styles from "./VoiceRecorder.module.css";

const VoiceRecorder = ({ onRecordComplete }) => {
  const mediaRecorder = useRef(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const audioChunks = useRef([]);

  const createWavFile = (audioBlob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.decodeAudioData(event.target.result, (buffer) => {
          const wavBuffer = bufferToWave(buffer);
          const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
          const wavFile = new File([wavBlob], "recorded_voice.wav", {
            type: "audio/wav"
          });
          resolve(wavFile);
        });
      };
      reader.readAsArrayBuffer(audioBlob);
    });
  };

  const bufferToWave = (abuffer) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return buffer;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const wavFile = await createWavFile(blob);
        onRecordComplete(wavFile);
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure you have given permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className={styles.recorderContainer}>
      <motion.h2 
        className={styles.recorderLabel}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Record Voice
      </motion.h2>

      <motion.div 
        className={styles.recordingArea}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.button
          className={`${styles.recordButton} ${recording ? styles.recording : ''}`}
          onClick={recording ? stopRecording : startRecording}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            backgroundColor: recording ? "#ef4444" : "#3b82f6",
            boxShadow: recording 
              ? "0 0 30px rgba(239, 68, 68, 0.5)" 
              : "0 8px 25px rgba(59, 130, 246, 0.3)"
          }}
        >
          <motion.div
            animate={{ rotate: recording ? 0 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {recording ? <Square size={24} /> : <Mic size={24} />}
          </motion.div>
        </motion.button>

        {recording && (
          <motion.div
            className={styles.recordingIndicator}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              className={styles.pulse}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className={styles.recordingText}>Recording...</span>
          </motion.div>
        )}
      </motion.div>

      {audioBlob && !recording && (
        <motion.div
          className={styles.audioPreview}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Play size={16} />
          <audio 
            controls 
            src={URL.createObjectURL(audioBlob)} 
            className={styles.audioPlayer}
          />
        </motion.div>
      )}
    </div>
  );
};

export default VoiceRecorder;
