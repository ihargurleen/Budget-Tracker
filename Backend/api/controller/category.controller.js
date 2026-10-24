
import mongoose from "mongoose";
import { Category } from "../modal/category.schema.js";

export const createCategory = async (req, res) => {
  try {
    const { category } = req.body;

    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    const categoryName = category.trim();

    const existingCategory = await Category.findOne({
      user: req.user._id,
      category: {
        $regex: new RegExp(
          "^" + categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
          "i"
        ),
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const data = await Category.create({
      category: categoryName,
      user: req.user._id,
    });

    return res.status(201).json({
      message: "Category created successfully",
      data: {
        _id: data._id,
        category: data.category,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    console.error("Create category error:", err.message);

    return res.status(500).json({
      message: "Unable to create category",
    });
  }
};

export const getCategory = async (req, res) => {
  try {
    const data = await Category.find({
      user: req.user._id,
    }).select("_id category createdAt updatedAt");

    return res.status(200).json({
      data,
    });
  } catch (err) {
    console.error("Get category error:", err.message);

    return res.status(500).json({
      message: "Unable to fetch categories",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    const categoryName = category.trim();

    const existingCategory = await Category.findOne({
      user: req.user._id,
      category: {
        $regex: new RegExp(
          "^" + categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
          "i"
        ),
      },
      _id: { $ne: id },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const data = await Category.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
      },
      {
        $set: {
          category: categoryName,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("_id category createdAt updatedAt");

    if (!data) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      data,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    console.error("Update category error:", err.message);

    return res.status(500).json({
      message: "Unable to update category",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const data = await Category.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!data) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error("Delete category error:", err.message);

    return res.status(500).json({
      message: "Unable to delete category",
    });
  }
};
