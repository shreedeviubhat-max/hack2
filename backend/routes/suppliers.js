const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Supplier = require('../models/Supplier');

// GET all suppliers for logged-in shopkeeper
router.get('/', authMiddleware, async (req, res) => {
  try {
    const shopkeeperId = req.user.userId || req.user.id;
    const suppliers = await Supplier.find({ shopkeeperId }).sort({ updatedAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new supplier
router.post('/', authMiddleware, async (req, res) => {
  try {
    const shopkeeperId = req.user.userId || req.user.id;
    const { companyName, category, initialInvoiceNumber, initialAmount } = req.body;

    if (!companyName?.trim()) {
      return res.status(400).json({ message: 'Supplier / Company name is required' });
    }

    const invoices = [];
    const invAmount = Number(initialAmount);
    if (invAmount > 0) {
      invoices.push({
        invoiceNumber: initialInvoiceNumber?.trim() || `INV-${Date.now().toString().slice(-6)}`,
        amount: invAmount,
        paidAmount: 0,
        status: 'UNPAID',
        invoiceDate: new Date(),
      });
    }

    const supplier = new Supplier({
      shopkeeperId,
      companyName: companyName.trim(),
      category: category ? category.trim() : 'General',
      invoices,
      payments: [],
    });

    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD INVOICE (Purchase / bill taken from supplier)
router.post('/:id/invoices', authMiddleware, async (req, res) => {
  try {
    const shopkeeperId = req.user.userId || req.user.id;
    const { invoiceNumber, amount } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid bill / invoice amount' });
    }

    const supplier = await Supplier.findOne({ _id: req.params.id, shopkeeperId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    supplier.invoices.push({
      invoiceNumber: invoiceNumber?.trim() || `INV-${Date.now().toString().slice(-6)}`,
      amount: parsedAmount,
      paidAmount: 0,
      status: 'UNPAID',
      invoiceDate: new Date(),
    });

    await supplier.save();
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RECORD A PAYMENT TO SUPPLIER ('Paid' button: "How much money did you pay to supplier?")
router.post('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const shopkeeperId = req.user.userId || req.user.id;
    const { amount, notes } = req.body;

    const paidAmount = Number(amount);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid paid amount greater than 0' });
    }

    const supplier = await Supplier.findOne({ _id: req.params.id, shopkeeperId });
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    supplier.payments.push({
      amount: paidAmount,
      date: new Date(),
      notes: notes ? notes.trim() : 'Payment made to supplier',
    });

    await supplier.save();
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
