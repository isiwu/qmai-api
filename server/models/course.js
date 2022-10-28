import mongoose from "mongoose";

const { Schema } = mongoose;

const courseSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  info: String,
  fee: {
    type: Number,
    required: true,
  },
  atpId: {
    type: String,
    required: true
  }
});

const Course = mongoose.model("Course", courseSchema);

export default Course;