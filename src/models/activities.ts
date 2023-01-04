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
  league: String,
  languages: {
    type: [{ _id: String, name: String }],
    required: true,
  },
  maximum_participants: Number,
  requirements: String,
  required_items: [{ _id: String, name: String }],
  additional_info: String,
  membership_fee: String,
  dates: {
    type: [{ day: { value: String, label: String }, starting_time: String, ending_time: String }],
    _id: false,
    required: true,
  },
  address: {
    type: { street: String, house_number: String, zip_code: String, city: String },
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
  participants: [
    {
      _id: String,
      first_name: String,
      last_name: String,
      email: String,
      birthday: String,
    },
  ],
});

export const Activity = mongoose.model("Activity", ActivitySchema);
