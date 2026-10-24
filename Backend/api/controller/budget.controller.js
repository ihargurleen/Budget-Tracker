
import mongoose from "mongoose";
import { Budget } from "../modal/budget.schema.js";
import { Category } from "../modal/category.schema.js";

const isValidMonth = (month) => {
  const value = Number(month);
  return Number.isInteger(value) && value >= 1 && value <= 12;
};

const isValidYear = (year) => {
  const value = Number(year);
  return Number.isInteger(value) && value >= 2000 && value <= 2100;
};

const isValidAmount = (amount) => {
  return (
    amount !== null &&
    amount !== "" &&
    Number.isFinite(Number(amount)) &&
    Number(amount) > 0
  );
};

export const createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    if (
      category === undefined ||
      amount === undefined ||
      month === undefined ||
      year === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!mongoose.isValidObjectId(category)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    if (!isValidMonth(month)) {
      return res.status(400).json({
        message: "Month must be between 1 and 12",
      });
    }

    if (!isValidYear(year)) {
      return res.status(400).json({
        message: "Please enter a valid year",
      });
    }

    const categoryExists = await Category.findOne({
      _id: category,
      user: req.user._id,
    });

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found or you do not have access to it",
      });
    }

    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category,
      month: Number(month),
      year: Number(year),
    });

    if (existingBudget) {
      return res.status(400).json({
        message: "Budget already exists for this category and month",
      });
    }

    const budgetData = await Budget.create({
      user: req.user._id,
      category,
      amount: Number(amount),
      month: Number(month),
      year: Number(year),
    });

    return res.status(201).json({
      message: "Budget created successfully",
      data: budgetData,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Budget already exists for this category and month",
      });
    }

    console.error("Create budget error:", err.message);

    return res.status(500).json({
      message: "Unable to create budget",
    });
  }
};

export const getBudget = async (req, res) => {
  try {
    const budgetData = await Budget.find({
      user: req.user._id,
    }).populate([
      {
        path: "user",
        select: "-password",
      },
      {
        path: "category",
      },
    ]);

    return res.status(200).json({
      message: "Budgets fetched successfully",
      data: budgetData,
    });
  } catch (err) {
    console.error("Get budgets error:", err.message);

    return res.status(500).json({
      message: "Unable to fetch budgets",
    });
  }
};

export const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOne({
      _id: id,
      user: req.user._id,
    }).populate([
      {
        path: "user",
        select: "-password",
      },
      {
        path: "category",
      },
    ]);

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    return res.status(200).json({
      budget,
    });
  } catch (err) {
    console.error("Get budget error:", err.message);

    return res.status(500).json({
      message: "Unable to fetch budget",
    });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, month, year } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    if (
      category === undefined &&
      amount === undefined &&
      month === undefined &&
      year === undefined
    ) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    if (category !== undefined) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({
          message: "Invalid category ID",
        });
      }

      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id,
      });

      if (!categoryExists) {
        return res.status(404).json({
          message: "Category not found or you do not have access to it",
        });
      }

      budget.category = category;
    }

    if (amount !== undefined) {
      if (!isValidAmount(amount)) {
        return res.status(400).json({
          message: "Amount must be greater than zero",
        });
      }

      budget.amount = Number(amount);
    }

    if (month !== undefined) {
      if (!isValidMonth(month)) {
        return res.status(400).json({
          message: "Month must be between 1 and 12",
        });
      }

      budget.month = Number(month);
    }

    if (year !== undefined) {
      if (!isValidYear(year)) {
        return res.status(400).json({
          message: "Please enter a valid year",
        });
      }

      budget.year = Number(year);
    }

    const existingBudget = await Budget.findOne({
      _id: { $ne: budget._id },
      user: req.user._id,
      category: budget.category,
      month: budget.month,
      year: budget.year,
    });

    if (existingBudget) {
      return res.status(400).json({
        message: "Budget already exists for this category and month",
      });
    }

    await budget.save();

    return res.status(200).json({
      message: "Budget updated successfully",
      data: budget,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Budget already exists for this category and month",
      });
    }

    console.error("Update budget error:", err.message);

    return res.status(500).json({
      message: "Unable to update budget",
    });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    return res.status(200).json({
      message: "Budget deleted successfully",
    });
  } catch (err) {
    console.error("Delete budget error:", err.message);

    return res.status(500).json({
      message: "Unable to delete budget",
    });
  }
};
