// Report routes: overview and summary reports.

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getOverview, getSummary } from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);

// GET /api/reports/overview
router.get('/overview', getOverview);

// GET /api/reports/summary
router.get('/summary', getSummary);

export default router;


