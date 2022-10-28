import express from "express";
import usersRouter from "./users";
import membershipsRouter from "./memberships";
import adminRouter from "./admin";
import atpRouter from "./atp";

const router = express.Router();

/* GET home page. */
router.use("/users", usersRouter);
router.use("/memberships", membershipsRouter);
router.use("/admin", adminRouter);
router.use("/atps", atpRouter);

export default router;
