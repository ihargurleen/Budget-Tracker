
import mongoose from "mongoose";
import { Budget } from "../modal/budget.schema.js";
import { Purchase } from "../modal/purchase.schema.js";

export const createPurchase = async (req, res) => {
  try {
    const { title, amount, budgetId, note, date } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !budgetId ||
      typeof note !== "string" ||
      !note.trim()
    ) {
      return res.status(400).json({
        message: "Title, amount, budgetId and note are required",
      });
    }

    if (!mongoose.isValidObjectId(budgetId)) {
      return res.status(400).json({
        message: "Invalid budget ID",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be a valid positive number",
      });
    }

    let purchaseDate = new Date();

    if (date !== undefined) {
      purchaseDate = new Date(date);

      if (Number.isNaN(purchaseDate.getTime())) {
        return res.status(400).json({
          message: "Invalid purchase date",
        });
      }
    }

    const budget = await Budget.findOne({
      _id: budgetId,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    const categoryExists = await mongoose.model("Category").findOne({
      _id: budget.category,
      user: req.user._id,
    });

    if (!categoryExists) {
      return res.status(400).json({
        message: "Budget category is invalid or inaccessible",
      });
    }

    const purchase = await Purchase.create({
      user: req.user._id,
      budget: budget._id,
      category: budget.category,
      title: title.trim(),
      amount: Number(amount),
      note: note.trim(),
      date: purchaseDate,
      month: budget.month,
      year: budget.year,
    });

    return res.status(201).json({
      message: "Purchase recorded successfully",
      purchase,
    });
  } catch (err) {
    console.error("Create purchase error:", err.message);

    return res.status(500).json({
      message: "Unable to create purchase",
    });
  }
};

export const getPurchases = async (req, res) => {
  try {
    const { budgetId } = req.params;

    if (!mongoose.isValidObjectId(budgetId)) {
      return res.status(400).json({
        message: "Invalid budget ID",
      });
    }

    const budget = await Budget.findOne({
      _id: budgetId,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    const purchases = await Purchase.find({
      budget: budget._id,
      user: req.user._id,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    const totalSpent = purchases.reduce(
      (total, item) => total + item.amount,
      0
    );

    return res.status(200).json({
      purchases,
      totalSpent,
      count: purchases.length,
    });
  } catch (err) {
    console.error("Get purchases error:", err.message);

    return res.status(500).json({
      message: "Unable to fetch purchases",
    });
  }
};

export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, note, date } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid purchase ID",
      });
    }

    if (
      title === undefined &&
      amount === undefined &&
      note === undefined &&
      date === undefined
    ) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    const purchase = await Purchase.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Title must be a non-empty string",
        });
      }

      purchase.title = title.trim();
    }

    if (amount !== undefined) {
      if (
        amount === null ||
        amount === "" ||
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
      ) {
        return res.status(400).json({
          message: "Amount must be a valid positive number",
        });
      }

      purchase.amount = Number(amount);
    }

    if (note !== undefined) {
      if (typeof note !== "string" || !note.trim()) {
        return res.status(400).json({
          message: "Note must be a non-empty string",
        });
      }

      purchase.note = note.trim();
    }

    if (date !== undefined) {
      const updatedDate = new Date(date);

      if (Number.isNaN(updatedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid purchase date",
        });
      }

      purchase.date = updatedDate;
    }

    await purchase.save();

    return res.status(200).json({
      message: "Purchase updated successfully",
      purchase,
    });
  } catch (err) {
    console.error("Update purchase error:", err.message);

    return res.status(500).json({
      message: "Unable to update purchase",
    });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid purchase ID",
      });
    }

    const deleted = await Purchase.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    return res.status(200).json({
      message: "Purchase deleted successfully",
    });
  } catch (err) {
    console.error("Delete purchase error:", err.message);

    return res.status(500).json({
      message: "Unable to delete purchase",
    });
  }
};
