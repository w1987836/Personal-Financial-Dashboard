// Transaction routes: CRUD and CSV import/export.

import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCsv,
  importTransactionsCsv
} from '../controllers/transactionController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Validation rules for create/update
const transactionValidation = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('type')
    .isIn(['Income', 'Expense'])
    .withMessage('Type must be Income or Expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required')
];

// Protected routes
router.use(protect);

// GET /api/transactions
router.get('/', getTransactions);

// POST /api/transactions
router.post('/', transactionValidation, createTransaction);

// PUT /api/transactions/:id
router.put('/:id', transactionValidation, updateTransaction);

// DELETE /api/transactions/:id
router.delete('/:id', deleteTransaction);

// GET /api/transactions/export
router.get('/export/csv', exportTransactionsCsv);

// POST /api/transactions/import
router.post('/import/csv', upload.single('file'), importTransactionsCsv);

export default router;


