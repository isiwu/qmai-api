import mongoose from "mongoose";

const { Schema } = mongoose;

const atpInstructorSchema = new Schema({});

const ATPInstructor = mongoose.model("ATPInstructor", atpInstructorSchema);

export default ATPInstructor;