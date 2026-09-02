const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { shopName, ownerFullName, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      shopName,
      ownerFullName,
      phoneNumber,
      password: hashedPassword
    });

    await newUser.save();
    
    // Auto login after register
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, user: { id: newUser._id, shopName, ownerFullName, phoneNumber } });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, shopName: user.shopName, ownerFullName: user.ownerFullName, phoneNumber: user.phoneNumber } });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
