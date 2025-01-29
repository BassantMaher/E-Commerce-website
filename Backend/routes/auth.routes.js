import express from "express";

const router = express.Router();

import { Signup, Login, Logout, refreshToken, getProfile, verifyEmail, forgotPassword, resetPawssord } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

// http://localhost:5000/api/auth/signup
router.post("/signup", Signup);

// http://localhost:5000/api/auth/login
router.post("/login", Login);

// http://localhost:5000/api/auth/logout
router.post("/logout", Logout);

// http://localhost:5000/api/auth/refresh-token
router.post("/refresh-token", refreshToken);

// http://localhost:5000/api/auth/profile
router.get("/profile", protectRoute, getProfile);

// https://localhost:5000/api/auth/verifyEmail
router.post("/verifyEmail", verifyEmail)

// https://localhost:5000/api/auth/password-recovery
router.post("/password-recovery", forgotPassword)

// https://localhost:5000/api/auth/reset-password/:token
router.post("/reset-password/:token", resetPawssord)

export default router;