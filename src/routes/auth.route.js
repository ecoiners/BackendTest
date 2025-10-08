import express from "express";

import {
	register,
	verifyEmail,
	login,
	logout,
	forgotPassword,
	resetPassword,
	checkAuth
} from "../controllers/auth.controllers.js";
import { verifyToken } from "../middleware/verify.token.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;