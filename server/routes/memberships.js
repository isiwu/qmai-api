import express from "express";
import multer from "multer";
import path from "path";
import * as membershipControllers from "../controllers/membershipControllers";
import { respondJSON } from "../controllers/userContollers";

const router = express.Router();

//Multer set up
const storage = multer.diskStorage({
  destination: "public/applications/",
  filename: function (req, file, cb) {
  
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    if (file.fieldname === "cv") {
      req.cv = `${req.protocol}://${req.headers.host}/applications/${req.params.id}-${uniqueSuffix}`;
    } 
    if (file.fieldname === "otherRDoc") {
      req.otherRDoc = `${req.protocol}://${req.headers.host}/applications/${req.params.id}-${uniqueSuffix}`;
    }
    if (file.fieldname === "doc") {
      req.doc = `${req.protocol}://${req.headers.host}/applications/${req.params.id}-${uniqueSuffix}`;
    }

    cb(null, req.params.id + "-" + uniqueSuffix);
  }
});

const upload = multer({storage});

const auditStorage = multer.diskStorage({
  destination: "public/audits/",
  filename: function (req, file, cb) {
  
    const uniqueSuffix = Date.now() + path.extname(file.originalname);

    if (file.fieldname === "doc") {
      req.doc = `${req.protocol}://${req.headers.host}/audits/${req.params.userId}-${uniqueSuffix}`;
    }

    cb(null, req.params.userId + "-" + uniqueSuffix);
  }
});

const auditUpload = multer({storage: auditStorage});

router.get("/:id", membershipControllers.getmembershipInfo, respondJSON);
router.get("/:id/check-membership", membershipControllers.checkMembership, respondJSON);
router.get("/:userId/audit-record", membershipControllers.auditRecord, respondJSON);
router.get("/:userId/view-audit/:id", membershipControllers.viewAudit, respondJSON);
router.post("/:id/apply", upload.fields([{name: "cv"}, {name: "otherRDoc"}]), membershipControllers.apply, respondJSON);
router.post("/:userId/add-audit", auditUpload.single("doc"), membershipControllers.addAudit, respondJSON);
router.put("/:id/complete-application", membershipControllers.completeApplication, respondJSON);

export default router;