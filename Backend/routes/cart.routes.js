import express from "express";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

// http://localhost:5000/api/cart/
router.post('/', protectRoute ,addToCart);

// http://localhost:5000/api/cart/
router.delete('/', protectRoute ,removeAllFromCart);

// http://localhost:5000/api/cart/:id
router.put('/:id', protectRoute ,updateQuantity);

// http://localhost:5000/api/cart/
router.get('/', protectRoute ,getCartProducts);

export default router;