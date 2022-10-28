import mongoose from "mongoose";

const connectDB = async () => {
  await new Promise((resolve, reject) => {
    mongoose.connect(process.env.DB_URI, {
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