// Budget routes: create/update budgets and get budgets with usage.

import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import {
  getBudgetsWithUsage,
  upsertBudget
} from '../controllers/budgetController.js';

const router = express.Router();

router.use(protect);

// GET /api/budgets
router.get('/', getBudgetsWithUsage);

// POST /api/budgets
router.post(
  '/',
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('monthlyLimit')
      .isFloat({ gt: 0 })
      .withMessage('Monthly limit must be greater than 0')
  ],
  upsertBudget
);

export default router;


