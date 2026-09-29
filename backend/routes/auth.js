const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register Shop Owner
router.post('/register', async (req, res) => {
  try {
    const { shopName, ownerFullName, phoneNumber, password } = req.body;

    // 1. Check all fields are present and trimmed
    if (!shopName?.trim() || !ownerFullName?.trim() || !phoneNumber?.trim() || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. Validate Phone Number (must be exactly 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return res.status(400).json({
        message: 'Invalid phone number. Must be exactly 10 numeric digits.'
      });
    }

    // 3. Validate Password Length (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ phoneNumber: phoneNumber.trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // 5. Hash & Save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      shopName: shopName.trim(),
      ownerFullName: ownerFullName.trim(),
      phoneNumber: phoneNumber.trim(),
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'Shop registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login via Phone Number & Password
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Phone number and password are required' });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: 'Invalid phone number or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid phone number or password' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'kirana_smart_khaata_secure_jwt_secret_key_2026';
    const token = jwt.sign(
      { userId: user._id, shopName: user.shopName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        shopName: user.shopName,
        ownerFullName: user.ownerFullName,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;