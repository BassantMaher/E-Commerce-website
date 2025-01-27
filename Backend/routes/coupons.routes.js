import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();


// http://localhost:5000/api/coupons/
router.get('/', protectRoute, getCoupon);

// http://localhost:5000/api/coupons/validate
router.post('/validate', protectRoute, validateCoupon);

export default router;