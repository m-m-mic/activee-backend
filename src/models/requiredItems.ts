import mongoose from "mongoose";

// Mongoose Schema für notwendige Gegenstände in Aktivitäten
const RequiredItemSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
});

export const RequiredItem = mongoose.model("RequiredItem", RequiredItemSchema);
