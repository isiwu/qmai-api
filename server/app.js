import "core-js/stable";
import "regenerator-runtime/runtime";
import express from "express";
import dotEnv from "dotenv";
import cors from "cors";
import path from "path";
import logger from "morgan";
import cron from "node-cron";

import indexRouter from "./routes/index";
import connectDB from "./db-connect";
import scheduleMembershipCertification from "./schedule-membership-certification";
import scheduleTraineeCertification from "./schedule-trainee-certification";

dotEnv.config();

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

//Database Connection
(async () => {
  try {
    await connectDB();
    console.log("\n> Database connection successful!\n");

    //Schedule for certification
    cron.schedule("* * * * *", () => {
      //Membership Certification
      scheduleMembershipCertification();
      //Trainee Certification
      scheduleTraineeCertification();
    });

    
  } catch (error) {
    console.log(`Error connecting to the db due to: ${error.message}`);
  }
})();

app.use(cors());
app.use("/api", indexRouter);

//Error handlers
app.use((req, res) => {
  res.status(404).json({
    status: false,
    data: "Our server is down and your request cannot be filfulled now!",
  });
});
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error) {
    res
      .status(500)
      .json({ status: false, data: "Error occured, try again later!" });
  }
});

export default app;
