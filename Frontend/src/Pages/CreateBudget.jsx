
import React, { useEffect, useState } from "react";
import apiClient from "../ApiClient/interceptor";

const CreateBudget = () => {
  const [categories, setCategories] = useState([]);
  const [categoryLoader, setCategoryLoader] = useState(true);
  const [createCategory, setCreateCategory] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [budgetSubmitting, setBudgetSubmitting] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [budgetMessage, setBudgetMessage] = useState("");
  const [budgetError, setBudgetError] = useState("");

  const [createCategoryData, setCreateCategoryData] = useState({
    category: "",
  });

  const [budgetData, setBudgetData] = useState({
    category: "",
    amount: "",
    month: "",
    year: "",
  });

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  const getCategories = async () => {
    try {
      const response = await apiClient.get("/category/get");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Get categories error:", error);
      setCategoryError(
        error.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setCategoryLoader(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleCategoryChange = (e) => {
    setCreateCategoryData({
      ...createCategoryData,
      [e.target.name]: e.target.value,
    });

    setCategoryError("");
    setCategoryMessage("");
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    const categoryName = createCategoryData.category.trim();

    if (!categoryName) {
      setCategoryError("Please enter a category name.");
      setCategoryMessage("");
      return;
    }

    const alreadyExists = categories.some(
      (category) =>
        category.category.toLowerCase() ===
        categoryName.toLowerCase()
    );

    if (alreadyExists) {
      setCategoryError("This category already exists.");
      setCategoryMessage("");
      return;
    }

    try {
      setCategorySubmitting(true);
      setCategoryError("");
      setCategoryMessage("");

      const response = await apiClient.post(
        "/category/create",
        { category: categoryName }
      );

      const createdCategory = response.data.data;

      if (!createdCategory?._id) {
        throw new Error(
          "Category was created, but its ID was not returned."
        );
      }

      await getCategories();

      setBudgetData((prev) => ({
        ...prev,
        category: createdCategory._id,
      }));

      setCreateCategoryData({ category: "" });
      setCreateCategory(false);
      setCategoryMessage("Category created successfully!");
    } catch (error) {
      console.error("Create category error:", error);

      setCategoryError(
        error.response?.data?.message ||
          error.message ||
          "Unable to create category."
      );
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleChange = (e) => {
    setBudgetData({
      ...budgetData,
      [e.target.name]: e.target.value,
    });

    setBudgetError("");
    setBudgetMessage("");
  };

  const submitBudget = async (e) => {
    e.preventDefault();

    if (
      !budgetData.category ||
      !budgetData.amount ||
      !budgetData.month ||
      !budgetData.year
    ) {
      setBudgetError("Please fill in all budget fields.");
      setBudgetMessage("");
      return;
    }

    if (Number(budgetData.amount) <= 0) {
      setBudgetError("Budget amount must be greater than zero.");
      setBudgetMessage("");
      return;
    }

    try {
      setBudgetSubmitting(true);
      setBudgetError("");
      setBudgetMessage("");

      console.log("Selected category ID:", budgetData.category);
      await apiClient.post("/budget/create", {
        category: budgetData.category,
        amount: Number(budgetData.amount),
        month: Number(budgetData.month),
        year: Number(budgetData.year),
      });

      setBudgetData({
        category: "",
        amount: "",
        month: "",
        year: "",
      });

      setBudgetMessage("Budget created successfully!");
    } catch (error) {
      console.error("Create budget error:", error);

      setBudgetError(
        error.response?.data?.message ||
          "Unable to create budget."
      );
    } finally {
      setBudgetSubmitting(false);
    }
  };

  return (
    <main className="create-budget-container">
      <h1>Create Your Budget</h1>
      <p>Manage your monthly budget and spending categories.</p>

      <form onSubmit={submitBudget}>
        <div className="category">
          <label htmlFor="category">Category</label>

          {categoryLoader ? (
            <select id="category" disabled>
              <option>Loading categories...</option>
            </select>
          ) : (
            <select
              id="category"
              name="category"
              value={budgetData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.category}
                </option>
              ))}
            </select>
          )}

          {!categoryLoader && categories.length === 0 && (
            <p>No categories available. Create one below.</p>
          )}

          <div className="createCategory">
            {!createCategory ? (
              <button
                type="button"
                onClick={() => {
                  setCreateCategory(true);
                  setCategoryError("");
                  setCategoryMessage("");
                }}
              >
                + Create Category
              </button>
            ) : (
              <div className="category-create-form">
                <label htmlFor="newCategory">
                  New Category Name
                </label>

                <input
                  id="newCategory"
                  type="text"
                  name="category"
                  placeholder="Enter category name"
                  value={createCategoryData.category}
                  onChange={handleCategoryChange}
                  maxLength={50}
                  required
                />

                <button
                  type="button"
                  onClick={handleCategorySubmit}
                  disabled={categorySubmitting}
                >
                  {categorySubmitting ? "Saving..." : "Save Category"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreateCategory(false);
                    setCreateCategoryData({ category: "" });
                    setCategoryError("");
                    setCategoryMessage("");
                  }}
                  disabled={categorySubmitting}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {categoryMessage && (
            <p role="status" style={{ color: "green" }}>
              {categoryMessage}
            </p>
          )}

          {categoryError && (
            <p role="alert" style={{ color: "red" }}>
              {categoryError}
            </p>
          )}
        </div>

        <div className="amount">
          <label htmlFor="amount">Budget Amount (₹)</label>

          <input
            id="amount"
            type="number"
            name="amount"
            min="1"
            step="0.01"
            placeholder="Enter your budget amount"
            value={budgetData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="month">
          <label htmlFor="month">Month</label>

          <select
            id="month"
            name="month"
            value={budgetData.month}
            onChange={handleChange}
            required
          >
            <option value="">Select Month</option>

            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.name}
              </option>
            ))}
          </select>
        </div>

        <div className="year">
          <label htmlFor="year">Year</label>

          <input
            id="year"
            type="number"
            name="year"
            min="2026"
            max="2100"
            placeholder="Enter year"
            value={budgetData.year}
            onChange={handleChange}
            required
          />
        </div>

        {budgetMessage && (
          <p role="status" style={{ color: "green" }}>
            {budgetMessage}
          </p>
        )}

        {budgetError && (
          <p role="alert" style={{ color: "red" }}>
            {budgetError}
          </p>
        )}

        <button type="submit" disabled={budgetSubmitting}>
          {budgetSubmitting ? "Creating..." : "Create Budget"}
        </button>
      </form>
    </main>
  );
};

export default CreateBudget;
