// Report controller
// Provides dashboard overview metrics and reports.

import Transaction from '../models/Transaction.js';

// Helper: derive start/end of month
const getMonthRange = (year, monthIndex) => {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  return { start, end };
};

// GET /api/reports/overview?month=YYYY-MM
// Returns total income, total expenses, remaining balance,
// category distribution and monthly trend.
export const getOverview = async (req, res) => {
  const monthParam = req.query.month;
  const now = new Date();
  const [year, month] = monthParam
    ? monthParam.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const { start, end } = getMonthRange(year, month - 1);

  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: start, $lt: end }
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = {};

    transactions.forEach((t) => {
      if (t.type === 'Income') {
        totalIncome += t.amount;
      } else if (t.type === 'Expense') {
        totalExpenses += t.amount;
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    });

    const remainingBalance = totalIncome - totalExpenses;

    const categoryDistribution = Object.entries(categoryMap).map(
      ([category, value]) => ({
        category,
        value
      })
    );

    // Build daily trend within month
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyExpenses = Array(daysInMonth).fill(0);
    transactions.forEach((t) => {
      if (t.type === 'Expense') {
        const day = t.date.getDate();
        dailyExpenses[day - 1] += t.amount;
      }
    });

    return res.json({
      totalIncome,
      totalExpenses,
      remainingBalance,
      categoryDistribution,
      dailyExpenses
    });
  } catch (error) {
    console.error('Overview report error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error while generating overview report' });
  }
};

// GET /api/reports/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Monthly and cumulative summary for a date range
export const getSummary = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: 'startDate and endDate are required' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: start, $lt: end }
    });

    const monthlyMap = {};
    let cumulativeIncome = 0;
    let cumulativeExpenses = 0;

    transactions.forEach((t) => {
      const year = t.date.getFullYear();
      const month = String(t.date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = { income: 0, expenses: 0 };
      }

      if (t.type === 'Income') {
        monthlyMap[key].income += t.amount;
        cumulativeIncome += t.amount;
      } else {
        monthlyMap[key].expenses += t.amount;
        cumulativeExpenses += t.amount;
      }
    });

    const monthlySummary = Object.entries(monthlyMap)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([month, vals]) => ({
        month,
        income: vals.income,
        expenses: vals.expenses,
        balance: vals.income - vals.expenses
      }));

    const cumulativeSummary = {
      income: cumulativeIncome,
      expenses: cumulativeExpenses,
      balance: cumulativeIncome - cumulativeExpenses
    };

    return res.json({ monthlySummary, cumulativeSummary });
  } catch (error) {
    console.error('Summary report error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error while generating summary report' });
  }
};


