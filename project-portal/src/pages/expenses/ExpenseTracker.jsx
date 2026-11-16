import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Login from "../auth/Login";
import Register from "../auth/Register";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  X,
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  BarChart3,
  UserRound,
  LogOut,
} from "lucide-react";

import api from "../../services/api";

import ExpenseForm from "../../components/ExpenseForm";
import ExpenseList from "../../components/ExpenseList";
import ExpenseSummary from "../../components/ExpenseSummary";
import ExpenseChart from "../../components/ExpenseChart";
import IncomeList from "../../components/IncomeList";
import IncomeForm from "../../components/IncomeForm";
import BudgetList from "../../components/BudgetList";
import BudgetForm from "../../components/BudgetForm";

import "./ExpenseManagement.css";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const emptyExpense = {
  title: "",
  description: "",
  amount: "",
  category: "",
  expenseDate: "",
  paymentMethod: "",
  notes: "",
};

const emptyIncome = {
  title: "",
  description: "",
  amount: "",
  category: "",
  incomeDate: "",
  paymentMethod: "",
  notes: "",
};

const emptyBudget = {
  category: "",
  monthlyLimit: "",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  notes: "",
};

function ExpenseTracker() {
  const { user, isAuthenticated, logout } = useAuth();
  const [authView, setAuthView] = useState("login");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  // ==========================================
  // MAIN DATA
  // ==========================================

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [financeSummary, setFinanceSummary] = useState({});
  const [expenseSummary, setExpenseSummary] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FILTERS
  // ==========================================

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [expenseSearch, setExpenseSearch] = useState("");
  const [incomeSearch, setIncomeSearch] = useState("");

  // ==========================================
  // FORM STATES
  // ==========================================

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showYearlyReport, setShowYearlyReport] = useState(false);

  const [editingExpense, setEditingExpense] = useState(false);
  const [editingIncome, setEditingIncome] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);

  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [incomeForm, setIncomeForm] = useState(emptyIncome);
  const [budgetForm, setBudgetForm] = useState(emptyBudget);

  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [selectedDetails, setSelectedDetails] = useState(null);
  const [detailsType, setDetailsType] = useState("Expense");

  // ==========================================
  // COMMON HELPERS
  // ==========================================

  const getResponseData = (response) => response.data?.paramObjectsMap || {};

  // Attach the logged-in finance user's JWT to every finance API request.
  // AuthContext must store the token using the same "financeToken" key.
  const getAuthConfig = (config = {}) => {
    const token = sessionStorage.getItem("financeToken");

    return {
      ...config,
      headers: {
        ...config.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  };

  const getErrorMessage = (err) =>
    err.response?.data?.errors?.[0]?.details ||
    err.response?.data?.errors?.[0]?.message ||
    err.response?.data?.message ||
    err.message ||
    "Something went wrong. Please try again.";

  const checkResponse = (response) => {
    if (response.data?.status === false) {
      throw new Error(getErrorMessage({ response }));
    }
  };

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ==========================================
  // FETCH EXPENSES
  // ==========================================

  const fetchExpenses = async () => {
    const response = await api.get("/expense/getAllExpenses", getAuthConfig());
    checkResponse(response);

    setExpenses(getResponseData(response).expenses || []);
  };

  // ==========================================
  // FETCH INCOMES
  // ==========================================

  const fetchIncomes = async () => {
    const response = await api.get("/expense/getAllIncomes", getAuthConfig());
    checkResponse(response);

    setIncomes(getResponseData(response).incomes || []);
  };

  // ==========================================
  // FETCH EXPENSE SUMMARY
  // ==========================================

  const fetchExpenseSummary = async () => {
    const response = await api.get("/expense/getExpenseSummary", getAuthConfig());
    checkResponse(response);

    setExpenseSummary(getResponseData(response));
  };

  // ==========================================
  // FETCH FINANCIAL DASHBOARD
  // ==========================================

  const fetchFinanceSummary = async () => {
    const response = await api.get("/expense/getFinanceSummary", getAuthConfig({
      params: {
        month: selectedMonth,
        year: selectedYear,
      },
    }));

    checkResponse(response);
    setFinanceSummary(getResponseData(response));
  };

  // ==========================================
  // FETCH BUDGETS
  // ==========================================

  const fetchBudgets = async () => {
    const response = await api.get("/expense/getAllBudgets", getAuthConfig({
      params: {
        month: selectedMonth,
        year: selectedYear,
      },
    }));

    checkResponse(response);
    setBudgets(getResponseData(response).budgets || []);
  };

  // ==========================================
  // REFRESH ALL DATA
  // ==========================================

  const fetchAllData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        fetchExpenses(),
        fetchIncomes(),
        fetchExpenseSummary(),
        fetchFinanceSummary(),
        fetchBudgets(),
      ]);
    } catch (err) {
      console.error("Financial data loading error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        setAuthView("login");
        toast.error("Your session has expired. Please log in again.");
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, selectedMonth, selectedYear]);

  // ==========================================
  // COMMON VALIDATION
  // ==========================================

  const validateTransaction = (data, dateField, type) => {
    const errors = {};

    if (!data.title.trim()) {
      errors.title = `${type} title is required.`;
    } else if (data.title.trim().length < 2) {
      errors.title = "Title must contain at least 2 characters.";
    } else if (data.title.trim().length > 100) {
      errors.title = "Title cannot exceed 100 characters.";
    }

    if (!data.amount) {
      errors.amount = "Amount is required.";
    } else if (
      !Number.isFinite(Number(data.amount)) ||
      Number(data.amount) <= 0
    ) {
      errors.amount = "Amount must be greater than zero.";
    }

    if (!data.category.trim()) {
      errors.category = "Category is required.";
    }

    if (!data[dateField]) {
      errors[dateField] = "Date is required.";
    } else if (data[dateField] > today()) {
      errors[dateField] = "Date cannot be in the future.";
    }

    if (!data.paymentMethod.trim()) {
      errors.paymentMethod = "Payment method is required.";
    }

    if ((data.description || "").length > 255) {
      errors.description = "Description cannot exceed 255 characters.";
    }

    if ((data.notes || "").length > 255) {
      errors.notes = "Notes cannot exceed 255 characters.";
    }

    return errors;
  };

  const handleFormChange = (event, setter) => {
    const { name, value } = event.target;

    setter((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ==========================================
  // EXPENSE FORM
  // ==========================================

  const openAddExpense = () => {
    setEditingExpense(false);
    setExpenseForm(emptyExpense);
    setFieldErrors({});
    setShowExpenseForm(true);
  };

  const openEditExpense = (expense) => {
    setEditingExpense(true);

    setExpenseForm({
      ...expense,
      amount: expense.amount ?? "",
    });

    setFieldErrors({});
    setShowExpenseForm(true);
  };

  const handleExpenseSubmit = async (event) => {
    event.preventDefault();

    const errors = validateTransaction(expenseForm, "expenseDate", "Expense");

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setSaving(true);

    try {
      const payload = {
        title: expenseForm.title.trim(),
        description: expenseForm.description.trim(),
        amount: Number(expenseForm.amount),
        category: expenseForm.category.trim(),
        expenseDate: expenseForm.expenseDate,
        paymentMethod: expenseForm.paymentMethod.trim(),
        notes: expenseForm.notes.trim(),
      };

      const response = await api.put(
        "/expense/createUpdateExpense",
        payload,
        getAuthConfig(
          editingExpense ? { params: { id: expenseForm.id } } : {},
        ),
      );

      checkResponse(response);

      toast.success(
        editingExpense
          ? "Expense updated successfully!"
          : "Expense added successfully!",
      );

      setShowExpenseForm(false);
      setExpenseForm(emptyExpense);
      await fetchAllData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const response = await api.delete("/expense/deleteExpense", getAuthConfig({
        params: { id },
      }));

      checkResponse(response);
      toast.success("Expense deleted successfully!");

      await fetchAllData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ==========================================
  // INCOME FORM
  // ==========================================

  const openAddIncome = () => {
    setEditingIncome(false);
    setIncomeForm(emptyIncome);
    setFieldErrors({});
    setShowIncomeForm(true);
  };

  const openEditIncome = (income) => {
    setEditingIncome(true);

    setIncomeForm({
      ...income,
      amount: income.amount ?? "",
    });

    setFieldErrors({});
    setShowIncomeForm(true);
  };

  const handleIncomeSubmit = async (event) => {
    event.preventDefault();

    const errors = validateTransaction(incomeForm, "incomeDate", "Income");

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setSaving(true);

    try {
      const payload = {
        title: incomeForm.title.trim(),
        description: incomeForm.description.trim(),
        amount: Number(incomeForm.amount),
        category: incomeForm.category.trim(),
        incomeDate: incomeForm.incomeDate,
        paymentMethod: incomeForm.paymentMethod.trim(),
        notes: incomeForm.notes.trim(),
      };

      const response = await api.put(
        "/expense/createUpdateIncome",
        payload,
        getAuthConfig(
          editingIncome ? { params: { id: incomeForm.id } } : {},
        ),
      );

      checkResponse(response);

      toast.success(
        editingIncome
          ? "Income updated successfully!"
          : "Income added successfully!",
      );

      setShowIncomeForm(false);
      setIncomeForm(emptyIncome);
      await fetchAllData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income?")) {
      return;
    }

    try {
      const response = await api.delete("/expense/deleteIncome", getAuthConfig({
        params: { id },
      }));

      checkResponse(response);
      toast.success("Income deleted successfully!");

      await fetchAllData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ==========================================
  // BUDGET FORM
  // ==========================================

  const openAddBudget = () => {
    setEditingBudget(false);

    setBudgetForm({
      ...emptyBudget,
      month: selectedMonth,
      year: selectedYear,
    });

    setFieldErrors({});
    setShowBudgetForm(true);
  };

  const openEditBudget = (budget) => {
    setEditingBudget(true);

    setBudgetForm({
      id: budget.id,
      category: budget.category || "",
      monthlyLimit: budget.monthlyLimit ?? "",
      month: budget.month,
      year: budget.year,
      notes: budget.notes || "",
    });

    setFieldErrors({});
    setShowBudgetForm(true);
  };

  const handleBudgetSubmit = async (event) => {
    event.preventDefault();

    const errors = {};

    if (!budgetForm.category.trim()) {
      errors.category = "Budget category is required.";
    }

    if (!budgetForm.monthlyLimit || Number(budgetForm.monthlyLimit) <= 0) {
      errors.monthlyLimit = "Monthly limit must be greater than zero.";
    }

    if (
      !budgetForm.month ||
      Number(budgetForm.month) < 1 ||
      Number(budgetForm.month) > 12
    ) {
      errors.month = "Select a valid month.";
    }

    if (!budgetForm.year || Number(budgetForm.year) < 2000) {
      errors.year = "Enter a valid year.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setSaving(true);

    try {
      const payload = {
        category: budgetForm.category.trim(),
        monthlyLimit: Number(budgetForm.monthlyLimit),
        month: Number(budgetForm.month),
        year: Number(budgetForm.year),
        notes: budgetForm.notes.trim(),
      };

      const response = await api.put(
        "/expense/createUpdateBudget",
        payload,
        getAuthConfig(
          editingBudget ? { params: { id: budgetForm.id } } : {},
        ),
      );

      checkResponse(response);

      toast.success(
        editingBudget
          ? "Budget updated successfully!"
          : "Budget created successfully!",
      );

      setShowBudgetForm(false);
      await fetchAllData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }

    try {
      const response = await api.delete("/expense/deleteBudget", getAuthConfig({
        params: { id },
      }));

      checkResponse(response);
      toast.success("Budget deleted successfully!");

      await fetchAllData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ==========================================
  // VIEW TRANSACTION DETAILS
  // ==========================================

  const handleView = async (id, type) => {
    const isIncome = type === "Income";

    try {
      const response = await api.get(
        isIncome ? "/expense/getByIncomeId" : "/expense/getByExpenseId",
        getAuthConfig({ params: { id } }),
      );

      checkResponse(response);

      const data = getResponseData(response);

      setSelectedDetails(isIncome ? data.incomeVO : data.expenseVO);

      setDetailsType(type);
      setShowDetails(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ==========================================
// FILTER TRANSACTIONS BY SELECTED MONTH/YEAR
// ==========================================

const isInSelectedMonth = (dateValue) => {
  if (!dateValue) return false;

  const [year, month] = dateValue.split("-").map(Number);

  return (
    month === Number(selectedMonth) &&
    year === Number(selectedYear)
  );
};
  // ==========================================
  // SEARCH
  // ==========================================

  const filteredExpenses = expenses.filter((item) => {
  const value = expenseSearch.toLowerCase();

  const matchesSearch =
    (item.title || "").toLowerCase().includes(value) ||
    (item.category || "").toLowerCase().includes(value) ||
    (item.paymentMethod || "").toLowerCase().includes(value);

  const matchesDate = isInSelectedMonth(item.expenseDate);

  return matchesSearch && matchesDate;
});

  const filteredIncomes = incomes.filter((item) => {
  const value = incomeSearch.toLowerCase();

  const matchesSearch =
    (item.title || "").toLowerCase().includes(value) ||
    (item.category || "").toLowerCase().includes(value) ||
    (item.paymentMethod || "").toLowerCase().includes(value);

  const matchesDate = isInSelectedMonth(item.incomeDate);

  return matchesSearch && matchesDate;
});

  // ==========================================
  // DASHBOARD VALUES
  // ==========================================

  const totalIncome = Number(financeSummary.totalIncome || 0);
  const totalExpenses = Number(financeSummary.totalExpenses || 0);
  const balance = Number(financeSummary.availableBalance || 0);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 10 },
    (_, index) => new Date().getFullYear() - 5 + index,
  );

  const yearlyIncome = incomes
    .filter(
      (income) =>
        String(income.incomeDate || "").slice(0, 4) === String(selectedYear),
    )
    .reduce((total, income) => total + (Number(income.amount) || 0), 0);
  const yearlyCategoryTotals = {};
  expenses.forEach((expense) => {
    if (
      String(expense.expenseDate || "").slice(0, 4) !== String(selectedYear)
    ) {
      return;
    }

    const amount = Number(expense.amount) || 0;
    const category = expense.category?.trim() || "Uncategorized";
    yearlyCategoryTotals[category] =
      (yearlyCategoryTotals[category] || 0) + amount;
  });

  const yearlyTotalExpenses = Object.values(yearlyCategoryTotals).reduce(
    (total, amount) => total + amount,
    0,
  );
  const yearlyBalance = yearlyIncome - yearlyTotalExpenses;

  // ==========================================
  // MAIN UI
  // ==========================================

  if (!isAuthenticated) {
    return (
      <div className="finance-auth-container">
        {authView === "login" ? (
          <Login onSwitch={() => setAuthView("register")} />
        ) : (
          <Register onSwitch={() => setAuthView("login")} />
        )}
      </div>
    );
  }

  return (
    <div className="expense-page finance-page">
      {/* PAGE HEADER */}

      <div className="expense-heading">
        <div>
          <h1>Personal Finance Management</h1>
          <p>Manage your income, expenses, savings and monthly budgets.</p>
        </div>

        <div className="finance-header-actions">
          <button className="primary-btn" onClick={openAddIncome}>
            <Plus size={18} />
            Add Income
          </button>

          <button className="primary-btn" onClick={openAddExpense}>
            <Plus size={18} />
            Add Expense
          </button>

          <div className="finance-account-menu">
            <button
              type="button"
              className="finance-account-trigger"
              aria-label="Open account menu"
              aria-expanded={isAccountMenuOpen}
              onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
            >
              <UserRound size={20} />
            </button>

            {isAccountMenuOpen && (
              <div className="finance-account-dropdown">
                <div className="finance-account-details">
                  <strong>{user?.name || "Finance User"}</strong>
                  {user?.email && <span>{user.email}</span>}
                </div>
                <button
                  type="button"
                  className="finance-account-logout"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MONTH / YEAR FILTER */}

      <div className="finance-filter">
        <div>
          <CalendarDays size={19} />
          <strong>Financial Overview</strong>
        </div>

        <div className="finance-filter-controls">
          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(Number(event.target.value))}
          >
            {months.map((month, index) => (
              <option value={index + 1} key={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
          >
            {years.map((year) => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </select>

          <button
            className="refresh-btn"
            onClick={fetchAllData}
            title="Refresh dashboard"
            type="button"
          >
            <RefreshCw size={18} />
          </button>
          <button
            className="yearly-report-btn"
            onClick={() => setShowYearlyReport(true)}
            type="button"
          >
            <BarChart3 size={17} />
            Yearly Report
          </button>
        </div>
      </div>

      {error && <p className="page-error">{error}</p>}

      {/* MONTHLY SUMMARY CARDS */}

      <div className="finance-summary-grid">
        <div className="finance-summary-card income-card">
          <div className="finance-card-icon">
            <TrendingUp size={24} />
          </div>
          <div>
            <p>Total Income</p>
            <h2>{formatAmount(totalIncome)}</h2>
            <small>{financeSummary.incomeRecords || 0} income records</small>
          </div>
        </div>

        <div className="finance-summary-card expense-card">
          <div className="finance-card-icon">
            <TrendingDown size={24} />
          </div>
          <div>
            <p>Total Expenses</p>
            <h2>{formatAmount(totalExpenses)}</h2>
            <small>{financeSummary.expenseRecords || 0} expense records</small>
          </div>
        </div>

        <div className="finance-summary-card balance-card">
          <div className="finance-card-icon">
            <Wallet size={24} />
          </div>
          <div>
            <p>Available Balance</p>
            <h2>{formatAmount(balance)}</h2>
            <small>Income minus expenses</small>
          </div>
        </div>

      </div>

      {/* CHARTS */}

      <div className="finance-chart-grid">
        <ExpenseChart
          categorySummary={financeSummary.expenseCategorySummary || {}}
          title="Expense Breakdown"
          description="See how your money is spent by category."
          emptyMessage="No expenses for this month."
        />

        <ExpenseChart
          categorySummary={financeSummary.incomeCategorySummary || {}}
          title="Income Breakdown"
          description="See where your income comes from."
          emptyMessage="No income for this month."
        />
      </div>

      {/* BUDGET MANAGEMENT */}

      <div className="finance-section-card">
        <div className="finance-section-header">
          <div>
            <h2>Monthly Budget Management</h2>
            <p>Monitor spending against your category budgets.</p>
          </div>

          <button className="primary-btn" onClick={openAddBudget}>
            <Plus size={17} />
            Add Budget
          </button>
        </div>

        <BudgetList
          budgetStatus={financeSummary.budgetStatus || []}
          budgets={budgets}
          loading={loading}
          formatAmount={formatAmount}
          onEdit={openEditBudget}
          onDelete={handleDeleteBudget}
        />
      </div>

      {/* EXPENSE MANAGEMENT */}

      <div className="expense-table-card">
        <div className="table-toolbar">
          <div>
            <h2>Expense History</h2>
            <p>Manage all your expense records.</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search expenses..."
                value={expenseSearch}
                onChange={(event) => setExpenseSearch(event.target.value)}
              />
            </div>

            <button
              className="primary-btn"
              onClick={openAddExpense}
              type="button"
            >
              <Plus size={17} />
              Add Expense
            </button>
          </div>
        </div>

        <ExpenseList
          expenses={filteredExpenses}
          loading={loading}
          onView={(id) => handleView(id, "Expense")}
          onEdit={openEditExpense}
          onDelete={handleDeleteExpense}
        />

              <div className="table-footer">
        Showing {filteredExpenses.length} expenses for{" "}
        {months[selectedMonth - 1]} {selectedYear}
      </div>
      </div>

      {/* INCOME MANAGEMENT */}

      <div className="expense-table-card">
        <div className="table-toolbar">
          <div>
            <h2>Income History</h2>
            <p>Manage salary, freelance and other income.</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search income..."
                value={incomeSearch}
                onChange={(event) => setIncomeSearch(event.target.value)}
              />
            </div>

            <button className="primary-btn" onClick={openAddIncome}>
              <Plus size={17} />
              Add Income
            </button>
          </div>
        </div>

        <IncomeList
          incomes={filteredIncomes}
          loading={loading}
          formatAmount={formatAmount}
          onView={(id) => handleView(id, "Income")}
          onEdit={openEditIncome}
          onDelete={handleDeleteIncome}
        />
        <div className="table-footer">
          Showing {filteredIncomes.length} income records for{" "}
          {months[selectedMonth - 1]} {selectedYear}
        </div>
      </div>

      {/* EXPENSE FORM */}

      {showExpenseForm && (
        <ExpenseForm
          formData={expenseForm}
          editing={editingExpense}
          saving={saving}
          fieldErrors={fieldErrors}
          onChange={(event) => handleFormChange(event, setExpenseForm)}
          onSubmit={handleExpenseSubmit}
          onClose={() => setShowExpenseForm(false)}
        />
      )}

      {/* INCOME FORM */}

      {showIncomeForm && (
        <IncomeForm
          formData={incomeForm}
          editing={editingIncome}
          saving={saving}
          fieldErrors={fieldErrors}
          maxDate={today()}
          onChange={(event) => handleFormChange(event, setIncomeForm)}
          onSubmit={handleIncomeSubmit}
          onClose={() => setShowIncomeForm(false)}
        />
      )}

      {/* BUDGET FORM */}

      {showBudgetForm && (
        <BudgetForm
          formData={budgetForm}
          editing={editingBudget}
          saving={saving}
          fieldErrors={fieldErrors}
          months={months}
          onChange={(event) => handleFormChange(event, setBudgetForm)}
          onSubmit={handleBudgetSubmit}
          onClose={() => setShowBudgetForm(false)}
        />
      )}

      {showYearlyReport && (
        <div
          className="modal-overlay"
          onClick={() => setShowYearlyReport(false)}
        >
          <div
            className="expense-modal yearly-report-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="yearly-report-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 id="yearly-report-title">{selectedYear} Expense Report</h2>
                <p>Monthly spending and the top expense category each month.</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowYearlyReport(false)}
                type="button"
                aria-label="Close yearly report"
              >
                <X />
              </button>
            </div>

            <div className="yearly-report-summary">
              <div className="finance-summary-card income-card">
                <div className="finance-card-icon">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <p>Yearly Income</p>
                  <h2>{formatAmount(yearlyIncome)}</h2>
                </div>
              </div>
              <div className="finance-summary-card expense-card">
                <div className="finance-card-icon">
                  <TrendingDown size={22} />
                </div>
                <div>
                  <p>Yearly Spend</p>
                  <h2>{formatAmount(yearlyTotalExpenses)}</h2>
                </div>
              </div>
              <div className="finance-summary-card balance-card">
                <div className="finance-card-icon">
                  <Wallet size={22} />
                </div>
                <div>
                  <p>Yearly Balance</p>
                  <h2>{formatAmount(yearlyBalance)}</h2>
                </div>
              </div>
            </div>

            <ExpenseChart
              categorySummary={yearlyCategoryTotals}
              title="Yearly Spend by Category"
              description={`Category-wise spending for ${selectedYear}.`}
              emptyMessage={`No expenses recorded for ${selectedYear}.`}
            />
          </div>
        </div>
      )}

      {/* TRANSACTION DETAILS */}

      {showDetails && selectedDetails && (
        <div className="modal-overlay">
          <div className="expense-modal details-modal">
            <div className="modal-header">
              <div>
                <h2>{detailsType} Details</h2>
                <p>Complete {detailsType.toLowerCase()} information.</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowDetails(false)}
                type="button"
              >
                <X />
              </button>
            </div>

            <div className="details-grid">
              {Object.entries({
                ID: selectedDetails.id,
                Title: selectedDetails.title,
                Description: selectedDetails.description,
                Amount: formatAmount(selectedDetails.amount),
                Category: selectedDetails.category,
                Date: selectedDetails.expenseDate || selectedDetails.incomeDate,
                "Payment Method": selectedDetails.paymentMethod,
                Notes: selectedDetails.notes,
              }).map(([label, value]) => (
                <div className="detail-item" key={label}>
                  <span>{label}</span>
                  <strong>{value ?? "-"}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseTracker;
