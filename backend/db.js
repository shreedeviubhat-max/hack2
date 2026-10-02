const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node.js querySrv ECONNREFUSED with local DNS resolvers on Windows/ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('Unable to set custom DNS servers:', dnsErr.message);
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI is not set');
    return null;
  }

  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If previous promise failed or connection was lost, reset promise
  if (mongoose.connection.readyState === 0) {
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('MongoDB connected successfully');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error('MongoDB connection error:', e.message);
    throw e;
  }

  return cached.conn;
}

module.exports = connectToDatabase;
