import mongoose from "mongoose";

const { Schema } = mongoose;

const transactionSchema = new Schema({
  transactBy: {
    type: Schema.Types.ObjectId
  },
  tarnsactionType: {
    type: String,
    required: true,
  },
  transactionDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;