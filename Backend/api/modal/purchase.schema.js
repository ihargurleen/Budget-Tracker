
import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Purchase amount must be greater than zero"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    note: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

export const Purchase = mongoose.model("Purchase", purchaseSchema);
