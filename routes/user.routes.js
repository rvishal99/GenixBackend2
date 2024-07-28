import { Router } from "express";
import { changePassword, forgotPassword, register, resetPassword } from "../controllers/user.controller.js";
import { login } from "../controllers/user.controller.js";
import { logout } from "../controllers/user.controller.js";
import { getProfile } from "../controllers/user.controller.js";
// import { isLoggedIn } from "../middlewares/auth.middleware.js";
// import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post('/register', register); // * uploading single file

router.post('/login', login);
router.post('/logout', logout);

router.post('/me/:id',getProfile);

router.post("/reset", forgotPassword)
router.post("/reset/:resetToken", resetPassword)



router.post("/change-password",changePassword)




export default router;
