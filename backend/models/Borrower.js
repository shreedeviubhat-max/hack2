const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['CREDIT', 'PAYMENT'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  }
});

const borrowerSchema = new mongoose.Schema({
  shopkeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  advanceBalance: {
    type: Number,
    default: 0,
  },
  transactions: [transactionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Borrower', borrowerSchema);
