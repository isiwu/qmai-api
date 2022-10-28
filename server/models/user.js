import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    first: String,
    last: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: String,
  password: String,
  profileId: {
    type: Schema.Types.ObjectId,
    ref: "Profile"
  },
  role: {
    type: String,
    default: "user",
    trim: true,
    enum: ["admin", "atp", "user"],
  },
  verified: {
    type: Boolean,
    default: function () {
      if (this.role === "admin") return true;
      else return false;
    },
  },
});

const User = mongoose.model("User", userSchema);
export default User;