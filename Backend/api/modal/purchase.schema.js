import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
    {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true
    },
    budget: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Budget",
        required: true
    },
    category:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now,
    },
    note: {
        type: String,
        required: true,
        trim: true
    },
    month: {
        type: Number,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
    },
},
    {
        timestamps: true,

    }

);
export const Purchase = mongoose.model("Purchase", purchaseSchema); 