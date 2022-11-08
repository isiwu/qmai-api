import express from "express";
import multer from "multer";
import path from "path";
import * as atpController from "../controllers/atpControllers";
import { respondJSON } from "../controllers/userContollers";

const router = express.Router();

//Multer set up
const storage = multer.diskStorage({
  destination: "public/avatars/",
  filename: function (req, file, cb) {
  
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    //console.log(file.buffer);
    req.avatar = `${req.protocol}://${req.headers.host}/avatars/${req.params.id}-${uniqueSuffix}`;
    // if (file.fieldname === "cv") {
    //   req.cv = `${req.protocol}://${req.headers.host}/applications/${req.params.id}-${uniqueSuffix}`;
    // } 
    // if (file.fieldname === "otherRDoc") {
    //   req.otherRDoc = `${req.protocol}://${req.headers.host}/applications/${req.params.id}-${uniqueSuffix}`;
    // }

    // console.log("cv => ", req.cv);
    // console.log("otherRDoc", req.otherRDoc);
    //req.avatar = `${req.protocol}://${req.headers.host}/applications/${req.params.id}-${uniqueSuffix}`;
    cb(null, req.params.id + "-" + uniqueSuffix);
  }
});

const upload = multer({storage});

router.get("/:id", atpController.getATP, respondJSON);
router.get("/:atpId/new-trainees", atpController.getTrainees("new"), respondJSON);
router.get("/:atpId/pending-trainees", atpController.getTrainees("pending"), respondJSON);
router.get("/:atpId/active-trainees", atpController.getTrainees("active"), respondJSON);
router.get("/:atpId/inactive-trainees", atpController.getTrainees("inactive"), respondJSON);
router.get("/:atpId/courses", atpController.courses, respondJSON);
router.post("/:atpId/course-application", atpController.courseApplication, respondJSON);
router.post("/:atpId/add-trainee", atpController.addTrainee, respondJSON);
router.put("/:atpId/certificate-payment", atpController.traineeCertificatePayment, respondJSON);
router.put("/:id/change-password", atpController.changePassword, respondJSON);
router.put("/:atpId/trainees/:traineeId/add-score", atpController.addTraineeScore, respondJSON);
router.put("/:id/update-profile", upload.single("avatar"), atpController.updateProfile, respondJSON);
router.put("/:id/application", atpController.application, respondJSON);

export default router;