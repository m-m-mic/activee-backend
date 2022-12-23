import mongoose from "mongoose";

// Mongoose Schema für Sprachen
const LanguageSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
});

export const Language = mongoose.model("Language", LanguageSchema);
