import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../ApiClient/interceptor";

const BudgetDetails = () => {
    const { budgetId } = useParams();

    const [budget, setBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [purchases, setPurchases] = useState([]);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [addPurchaseShow, setAddPurchaseShow] = useState(false);

    const [totalSpent, setTotalSpent] = useState(0);

    const [purchaseData, setPurchaseData] = useState({
        title: "",
        amount: "",
        note: "",
    });

    const [purchaseError, setPurchaseError] = useState("");
    const [purchaseSuccess, setPurchaseSuccess] = useState("");
    const [purchaseSubmitting, setPurchaseSubmitting] = useState(false);

    const getBudgetDetails = async () => {
        try {
            setLoading(true);
            setError("");

            console.log("BUDGET ID:", budgetId);

            const response = await apiClient.get(
                `/budget/get/${budgetId}`
            );

            console.log("BUDGET RESPONSE:", response.data);

            setBudget(response.data.budget);

        } catch (err) {
            console.log("BUDGET ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load budget details"
            );
        } finally {
            setLoading(false);
        }
    };

    const getPurchase = async () => {
        try {
            setPurchaseLoading(true);

            console.log("GETTING PURCHASES FOR:", budgetId);

            const response = await apiClient.get(
                `/purchase/get/${budgetId}`
            );

            console.log("PURCHASE GET RESPONSE:", response.data);

            setPurchases(response.data.purchases || []);
            setTotalSpent(response.data.totalSpent || 0);

        } catch (err) {
            console.log("GET PURCHASE ERROR:", err);

            setPurchaseError(
                err.response?.data?.message ||
                "Failed to load purchase data"
            );
        } finally {
            setPurchaseLoading(false);
        }
    };

    useEffect(() => {
        if (budgetId) {
            getBudgetDetails();
            getPurchase();
        }
    }, [budgetId]);

    const handlePurchaseChange = (e) => {
        const { name, value } = e.target;

        setPurchaseData({
            ...purchaseData,
            [name]: value
        });

        setPurchaseError("");
        setPurchaseSuccess("");
    };

    const handlePurchaseSubmit = async (e) => {
        e.preventDefault();

        console.log("SAVE BUTTON CLICKED");
        console.log("PURCHASE DATA:", purchaseData);
        console.log("BUDGET ID:", budgetId);

        setPurchaseError("");
        setPurchaseSuccess("");

        if (!purchaseData.title.trim() || !purchaseData.amount) {
            setPurchaseError("Title and amount are required");
            return;
        }

        try {
            setPurchaseSubmitting(true);

            const response = await apiClient.post(
                "/purchase/create",
                {
                    title: purchaseData.title,
                    amount: Number(purchaseData.amount),
                    note: purchaseData.note,
                    budgetId: budgetId
                }
            );

            console.log("PURCHASE CREATE RESPONSE:", response.data);

            setPurchaseSuccess(
                response.data.message ||
                "Purchase created successfully"
            );

            setPurchaseData({
                title: "",
                amount: "",
                note: "",
            });

            setAddPurchaseShow(false);

            await getPurchase();

        } catch (err) {
            console.log("PURCHASE CREATE ERROR:", err);
            console.log("ERROR RESPONSE:", err.response?.data);

            setPurchaseError(
                err.response?.data?.message ||
                "Failed to create purchase"
            );

        } finally {
            setPurchaseSubmitting(false);
        }
    };

    const deletePurchase = async (id) => {
        try {
            console.log("DELETE PURCHASE ID:", id);

            const response = await apiClient.delete(
                `/purchase/delete/${id}`
            );

            console.log("DELETE RESPONSE:", response.data);

            await getPurchase();

            setPurchaseSuccess(
                response.data.message ||
                "Purchase deleted successfully"
            );

        } catch (err) {
            console.log("DELETE ERROR:", err);

            setPurchaseError(
                err.response?.data?.message ||
                "Failed to delete purchase"
            );
        }
    };

    const budgetAmount = Number(budget?.amount || 0);

    const progress =
        budgetAmount > 0
            ? Math.min(
                (totalSpent / budgetAmount) * 100,
                100
            )
            : 0;

    const remaining = budgetAmount - totalSpent;

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div className="budget-container">

            <h2>Budget Data</h2>

            {error && (
                <p>{error}</p>
            )}

            {budget ? (
                <div className="budget-details-card">

                    <p>
                        Category:{" "}
                        {budget?.category?.category}
                    </p>

                    <p>
                        Amount: ₹{budget.amount}
                    </p>

                    <p>
                        Spent: ₹{totalSpent}
                    </p>

                    <p>
                        Remaining: ₹{remaining}
                    </p>

                    <p>
                        Month: {budget.month}
                    </p>

                    <p>
                        Year: {budget.year}
                    </p>

                    <p>
                        Created By:{" "}
                        {budget?.user?.email}
                    </p>

                    <p>
                        Budget Used:{" "}
                        {Math.round(progress)}%
                    </p>

                </div>
            ) : (
                <p>
                    Budget not found
                </p>
            )}

            <button
                onClick={() =>
                    setAddPurchaseShow(!addPurchaseShow)
                }
            >
                {addPurchaseShow
                    ? "Cancel"
                    : "Add Purchase"}
            </button>

            {purchaseSuccess && (
                <p>
                    {purchaseSuccess}
                </p>
            )}

            {purchaseError && (
                <p>
                    {purchaseError}
                </p>
            )}

            {addPurchaseShow && (
                <div>

                    <h3>Add Purchase</h3>

                    <form onSubmit={handlePurchaseSubmit}>

                        <div>
                            <label>
                                Purchase Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                placeholder="Enter Purchase title"
                                value={purchaseData.title}
                                onChange={handlePurchaseChange}
                            />
                        </div>

                        <div>
                            <label>
                                Amount
                            </label>

                            <input
                                type="number"
                                name="amount"
                                placeholder="Enter Purchase amount"
                                value={purchaseData.amount}
                                onChange={handlePurchaseChange}
                            />
                        </div>

                        <div>
                            <label>
                                Note
                            </label>

                            <input
                                type="text"
                                name="note"
                                placeholder="Enter note"
                                value={purchaseData.note}
                                onChange={handlePurchaseChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={purchaseSubmitting}
                        >
                            {purchaseSubmitting
                                ? "Saving..."
                                : "Save Purchase"}
                        </button>

                    </form>

                </div>
            )}

            <h3>Purchase History</h3>

            {purchaseLoading ? (
                <p>
                    Loading purchases...
                </p>
            ) : purchases.length === 0 ? (
                <p>
                    No purchases found.
                </p>
            ) : (
                <div>

                    {purchases.map((purchase) => (
                        <div key={purchase._id}>

                            <h4>
                                {purchase.title}
                            </h4>

                            <p>
                                Amount: ₹
                                {purchase.amount}
                            </p>

                            <p>
                                Note:{" "}
                                {purchase.note ||
                                    "No note"}
                            </p>

                            <p>
                                Date:{" "}
                                {new Date(
                                    purchase.date
                                ).toLocaleDateString()}
                            </p>

                            <button
                                onClick={() =>
                                    deletePurchase(
                                        purchase._id
                                    )
                                }
                            >
                                Delete Purchase
                            </button>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};

export default BudgetDetails;