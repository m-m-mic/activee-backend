import mongoose from "mongoose";

// Mongoose Schema für eine Aktivität
const ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  club: {
    type: String,
    required: true,
  },
  sport: {
    type: { _id: String, name: String },
    required: true,
  },
  gender: {
    type: { _id: String, name: String },
    required: true,
  },
  age: {
    type: { isOlderThan: Boolean, age: Number },
    required: true,
    _id: false,
    default: { isOlderThan: false },
  },
  league: { type: String, trim: true },
  languages: {
    type: [{ _id: String, name: String }],
    required: true,
  },
  maximum_participants: Number,
  requirements: { type: String, trim: true },
  required_items: [{ _id: String, name: String }],
  additional_info: { type: String, trim: true },
  membership_fee: { type: String, trim: true },
  dates: {
    type: [{ day: { value: String, label: String }, starting_time: String, ending_time: String, id: String }],
    _id: false,
    required: true,
  },
  address: {
    type: {
      street: { type: String, trim: true },
      house_number: { type: String, trim: true },
      zip_code: { type: String, trim: true },
      city: { type: String, trim: true },
    },
    _id: false,
    required: true,
  },
  trainers: {
    type: [
      {
        _id: String,
        first_name: String,
        last_name: String,
        email: String,
        show_email: Boolean,
        phone_number: String,
        show_phone_number: Boolean,
      },
    ],
    required: true,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
});

export const Activity = mongoose.model("Activity", ActivitySchema);
