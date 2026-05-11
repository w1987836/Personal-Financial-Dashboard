// Reports page: monthly summary and cumulative summary with date filters.

import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import DashboardLayout from "../components/Layout/DashboardLayout";
import AlertBanner from "../components/AlertBanner";
import api from "../utils/api";

export default function ReportsPage() {
  const { user, loading: authLoading, logout } = useAuth({
    protectedRoute: true
  });

  const today = new Date().toISOString().slice(0, 10);
  const [filters, setFilters] = useState({
    startDate: today.slice(0, 8) + "01",
    endDate: today
  });
  const [summary, setSummary] = useState(null);
  const [alert, setAlert] = useState(null);

  const loadSummary = async () => {
    try {
      const res = await api.get("/reports/summary", {
        params: filters
      });
      setSummary(res.data);
      setAlert(null);
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message: "Failed to load reports. Please check date range."
      });
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadSummary();
    }
  }, [authLoading, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await loadSummary();
  };

  if (authLoading || !user) return null;

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <AlertBanner type={alert?.type} message={alert?.message} />

      <div className="card mb-4">
        <h2 className="text-sm font-medium mb-3">Reports</h2>
        <p className="text-xs text-slate-400 mb-3">
          Generate monthly and cumulative summaries for a chosen date range.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 text-xs"
        >
          <div className="flex-1">
            <label className="block text-xs mb-1 text-slate-300">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs mb-1 text-slate-300">
              End Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary hover:bg-primaryDark text-xs font-medium text-white"
            >
              Generate
            </button>
          </div>
        </form>
      </div>

      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="text-sm font-medium mb-2">
              Cumulative Summary
            </h3>
            <p className="text-xs text-slate-400 mb-2">
              For the selected date range
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Total Income</span>
                <span className="text-emerald-400">
                  {summary.cumulativeSummary.income.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total Expenses</span>
                <span className="text-red-400">
                  {summary.cumulativeSummary.expenses.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Balance</span>
                <span className="text-slate-100">
                  {summary.cumulativeSummary.balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="card lg:col-span-2">
            <h3 className="text-sm font-medium mb-2">
              Monthly Breakdown
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-300">
                    <th className="py-2 pr-4">Month</th>
                    <th className="py-2 pr-4">Income</th>
                    <th className="py-2 pr-4">Expenses</th>
                    <th className="py-2 pr-4">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.monthlySummary.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-3 text-slate-400 text-center"
                      >
                        No data for the selected date range.
                      </td>
                    </tr>
                  )}
                  {summary.monthlySummary.map((m) => (
                    <tr
                      key={m.month}
                      className="border-b border-slate-800 last:border-b-0"
                    >
                      <td className="py-2 pr-4">{m.month}</td>
                      <td className="py-2 pr-4 text-emerald-400">
                        {m.income.toFixed(2)}
                      </td>
                      <td className="py-2 pr-4 text-red-400">
                        {m.expenses.toFixed(2)}
                      </td>
                      <td className="py-2 pr-4 text-slate-100">
                        {m.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


