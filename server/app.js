const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));// Parse URL-encoded bodies (as sent by HTML forms)
app.use("/uploads", express.static("uploads"));
app.use('/voice', express.static(path.join(__dirname, '../voice_cloner/outputs')));


app.get("/", (req, res) => {
  res.send("Voice Reader Backend Running ✅");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
    console.log("MongoDB URI:", process.env.MONGODB_URI);
  })
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const voiceRoutes = require("./routes/voiceRoutes");
app.use("/api/voice", voiceRoutes);
