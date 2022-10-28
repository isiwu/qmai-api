import mongoose from "mongoose";

const { Schema } = mongoose;
const memberSchema = new Schema({
  _id: Schema.Types.ObjectId,
  type: {
    type: String,
    // required: true,
  },
  studingQMAI: Boolean,
  yearsOfWorkExp: {
    type: Number,
    required: true,
  },
  yearsOfSystemExp: {
    type: Number,
    required: true,
  },
  cv: {
    type: String,
    // required: true,
  },
  otherRelevantDocument: {
    name: String,
    url: String,
  },
  membershipId: String,
  cert: {
    url: String,
    issuedAt: Date,
    expireAt: Date,
    hasExpired: Boolean,
    id: Number,
  },
  active: {
    type: Boolean,
    default: false,
  },
  pending: {
    type: Boolean,
    default: false,
  },
  new: {
    type: Boolean,
    default: true,
  },
});

const Member = mongoose.model("Member", memberSchema);
export default Member;