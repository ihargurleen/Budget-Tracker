import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, category: 1 }, { unique: true });

export const Category = mongoose.model("Category", categorySchema);