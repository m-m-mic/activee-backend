import mongoose from "mongoose";

// Mongoose Schema für einen Account
const AccountSchema = new mongoose.Schema({
  email: { type: String, trim: true, unique: true, sparse: true },
  password: { type: String, trim: true },
  type: { type: String, required: true },
  tier: {
    type: String,
    required: true,
  },
  first_name: { type: String, trim: true, required: true },
  last_name: { type: String, trim: true, required: true },
  club: String,
  phone_number: String,
  birthday: String,
  address: {
    type: {
      street: { type: String, trim: true },
      house_number: { type: String, trim: true },
      zip_code: { type: String, trim: true },
      city: { type: String, trim: true },
    },
    _id: false,
  },
  languages: [{ _id: String, name: String }],
  genders: [String],
  sports: [{ _id: String, name: String }],
  transport: [String],
  distance: Number,
  times: {
    type: [{ day: String, starting_hour: String }],
    _id: false,
  },
  related_accounts: [{ _id: String, first_name: String, last_name: String }],
  activities: [{ _id: String, name: String, sport: { _id: String, name: String } }],
});

export const Account = mongoose.model("Account", AccountSchema);
