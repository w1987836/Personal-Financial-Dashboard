// Main dashboard page: shows overview cards, charts, transactions, and budgets.

import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import DashboardLayout from "../components/Layout/DashboardLayout";
import AlertBanner from "../components/AlertBanner";
import PieChart from "../components/charts/PieChart";
import LineChart from "../components/charts/LineChart";
import BudgetProgressBar from "../components/BudgetProgressBar";
import api from "../utils/api";

const DEFAULT_CATEGORIES = [
  "Food",
  "Rent",
  "Transport",
  "Utilities",
  "Entertainment",
  "Salary",
  "Other"
];

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth({
    protectedRoute: true
  });

  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [alert, setAlert] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    type: "Expense",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    description: ""
  });
  const [budgetForm, setBudgetForm] = useState({
    category: "Food",
    monthlyLimit: ""
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [overviewRes, txRes, budgetRes] = await Promise.all([
        api.get("/reports/overview"),
        api.get("/transactions"),
        api.get("/budgets")
      ]);
      setOverview(overviewRes.data);
      setTransactions(txRes.data);
      setBudgets(budgetRes.data);

      // Determine highest budget alert level
      const hasDanger = budgetRes.data.some((b) => b.status === "danger");
      const hasWarning = budgetRes.data.some((b) => b.status === "warning");
      if (hasDanger) {
        setAlert({
          type: "danger",
          message:
            "You have exceeded your budget in at least one category this month."
        });
      } else if (hasWarning) {
        setAlert({
          type: "warning",
          message:
            "You have reached 80% of your budget in at least one category."
        });
      } else {
        setAlert(null);
      }
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message:
          "Failed to load dashboard data. Please ensure the backend is running."
      });
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [authLoading, user]);

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/transactions", {
        ...form,
        amount: Number(form.amount)
      });
      setForm({
        ...form,
        amount: "",
        description: ""
      });
      await loadData();
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message: "Failed to create transaction. Please check your input."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTx = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      await loadData();
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message: "Failed to delete transaction."
      });
    }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/budgets", {
        category: budgetForm.category,
        monthlyLimit: Number(budgetForm.monthlyLimit)
      });
      setBudgetForm({ ...budgetForm, monthlyLimit: "" });
      await loadData();
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message: "Failed to save budget. Please check your input."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("pf_token")
          : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/export/csv`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          }
        }
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message: "Failed to export CSV."
      });
    }
  };

  const handleImportCsv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const token = localStorage.getItem("pf_token");
      const formData = new FormData();
      formData.append("file", file);
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/import/csv`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          },
          body: formData
        }
      );
      await loadData();
      setAlert({
        type: "success",
        message: "CSV imported successfully."
      });
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message: "Failed to import CSV."
      });
    } finally {
      e.target.value = "";
    }
  };

  if (authLoading || !user) return null;

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <AlertBanner type={alert?.type} message={alert?.message} />

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-xs text-slate-400 mb-1">Total Income (Month)</p>
          <p className="text-2xl font-semibold text-emerald-400">
            {overview ? overview.totalIncome.toFixed(2) : "--"}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400 mb-1">
            Total Expenses (Month)
          </p>
          <p className="text-2xl font-semibold text-red-400">
            {overview ? overview.totalExpenses.toFixed(2) : "--"}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400 mb-1">Remaining Balance</p>
          <p className="text-2xl font-semibold text-slate-100">
            {overview ? overview.remainingBalance.toFixed(2) : "--"}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="text-sm font-medium mb-2">
            Category Distribution (Expenses)
          </h3>
          {overview && overview.categoryDistribution.length > 0 ? (
            <PieChart data={overview.categoryDistribution} />
          ) : (
            <p className="text-xs text-slate-400">
              No expense data available for this month.
            </p>
          )}
        </div>
        <div className="card">
          <h3 className="text-sm font-medium mb-2">
            Daily Spending Trend (Expenses)
          </h3>
          {overview && overview.dailyExpenses.length > 0 ? (
            <LineChart dailyExpenses={overview.dailyExpenses} />
          ) : (
            <p className="text-xs text-slate-400">
              No expense data available for this month.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transaction form + CSV */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-medium mb-3">
              Add Transaction
            </h3>
            <form onSubmit={handleTxSubmit} className="space-y-3">
              <div>
                <label className="block text-xs mb-1 text-slate-300">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1 text-slate-300">
                    Type
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                  >
                    <option>Income</option>
                    <option>Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1 text-slate-300">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-300">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-300">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-primary hover:bg-primaryDark text-xs font-medium text-white disabled:opacity-60"
              >
                {loading ? "Saving..." : "Add Transaction"}
              </button>
            </form>
          </div>

          <div className="card space-y-2">
            <h3 className="text-sm font-medium">CSV Import / Export</h3>
            <button
              onClick={handleExportCsv}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-100"
            >
              Export Transactions CSV
            </button>
            <label className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-100 text-center cursor-pointer">
              Import Transactions CSV
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImportCsv}
              />
            </label>
          </div>
        </div>

        {/* Transactions list */}
        <div className="card lg:col-span-1">
          <h3 className="text-sm font-medium mb-3">
            Recent Transactions
          </h3>
          <div className="max-h-80 overflow-y-auto text-xs">
            {transactions.length === 0 && (
              <p className="text-slate-400">No transactions recorded yet.</p>
            )}
            <ul className="space-y-2">
              {transactions.map((t) => (
                <li
                  key={t._id}
                    className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {t.type === "Income" ? "+" : "-"}
                      {t.amount.toFixed(2)}{" "}
                      <span className="text-slate-400">({t.category})</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(t.date).toLocaleDateString()} •{" "}
                      {t.description || "No description"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteTx(t._id)}
                    className="text-[10px] text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Budgets */}
        <div className="space-y-4 lg:col-span-1">
          <div className="card">
            <h3 className="text-sm font-medium mb-3">Set Monthly Budget</h3>
            <form onSubmit={handleBudgetSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs mb-1 text-slate-300">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={budgetForm.category}
                  onChange={(e) =>
                    setBudgetForm({
                      ...budgetForm,
                      category: e.target.value
                    })
                  }
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-300">
                  Monthly Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={budgetForm.monthlyLimit}
                  onChange={(e) =>
                    setBudgetForm({
                      ...budgetForm,
                      monthlyLimit: e.target.value
                    })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-primary hover:bg-primaryDark text-xs font-medium text-white disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Budget"}
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {budgets.length === 0 && (
              <p className="text-xs text-slate-400">
                No budgets defined yet. Add a budget above to get started.
              </p>
            )}
            {budgets.map((b) => (
              <BudgetProgressBar
                key={b._id}
                category={b.category}
                spent={b.spent}
                limit={b.monthlyLimit}
                percent={b.percent}
                status={b.status}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


