import mongoose from "mongoose";

const { Schema } = mongoose;

const certificateSchema = new Schema({
  title: String,
  no: String,
  awardingOrganisation: String,
  content: String,
  path: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  expireAt: Date,
});

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;