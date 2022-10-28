import mongoose from "mongoose";

const { Schema } = mongoose;
const auditeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  info: String,
  doc: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
  },
});

const Audit = mongoose.model("Audit", auditeSchema);
export default Audit;