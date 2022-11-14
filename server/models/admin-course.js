import mongoose from "mongoose";

const { Schema } = mongoose;

const adminCourseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  courseInfo: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true
  },
});

const AdminCourse = mongoose.model("AdminCourse", adminCourseSchema);
export default AdminCourse;