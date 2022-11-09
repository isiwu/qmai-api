import express from "express";
import * as adminController from "../controllers/adminControllers";
import { respondJSON } from "../controllers/userContollers";

const router = express.Router();

router.get("/new/members", adminController.newMembers, respondJSON);
router.get("/pending/members", adminController.pendingMembers, respondJSON);
router.get("/active/members", adminController.activeMembers("Active"), respondJSON);
router.get("/inactive/members", adminController.activeMembers("Inactive"), respondJSON);
router.get("/atps", adminController.getATPs, respondJSON);
router.get("/atps/:atpId/active-trainees", adminController.getATPTraineesByStatus("active"), respondJSON);
router.get("/atps/:atpId/inactive-trainees", adminController.getATPTraineesByStatus("inactive"), respondJSON);
router.get("/atps/:atpId/pending-trainees", adminController.getATPTraineesByStatus("pending"), respondJSON);
router.get("/review/users/:id", adminController.viewMember, respondJSON);
router.post("/certificates/new", adminController.addCertificate, respondJSON);
// router.put("/certificates/edit/:id", adminController.editCertificate, respondJSON);
router.post("/certificates/verify", adminController.verifyCertificate, respondJSON);
router.put("/approve/users/:id", adminController.approveApplication, respondJSON);

export default router;