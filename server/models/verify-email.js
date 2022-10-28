import mongoose from "mongoose";

const { Schema } = mongoose;
const verifyEmailSchema = new Schema({
  _id: Schema.Types.ObjectId,
  code: {
    type: Number,
    required: true
  }
});


const VerifyEmail = mongoose.model("VerifyEmail", verifyEmailSchema);

export default VerifyEmail;