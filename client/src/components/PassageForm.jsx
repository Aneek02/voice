import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import "./PassageForm.css";

const PassageForm = ({ onSubmit }) => {
  const [passage, setPassage] = useState("");
  const [voiceMap, setVoiceMap] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ passage, voiceMap });
  };

  return (
    <motion.form 
      className="passageForm"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="titleContainer"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <FileText size={24} />
        <h3 className="passageLabel">Enter Passage</h3>
      </motion.div>

      <motion.div
        className="textareaContainer"
        whileHover={{ scale: 1.02 }}
        whileFocus={{ scale: 1.02 }}
      >
        <textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          placeholder="Type or paste the text you want to convert to speech using your cloned voice..."
          className="textarea"
          rows={6}
          required
        />
        <motion.div
          className="textareaOverlay"
          animate={{
            opacity: passage ? 0 : 1,
            scale: passage ? 0.8 : 1
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      <motion.button
        type="submit"
        className="submitButton"
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 10px 30px rgba(6, 182, 212, 0.4)"
        }}
        whileTap={{ scale: 0.95 }}
        disabled={!passage.trim()}
        animate={{
          opacity: passage.trim() ? 1 : 0.6
        }}
      >
        <motion.span
          className="buttonContent"
          animate={{ x: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles size={18} />
          Submit Passage
        </motion.span>
      </motion.button>
    </motion.form>
  );
};

export default PassageForm;
