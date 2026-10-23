const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

if (process.env.NODE_ENV === 'production') {
  app.use(
    express.static(path.join(__dirname, '../frontend/build'))
  );

  app.use((req, res) => {
    res.sendFile(
      path.resolve(__dirname, '../frontend/build/index.html')
    );
  });
} else {
  app.get('/', (req, res) => {
    res.send('Cartora API is running in development mode.');
  });
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Cartora API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      'Unable to start Cartora API:',
      error.message
    );

    process.exit(1);
  }
};

startServer();