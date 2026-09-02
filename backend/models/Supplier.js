const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['UNPAID', 'PARTIAL', 'PAID'],
    default: 'UNPAID',
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  fileAttachmentReference: {
    type: String, // Path or URL to the uploaded file
  }
});

const paymentSchema = new mongoose.Schema({
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

const supplierSchema = new mongoose.Schema({
  shopkeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String, // Product Line
    trim: true,
  },
  invoices: [invoiceSchema],
  payments: [paymentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
