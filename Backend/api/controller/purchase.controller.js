import { Budget } from "../modal/budget.schema.js";
import { Purchase } from "../modal/purchase.schema.js";

export const createPurchase = async (req, res, next) => {
    try {
        const { title, amount, budgetId, note, date } = req.body;

        if (!title || !amount || !budgetId) {
            return res.status(400).json({
                message: "Title, amount and budgetId are required"
            });
        }

        if (Number(amount) <= 0 || isNaN(Number(amount))) {
            return res.status(400).json({
                message: "Amount must be a valid positive number"
            });
        }

        console.log("budgetId:", budgetId);
        console.log("UserId:", req.user._id);

        const budget = await Budget.findOne({
            _id: budgetId,
            user: req.user._id,
        });

        console.log("Found budget:", budget);

        if (!budget) {
            return res.status(404).json({
                message: "Budget not found"
            });
        }

        const purchase = await Purchase.create({
            user: req.user._id,
            budget: budget._id,
            category: budget.category,
            title: title.trim(),
            amount: Number(amount),
            note: note ? note.trim() : "",
            date: date ? new Date(date) : new Date(),
            month: budget.month,
            year: budget.year
        });

        return res.status(201).json({
            message: "Purchase recorded successfully",
            purchase
        });

    } catch (err) {
        console.log("Create Purchase Error:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};


export const getPurchases = async (req, res, next) => {
    try {
        const { budgetId } = req.params;

        const purchases = await Purchase.find({
            budget: budgetId,
            user: req.user._id
        }).sort({
            date: -1,
            createdAt: -1
        });

        const totalSpent = purchases.reduce(
            (acc, item) => acc + (Number(item.amount) || 0),
            0
        );

        return res.status(200).json({
            purchases,
            totalSpent,
            count: purchases.length
        });

    } catch (err) {
        console.log("Get Purchase Error:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};

export const updatePurchase = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, amount, note, date } = req.body;

        const purchase = await Purchase.findOne({
            _id: id,
            user: req.user._id
        });

        if (!purchase) {
            return res.status(404).json({
                message: "Purchase not found"
            });
        }

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    message: "Title is required"
                });
            }

            purchase.title = title.trim();
        }

        if (amount !== undefined) {
            if (amount === "" || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
                return res.status(400).json({
                    message: "Amount must be a valid positive number"
                });
            }

            purchase.amount = Number(amount);
        }

        if (note !== undefined) {
            purchase.note = note.trim();
        }

        if (date !== undefined) {
            const updatedDate = new Date(date);

            if (isNaN(updatedDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid purchase date"
                });
            }

            purchase.date = updatedDate;
        }

        await purchase.save();

        return res.status(200).json({
            message: "Purchase updated successfully",
            purchase
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};


export const deletePurchase = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleted = await Purchase.findOneAndDelete({
            _id: id,
            user: req.user._id
        });

        if (!deleted) {
            return res.status(404).json({
                message: "Purchase not found"
            });
        }

        return res.status(200).json({
            message: "Purchase deleted successfully"
        });

    } catch (err) {
        console.log("Delete Purchase Error:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};

