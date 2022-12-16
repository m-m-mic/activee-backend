import mongoose from "mongoose";
import { Address } from "../Account";

// TypeScript Interfaces mit allen Typen für values in einer Aktivität
export interface ActivityType {
  name: string;
  club: string;
  sport: PreselectOption;
  gender: PreselectOption;
  age: Age;
  league: string;
  languages: PreselectOption[];
  maximum_participants: number;
  requirements: string;
  required_items: PreselectOption[];
  addition_info: string;
  membership_fee: string;
  dates: Date[];
  address: Address;
  trainers: Trainer[];
  participants: Participant[];
}

interface PreselectOption {
  _id: string;
  name: string;
}

interface Age {
  isOlderThan: boolean;
  age: number;
}

interface Date {
  day: string;
  starting_time: string;
  ending_time: string;
}

interface Trainer {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  show_email: boolean;
  phone_number: string;
  show_phone_number: boolean;
}

interface Participant {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  birthday: string;
}

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
    type: [{ day: String, starting_time: String, ending_time: String }],
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
