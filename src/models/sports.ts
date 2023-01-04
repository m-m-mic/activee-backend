import mongoose from "mongoose";

// Mongoose Schema für Sportarten
const SportSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
});

export const Sport = mongoose.model("Sport", SportSchema);
