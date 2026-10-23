import express from "express";
import { createPurchase, deletePurchase, getPurchases, updatePurchase } from "../controller/purchase.controller.js";
import { protect } from "../util/protect.js";


const router = express.Router();

router.post("/create", protect, createPurchase);
router.get("/get/:budgetId", protect, getPurchases);
router.put("/update/:id", protect, updatePurchase);
router.delete("/delete/:id", protect, deletePurchase);

export default router;