import express from "express";
import multer from "multer";
import path from "path";
import * as userControllers from "../controllers/userContollers";
const router = express.Router();

//Multer set up
const storage = multer.diskStorage({
  destination: "public/avatars/",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    req.avatar = `${req.protocol}://${req.headers.host}/avatars/${req.params.id}-${uniqueSuffix}`;
    cb(null, req.params.id + "-" + uniqueSuffix);
  }
});

const upload = multer({storage});

/* GET users listing. */
router.get("/", userControllers.users, userControllers.respondJSON);
router.post("/email-exists", userControllers.checkEmail, userControllers.respondJSON);
router.post("/signup", userControllers.signup, userControllers.respondJSON);
router.put("/verify-email", userControllers.verifyEmail, userControllers.respondJSON);
router.post("/signin", userControllers.login, userControllers.respondJSON);
router.get("/:id", userControllers.getUser, userControllers.respondJSON);
router.put("/:id/update-profile", upload.single("avatar"), userControllers.updateProfile, userControllers.respondJSON);

export default router;
