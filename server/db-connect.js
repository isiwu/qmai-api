import mongoose from "mongoose";

const connectDB = async () => {
  await new Promise((resolve, reject) => {
    mongoose.connect("mongodb+srv://inmotion:validprofit@cluster0.wyb6yq6.mongodb.net/qmai_db", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      mongoose.set("returnOriginal", false);
      resolve("");
    })
    .catch(error => {
      reject(error);
    });
  });
};

export default connectDB;