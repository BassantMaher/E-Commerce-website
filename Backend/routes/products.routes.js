import express from "express";

const router = express.Router();

import { getAllProducts, getFeaturedProducts, createProduct, deleteProduct, getRecommendedProducts, getProductsByCategory, toggleFeaturedProducts } from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

//get all products
//http://localhost:5000/api/products/
router.get("/", protectRoute, adminRoute, getAllProducts);

//http://localhost:5000/api/products/featured
router.get("/featured", getFeaturedProducts);

//http://localhost:5000/api/products/
router.post("/",protectRoute, adminRoute, createProduct);

//http://localhost:5000/api/products/:id
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

//http://localhost:5000/api/products/recommendations
router.get("/recommendations", getRecommendedProducts);

//http://localhost:5000/api/products/category/:category
router.get("/category/:category", getProductsByCategory);

//http://localhost:5000/api/products/:id
router.patch("/:id", protectRoute, adminRoute,toggleFeaturedProducts);// patch to update specific fields, put to update all fields

export default router;