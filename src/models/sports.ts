import mongoose from "mongoose";

// Mongoose Schema für Sportarten
const SportSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: {
    instruction: {
      short: { type: String, default: "no short instruction given", trim: true },
      full: { type: String, default: "no instruction given", trim: true },
    },
    history: {
      short: { type: String, default: "no short history given", trim: true },
      full: { type: String, default: "no history given", trim: true },
    },
  },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
});

export const Sport = mongoose.model("Sport", SportSchema);
