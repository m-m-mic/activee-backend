import mongoose from "mongoose";

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
    default: { isOlderThan: false },
  },
  league: String,
  languages: {
    type: [{ _id: String, name: String }],
    required: true,
  },
  maximum_participants: {
    type: Number,
    required: false,
  },
  requirements: {
    type: String,
    required: false,
  },
  required_items: {
    type: [{ _id: String, name: String }],
    required: false,
  },
  additional_info: {
    type: String,
    required: false,
  },
  membership_fee: String,
  dates: {
    type: [{ day: String, starting_time: String, ending_time: String }],
    required: true,
  },
  address: {
    type: { street: String, house_number: String, zip_code: String, city: String },
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
  participants: {
    type: [
      {
        _id: String,
        first_name: String,
        last_name: String,
        email: String,
        birthday: String,
      },
    ],
    required: false,
  },
});

export const Activity = mongoose.model("Activity", ActivitySchema);
