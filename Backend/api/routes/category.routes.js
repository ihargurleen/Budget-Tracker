
import express from "express";
import {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controller/category.controller.js";
import { protect } from "../util/protect.js";

const router = express.Router();

router.post("/create", protect, createCategory);
router.get("/get", protect, getCategory);
router.put("/update/:id", protect, updateCategory);
router.delete("/delete/:id", protect, deleteCategory);

export default router;
