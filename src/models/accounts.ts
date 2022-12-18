import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  type: { type: String, required: true },
  tier: {
    type: String,
    required: true,
  },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  club: String,
  phone_number: String,
  birthday: String,
  address: {
    type: {
      street: String,
      house_number: String,
      zip_code: String,
      city: String,
    },
    _id: false,
  },
  languages: {
    type: [{ _id: String, name: String }],
  },
  genders: {
    type: [{ _id: String, name: String }],
  },
  sports: {
    type: [{ _id: String, name: String }],
  },
  transport: {
    type: [{ _id: String, name: String }],
  },
  distance: Number,
  times: {
    type: [{ day: String, starting_hour: String }],
    _id: false,
  },
  related_accounts: {
    type: [{ _id: String, first_name: String, last_name: String }],
  },
  activities: {
    type: [{ _id: String, name: String, sport: { _id: String, name: String } }],
  },
});

export const Account = mongoose.model("Account", AccountSchema);
