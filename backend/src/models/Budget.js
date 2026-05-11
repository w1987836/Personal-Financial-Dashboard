// Budget model
// Stores per-category monthly budget limits for each user.

import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    monthlyLimit: {
      type: Number,
      required: true,
      min: 0
    },
    // month is stored as YYYY-MM, e.g. 2026-02
    month: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;


