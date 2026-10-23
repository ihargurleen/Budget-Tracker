import express from "express";
import { createBudget, deleteBudget, getBudgetById, updateBudget } from "../controller/budget.controller.js";
import { protect } from "../util/protect.js";
import {getBudget} from "../controller/budget.controller.js";


const router = express.Router();

router.post("/create",protect, createBudget);
router.get("/get",protect, getBudget);
router.get("/get/:id", protect, getBudgetById);
router.put("/update/:id", protect, updateBudget);
router.delete("/delete/:id",protect, deleteBudget);
export default router;
