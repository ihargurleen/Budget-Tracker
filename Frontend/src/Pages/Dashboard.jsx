
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import apiClient from "../ApiClient/interceptor";

const COLORS = [
  "#16a34a",
  "#15803d",
  "#22c55e",
  "#86efac",
  "#166534",
  "#4ade80",
];

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const getCategoryName = (category) => {
  if (category && typeof category === "object") {
    return category.category || category.name || "Other";
  }

  if (typeof category === "string") {
    const value = category.trim();

    if (/^[a-f\d]{24}$/i.test(value)) {
      return "Other";
    }

    return value || "Other";
  }

  return "Other";
};

const getPurchaseBudgetId = (purchase) =>
  typeof purchase.budget === "object"
    ? purchase.budget?._id
    : purchase.budget;

const getPurchaseCategoryName = (purchase, budgets) => {
  const directCategory = getCategoryName(purchase.category);

  if (directCategory !== "Other") {
    return directCategory;
  }

  const budgetId = getPurchaseBudgetId(purchase);

  const relatedBudget = budgets.find(
    (budget) => String(budget._id) === String(budgetId)
  );

  return getCategoryName(relatedBudget?.category);
};

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editBudgetForm, setEditBudgetForm] = useState({
    amount: "",
    month: "",
    year: "",
  });
  const [budgetActionError, setBudgetActionError] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);
  const [deletingBudgetId, setDeletingBudgetId] = useState(null);

  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [editPurchaseForm, setEditPurchaseForm] = useState({
    title: "",
    amount: "",
    note: "",
    date: "",
  });
  const [purchaseActionError, setPurchaseActionError] = useState("");
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [deletingPurchaseId, setDeletingPurchaseId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/budget/get");

      const budgetData = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      const purchaseResponses = await Promise.all(
        budgetData.map(async (budget) => {
          try {
            return await apiClient.get(`/purchase/get/${budget._id}`);
          } catch (err) {
            if (err.response?.status === 404) {
              return { data: { purchases: [] } };
            }
            throw err;
          }
        })
      );

      const allPurchases = purchaseResponses.flatMap((item) =>
        Array.isArray(item.data.purchases)
          ? item.data.purchases
          : []
      );

      allPurchases.sort(
        (a, b) =>
          new Date(b.date || b.createdAt) -
          new Date(a.date || a.createdAt)
      );

      setBudgets(budgetData);
      setPurchases(allPurchases);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const startEditBudget = (budget) => {
    setEditingBudgetId(budget._id);
    setEditBudgetForm({
      amount: budget.amount ?? "",
      month: budget.month ?? "",
      year: budget.year ?? "",
    });
    setBudgetActionError("");
  };

  const handleUpdateBudget = async (event) => {
    event.preventDefault();

    const amount = Number(editBudgetForm.amount);
    const month = Number(editBudgetForm.month);
    const year = Number(editBudgetForm.year);

    if (!Number.isFinite(amount) || amount <= 0) {
      setBudgetActionError("Amount must be greater than zero.");
      return;
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      setBudgetActionError("Enter a valid month from 1 to 12.");
      return;
    }

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      setBudgetActionError("Enter a valid year.");
      return;
    }

    try {
      setSavingBudget(true);
      setBudgetActionError("");

      await apiClient.put(`/budget/update/${editingBudgetId}`, {
        amount,
        month,
        year,
      });

      setEditingBudgetId(null);
      await fetchDashboardData();
    } catch (err) {
      setBudgetActionError(
        err.response?.data?.message || "Unable to update budget."
      );
    } finally {
      setSavingBudget(false);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    try {
      setDeletingBudgetId(budgetId);
      setBudgetActionError("");

      await apiClient.delete(`/budget/delete/${budgetId}`);

      if (editingBudgetId === budgetId) {
        setEditingBudgetId(null);
      }

      await fetchDashboardData();
    } catch (err) {
      setBudgetActionError(
        err.response?.data?.message || "Unable to delete budget."
      );
    } finally {
      setDeletingBudgetId(null);
    }
  };

  const startEditPurchase = (purchase) => {
    setEditingPurchaseId(purchase._id);

    setEditPurchaseForm({
      title: purchase.title || "",
      amount: purchase.amount ?? "",
      note: purchase.note || "",
      date: purchase.date
        ? new Date(purchase.date).toISOString().slice(0, 10)
        : purchase.createdAt
          ? new Date(purchase.createdAt).toISOString().slice(0, 10)
          : "",
    });

    setPurchaseActionError("");
    setBudgetActionError("");
  };

  const handleUpdatePurchase = async (event) => {
    event.preventDefault();

    const title = editPurchaseForm.title.trim();
    const amount = Number(editPurchaseForm.amount);

    if (!title) {
      setPurchaseActionError("Purchase title is required.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setPurchaseActionError("Amount must be greater than zero.");
      return;
    }

    if (!editPurchaseForm.date) {
      setPurchaseActionError("Please select a purchase date.");
      return;
    }

    try {
      setSavingPurchase(true);
      setPurchaseActionError("");

      await apiClient.put(`/purchase/update/${editingPurchaseId}`, {
        title,
        amount,
        note: editPurchaseForm.note,
        date: editPurchaseForm.date,
      });

      setEditingPurchaseId(null);
      await fetchDashboardData();
    } catch (err) {
      console.error(
        "Purchase update error:",
        err.response?.data || err
      );

      setPurchaseActionError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update purchase."
      );
    } finally {
      setSavingPurchase(false);
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this purchase?"
    );

    if (!confirmed) return;

    try {
      setDeletingPurchaseId(purchaseId);
      setPurchaseActionError("");

      await apiClient.delete(`/purchase/delete/${purchaseId}`);

      if (editingPurchaseId === purchaseId) {
        setEditingPurchaseId(null);
      }

      await fetchDashboardData();
    } catch (err) {
      setPurchaseActionError(
        err.response?.data?.message || "Unable to delete purchase."
      );
    } finally {
      setDeletingPurchaseId(null);
    }
  };

  const totalBudget = budgets.reduce(
    (total, budget) => total + Number(budget.amount || 0),
    0
  );

  const totalSpent = purchases.reduce(
    (total, purchase) => total + Number(purchase.amount || 0),
    0
  );

  const remaining = totalBudget - totalSpent;
  const activeBudgets = budgets.length;

  const spentPercentage =
    totalBudget > 0
      ? Math.round((totalSpent / totalBudget) * 100)
      : 0;

  const monthlySpending = (() => {
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - 5 + index,
        1
      );

      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleString("en-IN", { month: "short" }),
        spent: 0,
      };
    });

    purchases.forEach((purchase) => {
      const purchaseDate = new Date(
        purchase.date || purchase.createdAt
      );

      if (Number.isNaN(purchaseDate.getTime())) return;

      const key = `${purchaseDate.getFullYear()}-${purchaseDate.getMonth()}`;
      const month = months.find((item) => item.key === key);

      if (month) {
        month.spent += Number(purchase.amount || 0);
      }
    });

    return months;
  })();

  const categorySpending = (() => {
    const categoryTotals = {};

    purchases.forEach((purchase) => {
      const categoryName = getPurchaseCategoryName(
        purchase,
        budgets
      );

      categoryTotals[categoryName] =
        (categoryTotals[categoryName] || 0) +
        Number(purchase.amount || 0);
    });

    return Object.entries(categoryTotals).map(
      ([category, spent]) => ({ category, spent })
    );
  })();

  const budgetAlerts = budgets
    .map((budget) => {
      const spent = purchases.reduce(
        (total, purchase) =>
          String(getPurchaseBudgetId(purchase)) === String(budget._id)
            ? total + Number(purchase.amount || 0)
            : total,
        0
      );

      const amount = Number(budget.amount || 0);
      const percentage = amount > 0 ? (spent / amount) * 100 : 0;

      const name =
        getCategoryName(budget.category) === "Other"
          ? budget.name || "Budget"
          : getCategoryName(budget.category);

      if (percentage > 100) {
        return {
          id: budget._id,
          name,
          message: `Budget exceeded by ${money(spent - amount)}`,
          type: "danger",
        };
      }

      if (percentage >= 80) {
        return {
          id: budget._id,
          name,
          message: `${Math.round(percentage)}% of your budget has been used.`,
          type: "warning",
        };
      }

      return null;
    })
    .filter(Boolean);

  const categories = [
    ...new Set(
      purchases.map((purchase) =>
        getPurchaseCategoryName(purchase, budgets)
      )
    ),
  ];

  const filteredPurchases = purchases
    .filter((purchase) => {
      const title = String(purchase.title || "Purchase").toLowerCase();

      const matchesSearch = title.includes(
        searchTerm.trim().toLowerCase()
      );

      const categoryName = getPurchaseCategoryName(
        purchase,
        budgets
      );

      const matchesCategory =
        selectedCategory === "all" ||
        categoryName === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.date || b.createdAt) -
          new Date(a.date || a.createdAt)
        );
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.date || a.createdAt) -
          new Date(b.date || b.createdAt)
        );
      }

      if (sortBy === "highest") {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }

      if (sortBy === "lowest") {
        return Number(a.amount || 0) - Number(b.amount || 0);
      }

      return 0;
    });

  const budgetComparison = budgets.map((budget) => {
    const budgetSpent = purchases.reduce(
      (total, purchase) =>
        String(getPurchaseBudgetId(purchase)) === String(budget._id)
          ? total + Number(purchase.amount || 0)
          : total,
      0
    );

    return {
      name:
        getCategoryName(budget.category) === "Other"
          ? budget.name || "Budget"
          : getCategoryName(budget.category),
      budget: Number(budget.amount || 0),
      spent: budgetSpent,
    };
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Loading your financial overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Track your budgets and understand your spending.</p>
        </div>

        <Link to="/create-budget" className="create-budget-btn">
          + Create Budget
        </Link>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          {error}
          <button type="button" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      )}

      <div className="dashboard-summary">
        <div className="summary-card">
          <p>Total Budget</p>
          <h2>{money(totalBudget)}</h2>
          <span>Your planned spending limit</span>
        </div>

        <div className="summary-card">
          <p>Total Spent</p>
          <h2>{money(totalSpent)}</h2>
          <span>Across all budgets</span>
        </div>

        <div className="summary-card">
          <p>Remaining Balance</p>
          <h2>{money(remaining)}</h2>
          <span>
            {remaining < 0 ? "Over budget" : "Available balance"}
          </span>
        </div>

        <div className="summary-card">
          <p>Total Budgets</p>
          <h2>{activeBudgets}</h2>
          <span>Budgets created</span>
        </div>
      </div>

      {budgetAlerts.length > 0 && (
        <section className="budget-alerts">
          <div className="budget-alerts-heading">
            <div>
              <h2>Budget Alerts</h2>
              <p>Keep an eye on your spending limits.</p>
            </div>
            <span className="budget-alert-count">
              {budgetAlerts.length}
            </span>
          </div>

          <div className="budget-alert-list">
            {budgetAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`budget-alert ${alert.type}`}
              >
                <div className="budget-alert-icon">
                  {alert.type === "danger" ? "!" : "⚠"}
                </div>
                <div className="budget-alert-content">
                  <strong>{alert.name}</strong>
                  <p>{alert.message}</p>
                </div>
                <span className="budget-alert-status">
                  {alert.type === "danger" ? "Exceeded" : "Warning"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="spending-overview">
        <div className="spending-overview-header">
          <div>
            <h2>Spending Overview</h2>
            <p>Your spending against your planned budget</p>
          </div>
          <strong>{spentPercentage}% used</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(spentPercentage, 100)}%`,
              background:
                spentPercentage > 100 ? "#dc2626" : "#16a34a",
            }}
          />
        </div>

        <div className="progress-labels">
          <span>Spent: {money(totalSpent)}</span>
          <span>Budget: {money(totalBudget)}</span>
        </div>
      </div>

      <div className="dashboard-charts">
        <section className="dashboard-chart-card">
          <div className="chart-heading">
            <h2>Monthly Spending</h2>
            <p>Your spending over the last 6 months</p>
          </div>

          <div
            className="chart-container"
            style={{ width: "100%", height: 300, minWidth: 0 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlySpending}
                margin={{ top: 10, right: 15, left: 5, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                  width={65}
                />
                <Tooltip formatter={(value) => money(value)} />
                <Line
                  type="monotone"
                  dataKey="spent"
                  name="Spent"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#16a34a" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-chart-card">
          <div className="chart-heading">
            <h2>Category Spending</h2>
            <p>How your spending is divided by category</p>
          </div>

          {categorySpending.length > 0 ? (
            <div
              className="chart-container"
              style={{ width: "100%", height: 300, minWidth: 0 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    dataKey="spent"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ category, percent }) =>
                      `${category} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categorySpending.map((item, index) => (
                      <Cell
                        key={item.category}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => money(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">
              <p>No spending data available for categories yet.</p>
            </div>
          )}
        </section>

        <section className="dashboard-chart-card chart-card-wide">
          <div className="chart-heading">
            <h2>Budget vs Actual Spending</h2>
            <p>Compare your planned budget with your actual expenses</p>
          </div>

          {budgetComparison.length > 0 ? (
            <div
              className="chart-container"
              style={{ width: "100%", height: 320, minWidth: 0 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetComparison}
                  margin={{ top: 10, right: 15, left: 5, bottom: 35 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                    width={65}
                  />
                  <Tooltip formatter={(value) => money(value)} />
                  <Legend />
                  <Bar
                    dataKey="budget"
                    name="Budget"
                    fill="#15803d"
                    radius={[5, 5, 0, 0]}
                  />
                  <Bar
                    dataKey="spent"
                    name="Spent"
                    fill="#22a06b"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">
              <p>Create a budget to compare planned and actual spending.</p>
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Your Budgets</h2>
          <Link to="/create-budget">+ Add Budget</Link>
        </div>

        {budgetActionError && (
          <div className="dashboard-error" role="alert">
            {budgetActionError}
          </div>
        )}

        {budgets.length === 0 ? (
          <div className="dashboard-empty">
            <p>You have not created any budgets yet.</p>
            <Link to="/create-budget" className="create-budget-btn">
              Create Your First Budget
            </Link>
          </div>
        ) : (
          <div className="budget-grid">
            {budgets.map((budget) => {
              const spent = purchases.reduce(
                (total, purchase) =>
                  String(getPurchaseBudgetId(purchase)) ===
                  String(budget._id)
                    ? total + Number(purchase.amount || 0)
                    : total,
                0
              );

              const amount = Number(budget.amount || 0);
              const percentage =
                amount > 0 ? Math.round((spent / amount) * 100) : 0;

              const budgetName =
                getCategoryName(budget.category) === "Other"
                  ? budget.name || "Budget"
                  : getCategoryName(budget.category);

              return (
                <div className="budget-card" key={budget._id}>
                  <div className="budget-card-header">
                    <h3>{budgetName}</h3>
                    <span>{Math.min(percentage, 100)}% used</span>
                  </div>

                  <div className="budget-amounts">
                    <strong>{money(spent)}</strong>
                    <span>of {money(amount)}</span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        background:
                          percentage > 100 ? "#dc2626" : "#16a34a",
                      }}
                    />
                  </div>

                  <p className="budget-remaining">
                    {spent > amount
                      ? `${money(spent - amount)} over budget`
                      : `${money(amount - spent)} remaining`}
                  </p>

                  <div className="budget-actions">
                    <button
                      type="button"
                      onClick={() => startEditBudget(budget)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingBudgetId === budget._id}
                      onClick={() => handleDeleteBudget(budget._id)}
                    >
                      {deletingBudgetId === budget._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>

                  {editingBudgetId === budget._id && (
                    <form
                      className="budget-edit-form"
                      onSubmit={handleUpdateBudget}
                    >
                      <label>
                        Amount
                        <input
                          type="number"
                          min="1"
                          value={editBudgetForm.amount}
                          onChange={(e) =>
                            setEditBudgetForm({
                              ...editBudgetForm,
                              amount: e.target.value,
                            })
                          }
                          required
                        />
                      </label>

                      <label>
                        Month
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={editBudgetForm.month}
                          onChange={(e) =>
                            setEditBudgetForm({
                              ...editBudgetForm,
                              month: e.target.value,
                            })
                          }
                          required
                        />
                      </label>

                      <label>
                        Year
                        <input
                          type="number"
                          min="2000"
                          max="2100"
                          value={editBudgetForm.year}
                          onChange={(e) =>
                            setEditBudgetForm({
                              ...editBudgetForm,
                              year: e.target.value,
                            })
                          }
                          required
                        />
                      </label>

                      <button type="submit" disabled={savingBudget}>
                        {savingBudget ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingBudgetId(null);
                          setBudgetActionError("");
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Recent Purchases</h2>
          <span>{purchases.length} total</span>
        </div>

        {purchaseActionError && (
          <div className="dashboard-error" role="alert">
            {purchaseActionError}
          </div>
        )}

        <div className="purchase-controls">
          <input
            type="text"
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        {purchases.length === 0 ? (
          <div className="dashboard-empty">
            <p>No purchases found. Add a purchase to see it here.</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="dashboard-empty">
            <p>No purchases match your search or selected category.</p>
          </div>
        ) : (
          <div className="purchase-list">
            {filteredPurchases.map((purchase) => {
              const categoryName = getPurchaseCategoryName(
                purchase,
                budgets
              );

              return (
                <div className="purchase-item" key={purchase._id}>
                  <div className="purchase-icon">
                    {String(categoryName).charAt(0).toUpperCase()}
                  </div>

                  <div className="purchase-details">
                    <h3>{purchase.title || "Purchase"}</h3>
                    <p>
                      {categoryName} ·{" "}
                      {new Date(
                        purchase.date || purchase.createdAt
                      ).toLocaleDateString("en-IN")}
                    </p>
                    {purchase.note && <p>{purchase.note}</p>}
                  </div>

                  <strong className="purchase-amount">
                    -{money(purchase.amount)}
                  </strong>

                  <div className="purchase-actions">
                    <button
                      type="button"
                      onClick={() => startEditPurchase(purchase)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingPurchaseId === purchase._id}
                      onClick={() => handleDeletePurchase(purchase._id)}
                    >
                      {deletingPurchaseId === purchase._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>

                  {editingPurchaseId === purchase._id && (
                    <form
                      className="purchase-edit-form"
                      onSubmit={handleUpdatePurchase}
                    >
                      <label>
                        Title
                        <input
                          type="text"
                          value={editPurchaseForm.title}
                          onChange={(e) =>
                            setEditPurchaseForm({
                              ...editPurchaseForm,
                              title: e.target.value,
                            })
                          }
                          maxLength={100}
                          required
                        />
                      </label>

                      <label>
                        Amount (₹)
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={editPurchaseForm.amount}
                          onChange={(e) =>
                            setEditPurchaseForm({
                              ...editPurchaseForm,
                              amount: e.target.value,
                            })
                          }
                          required
                        />
                      </label>

                      <label>
                        Note
                        <textarea
                          value={editPurchaseForm.note}
                          onChange={(e) =>
                            setEditPurchaseForm({
                              ...editPurchaseForm,
                              note: e.target.value,
                            })
                          }
                          rows="3"
                        />
                      </label>

                      <label>
                        Date
                        <input
                          type="date"
                          value={editPurchaseForm.date}
                          onChange={(e) =>
                            setEditPurchaseForm({
                              ...editPurchaseForm,
                              date: e.target.value,
                            })
                          }
                          required
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={savingPurchase}
                      >
                        {savingPurchase ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPurchaseId(null);
                          setPurchaseActionError("");
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
