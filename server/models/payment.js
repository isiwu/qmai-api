import mongoose from "mongoose";

const { Schema } = mongoose;
const paymentSchema = new Schema({});

export default mongoose.model("Payment", paymentSchema);