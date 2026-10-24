
import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than zero"],
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      validate: {
        validator: Number.isInteger,
        message: "Month must be an integer",
      },
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
      validate: {
        validator: Number.isInteger,
        message: "Year must be an integer",
      },
    },
    isDone: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index(
  { user: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);

export const Budget = mongoose.model("Budget", budgetSchema);
