// Transaction controller
// Handles CRUD operations and CSV import/export for transactions.

import { validationResult } from 'express-validator';
import fs from 'fs';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import Transaction from '../models/Transaction.js';

// Helper: build query for date filtering
const buildDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  return filter;
};

// GET /api/transactions
// Optional query params: startDate, endDate
export const getTransactions = async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const filter = {
      userId: req.user._id,
      ...buildDateFilter(startDate, endDate)
    };
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    return res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error while fetching transactions' });
  }
};

// POST /api/transactions
export const createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { amount, type, category, date, description } = req.body;
    const tx = await Transaction.create({
      userId: req.user._id,
      amount,
      type,
      category,
      date,
      description
    });
    return res.status(201).json(tx);
  } catch (error) {
    console.error('Create transaction error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error while creating transaction' });
  }
};

// PUT /api/transactions/:id
export const updateTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json(tx);
  } catch (error) {
    console.error('Update transaction error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error while updating transaction' });
  }
};

// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const tx = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error while deleting transaction' });
  }
};

// GET /api/transactions/export
// Returns all user transactions as CSV
export const exportTransactionsCsv = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({
      date: -1
    });

    const headers = [
      'amount',
      'type',
      'category',
      'date',
      'description'
    ];

    const rows = transactions.map((t) =>
      [
        t.amount,
        t.type,
        `"${t.category}"`,
        t.date.toISOString(),
        `"${(t.description || '').replace(/"/g, '""')}"`
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transactions.csv'
    );
    return res.send(csvContent);
  } catch (error) {
    console.error('Export CSV error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error while exporting transactions' });
  }
};

// POST /api/transactions/import
// Expects a CSV file upload with columns: amount,type,category,date,description
export const importTransactionsCsv = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const results = [];

    // Convert buffer to stream for csv-parser
    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csvParser())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        const docs = [];
        for (const row of results) {
          if (!row.amount || !row.type || !row.category || !row.date) continue;

          docs.push({
            userId: req.user._id,
            amount: Number(row.amount),
            type: row.type,
            category: row.category,
            date: new Date(row.date),
            description: row.description || ''
          });
        }

        if (docs.length > 0) {
          await Transaction.insertMany(docs);
        }

        return res.json({
          message: 'CSV imported successfully',
          importedCount: docs.length
        });
      })
      .on('error', (error) => {
        console.error('CSV import error:', error.message);
        return res
          .status(500)
          .json({ message: 'Server error while importing CSV' });
      });
  } catch (error) {
    console.error('Import CSV error:', error.message);
    return res
      .status(500)
      .json({ message: 'Server error while importing CSV' });
  }
};


