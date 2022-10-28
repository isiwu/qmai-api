import mongoose from "mongoose";

const { Schema } = mongoose;

const atpSchema = new Schema({
  name: String,
  contact: String,
  address: String,
  city: String,
  country: String,
  postalCode: String,
  interest: String,
  otherInfo: String,
  application: Boolean,
  applicationType: String,
  avatar: String,
  RegDate: Date,
  expDate: Date
});

const ATP = mongoose.model("ATP", atpSchema);

export default ATP;