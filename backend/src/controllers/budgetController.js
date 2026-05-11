// Budget controller
// Manages per-category monthly budgets and calculates spend vs limit.

import { validationResult } from 'express-validator';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// Helper to get YYYY-MM from Date or string
const toMonthKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// GET /api/budgets?month=YYYY-MM
export const getBudgetsWithUsage = async (req, res) => {
  const month = req.query.month || toMonthKey(new Date());

  try {
    const budgets = await Budget.find({
      userId: req.user._id,
      month
    });

    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const txAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'Expense',
          date: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const spentMap = {};
    txAgg.forEach((t) => {
      spentMap[t._id] = t.totalSpent;
    });

    const response = budgets.map((b) => {
      const spent = spentMap[b.category] || 0;
      const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      let status = 'ok';
      if (percent >= 100) status = 'danger';
      else if (percent >= 80) status = 'warning';

      return {
        _id: b._id,
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        month: b.month,
        spent,
        percent,
        status
      };
    });

    return res.json(response);
  } catch (error) {
    console.error('Get budgets error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error while fetching budgets' });
  }
};

// POST /api/budgets
// Create or update a budget for a given category + month
export const upsertBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { category, monthlyLimit, month } = req.body;
    const monthKey = month || toMonthKey(new Date());

    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user._id,
        category,
        month: monthKey
      },
      { monthlyLimit },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(budget);
  } catch (error) {
    console.error('Upsert budget error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error while saving budget' });
  }
};


