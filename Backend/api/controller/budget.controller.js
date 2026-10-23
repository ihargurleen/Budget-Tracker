import mongoose from "mongoose";
import { Budget } from "../modal/budget.schema.js";


export const createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || amount === undefined || !month || !year) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!mongoose.isValidObjectId(category)) {
      return res.status(400).json({
        message: "Invalid category ID. Please select a valid category.",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    const categoryExists = await mongoose.model("Category").findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found. Please create or select a category.",
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
    return res.status(500).json({
      message: err.message,
    });
  }
};


export const getBudget = async (req, res, next) => {
  try {
    const budgetData = await Budget.find({user: req.user._id }).populate([
      {
      path:"user",
      select:"-password",
    },
    {
      path:"category",
    },
  ]);
    if (budgetData.length === 0) {
      return res.status(404).json({
        message: "No budget found for this user"
      
      });
    }
    return res.status(200).json({
      message: "Budget get successfully",
      data: budgetData
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
}

export const getBudgetById = async (req, res, next) =>{
  try{
        const {id} = req.params;
        const budget = await Budget.findOne({_id: id, user: req.user._id}).populate([
          {
            path: "user",
            select: "-password",
          },
          {
            path: "category",
          },
        ]);

        if(!budget){
          return res.status(403).json({
            message: "Budget not found"
        });
      }
          return res.status(200).json({
          budget,
          });
  }catch(err){
    return res.status(500).json({
      message: err.message
    });
  }
}

export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, month, year } = req.body;

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

    const updatedCategory = category ?? budget.category;
    const updatedMonth = month ?? budget.month;
    const updatedYear = year ?? budget.year;

    const existingBudget = await Budget.findOne({
      _id: { $ne: id },
      user: req.user._id,
      category: updatedCategory,
      month: updatedMonth,
      year: updatedYear,
    });

    if (existingBudget) {
      return res.status(400).json({
        message: "Budget already exists for this category and month",
      });
    }

    if (amount !== undefined) {
      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
          message: "Amount must be greater than zero",
        });
      }
      budget.amount = Number(amount);
    }

    if (category !== undefined) budget.category = category;
    if (month !== undefined) budget.month = month;
    if (year !== undefined) budget.year = year;

    await budget.save();

    return res.status(200).json({
      message: "Budget updated successfully",
      data: budget,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

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
    return res.status(500).json({
      message: err.message,
    });
  }
};
