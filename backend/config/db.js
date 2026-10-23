const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error(
      'MONGO_URI is missing from backend/.env.'
    );
  }

  const conn = await mongoose.connect(mongoURI);

  console.log(
    `MongoDB connected successfully: ${conn.connection.host}`
  );

  return conn;
};

module.exports = connectDB;