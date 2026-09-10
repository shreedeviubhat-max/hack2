// clean.js
require('dotenv').config();
const mongoose = require('mongoose');

async function clean() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await mongoose.connection.collection('users').deleteMany({
    phoneNumber: { $not: /^[0-9]{10}$/ }
  });
  console.log(`Cleaned up ${result.deletedCount} invalid user records.`);
  process.exit(0);
}

clean();