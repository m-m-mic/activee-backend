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
  club: { type: String, trim: true },
  phone_number: { type: String, trim: true },
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
  languages: [{ type: String, ref: "Language" }],
  genders: [String],
  sports: [{ type: String, ref: "Sport" }],
  transport: [String],
  distance: Number,
  times: {
    type: [{ day: String, starting_hour: String }],
    _id: false,
  },
  related_accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
});

export const Account = mongoose.model("Account", AccountSchema);
