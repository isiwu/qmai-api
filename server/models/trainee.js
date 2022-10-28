import mongoose from "mongoose";

const { Schema } = mongoose;

const traineeSchema = new Schema({
  name:{
    first: String,
    last: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  score: {
    type: Number,
    default: 0
  },
  course: {
    type: String,
    required: true,
  },
  atpId: {
    type: String,
    required: true,
  },
  hasPayForCertificate: {
    type: Boolean,
    default: false
  },
  cert: {
    no: Number,
    path: String,
    createdAt: Date,
    expireAt: Date,
    isCertified: {
      type: Boolean,
      default: false
    },
    hasExpired: {
      type: Boolean,
      default: false,
    }
  }
});

const Trainee = mongoose.model("Trainee", traineeSchema);
export default Trainee;