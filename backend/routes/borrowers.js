const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Borrower = require('../models/Borrower');

// GET all borrowers for logged-in shopkeeper
router.get('/', authMiddleware, async (req, res) => {
  try {
    const shopkeeperId = req.user.userId || req.user.id;
    const borrowers = await Borrower.find({ shopkeeperId }).sort({ updatedAt: -1 });
    res.json(borrowers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new borrower
router.post('/', authMiddleware, async (req, res) => {
  try {
    const shopkeeperId = req.user.userId || req.user.id;
    const { fullName, phone, address, initialBorrowed } = req.body;

    if (!fullName?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: 'Full name and phone number are required' });
    }

    const transactions = [];
    const borrowedAmount = Number(initialBorrowed);
    if (borrowedAmount > 0) {
      transactions.push({
        type: 'CREDIT',
        amount: borrowedAmount,
        date: new Date(),
        notes: 'Initial borrowed balance',
      });
    }

    const borrower = new Borrower({
      shopkeeperId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address ? address.trim() : '',
      advanceBalance: 0,
      transactions,
    });

    await borrower.save();
    res.status(201).json(borrower);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RECORD A PAYMENT ('Paid' button: "How much money did he return?")
router.post('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const shopkeeperId = req.user.userId || req.user.id;
    const { amount, notes } = req.body;

    const returnAmount = Number(amount);
    if (isNaN(returnAmount) || returnAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid returned amount greater than 0' });
    }

    const borrower = await Borrower.findOne({ _id: req.params.id, shopkeeperId });
    if (!borrower) {
      return res.status(404).json({ message: 'Borrower not found' });
    }

    // Add PAYMENT transaction
    borrower.transactions.push({
      type: 'PAYMENT',
      amount: returnAmount,
      date: new Date(),
      notes: notes ? notes.trim() : 'Payment returned by borrower',
    });

    await borrower.save();
    res.json(borrower);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD NEW CREDIT / BORROWED AMOUNT
router.post('/:id/credit', authMiddleware, async (req, res) => {
  try {
    const shopkeeperId = req.user.userId || req.user.id;
    const { amount, notes } = req.body;

    const borrowAmount = Number(amount);
    if (isNaN(borrowAmount) || borrowAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid borrowed amount greater than 0' });
    }

    const borrower = await Borrower.findOne({ _id: req.params.id, shopkeeperId });
    if (!borrower) {
      return res.status(404).json({ message: 'Borrower not found' });
    }

    borrower.transactions.push({
      type: 'CREDIT',
      amount: borrowAmount,
      date: new Date(),
      notes: notes ? notes.trim() : 'Credit / items taken',
    });

    await borrower.save();
    res.json(borrower);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
