import mongoose from "mongoose";

const connectDB = async () => {
  await new Promise((resolve, reject) => {
    // let url;
    // if (app.get("env") === "production") url = process.env.DB_URI;
    // else url = "mongodb://localhost:27017/qsmai";

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