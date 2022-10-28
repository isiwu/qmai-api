import mongoose  from "mongoose";

const { Schema } = mongoose;

const profileSchema = new Schema({
  dateOfBirth: Date,
  academics: [{
    title: String,
    discipline: String,
    institution: String,
  }],
  workExps: [{
    workPlace: String,
    title: String,
    startDate: Date,
    endDate: Date,
  }],
  avatar: String,
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  hasApplied: {
    type: Boolean,
    default: false,
  },
  applicationReviewed: {
    type: Boolean,
    default: false,
  },
  applicationApproved: {
    type: Boolean,
    default: false,
  },
  formMembershipPayment: {
    type: Boolean,
    default: false,
  },
  formMembershipPaymentAt: Date,
  certificateMembershipPayment: {
    type: Boolean,
    default: false,
  },
  certificateMembershipPaymentAt: Date,
  isCertified: {
    type: Boolean,
    default: false,
  },
  certifiedAt: Date,
  membershipStatus: {
    type: String,
    default: "Inactive",
    enum: ["Active", "Inactive"],
  }
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;