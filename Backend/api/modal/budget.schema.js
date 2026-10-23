import mongoose from "mongoose";
const budgetSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
        },
        category:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        amount: {
            type: Number,
            default: 0,
            required: true,
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
        isDone: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

export const Budget = mongoose.model("Budget", budgetSchema);