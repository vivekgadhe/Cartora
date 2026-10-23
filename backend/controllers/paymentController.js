const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const PaymentAttempt = require('../models/PaymentAttempt');

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay configuration is missing.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const normalizeAddress = (address) => {
  const fields = [
    'fullName',
    'street',
    'city',
    'postalCode',
    'country',
  ];

  if (
    !address ||
    typeof address !== 'object' ||
    Array.isArray(address)
  ) {
    return { error: 'A shipping address is required.' };
  }

  const result = {};

  for (const field of fields) {
    if (
      typeof address[field] !== 'string' ||
      !address[field].trim()
    ) {
      return {
        error: `Please provide a valid ${field}.`,
      };
    }

    result[field] = address[field].trim();
  }

  return { address: result };
};

// Create a Razorpay order using trusted MongoDB prices.
const createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Your cart is empty.',
      });
    }

    const normalized = normalizeAddress(req.body.address);

    if (normalized.error) {
      return res.status(400).json({
        message: normalized.error,
      });
    }

    const quantities = new Map();

    for (const item of items) {
      const productId = String(item?.productId || '');
      const qty = Number(item?.qty);

      if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
          message: 'Your cart contains an invalid product.',
        });
      }

      if (
        !Number.isSafeInteger(qty) ||
        qty < 1 ||
        qty > 100
      ) {
        return res.status(400).json({
          message: 'Product quantities must be whole numbers from 1 to 100.',
        });
      }

      const combinedQty =
        (quantities.get(productId) || 0) + qty;

      if (combinedQty > 100) {
        return res.status(400).json({
          message: 'Maximum quantity per product is 100.',
        });
      }

      quantities.set(productId, combinedQty);
    }

    const ids = [...quantities.keys()];

    const products = await Product.find({
      _id: { $in: ids },
    });

    if (products.length !== ids.length) {
      return res.status(400).json({
        message: 'One or more products are no longer available.',
      });
    }

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    const orderItems = [];
    let totalPaise = 0;

    for (const [productId, qty] of quantities.entries()) {
      const product = productMap.get(productId);

      if (
        !Number.isFinite(product.price) ||
        product.price <= 0
      ) {
        return res.status(400).json({
          message: `Invalid price for ${product.name}.`,
        });
      }

      if (
        !Number.isSafeInteger(product.stock) ||
        product.stock < qty
      ) {
        return res.status(409).json({
          message: `${product.name} does not have enough stock.`,
        });
      }

      const pricePaise = Math.round(
        (product.price + Number.EPSILON) * 100
      );

      if (
        !Number.isSafeInteger(pricePaise) ||
        pricePaise < 1
      ) {
        return res.status(400).json({
          message: `Invalid price for ${product.name}.`,
        });
      }

      totalPaise += pricePaise * qty;

      orderItems.push({
        productId: product._id,
        qty,
        price: pricePaise / 100,
      });
    }

    if (
      !Number.isSafeInteger(totalPaise) ||
      totalPaise < 1 ||
      totalPaise > 100000000
    ) {
      return res.status(400).json({
        message: 'The order total is invalid or exceeds the allowed limit.',
      });
    }

    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: totalPaise,
      currency: 'INR',
      receipt: `cartora_${crypto.randomUUID()}`,
    });

    // Persist the server-calculated checkout details.
    await PaymentAttempt.create({
      userId: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amountPaise: totalPaise,
      currency: 'INR',
      items: orderItems,
      totalAmount: totalPaise / 100,
      address: normalized.address,
      status: 'created',
    });

    return res.status(201).json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      'Razorpay order creation failed:',
      error.message
    );

    return res.status(500).json({
      message: 'Unable to initialize payment. Please try again.',
    });
  }
};

// Verify the payment signature and confirm payment details.
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string'
    ) {
      return res.status(400).json({
        message: 'Required payment verification details are missing.',
      });
    }

    const attempt = await PaymentAttempt.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        message: 'Checkout session not found for this account.',
      });
    }

    if (attempt.status === 'ordered') {
      return res.status(200).json({
        message: 'Payment has already been processed.',
        status: 'captured',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: 'Payment configuration is missing.',
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest('hex');

    const received = Buffer.from(
      razorpay_signature,
      'hex'
    );

    const expected = Buffer.from(
      expectedSignature,
      'hex'
    );

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        message: 'Payment signature verification failed.',
      });
    }

    const razorpay = getRazorpayInstance();

    const [payment, razorpayOrder] = await Promise.all([
      razorpay.payments.fetch(razorpay_payment_id),
      razorpay.orders.fetch(razorpay_order_id),
    ]);

    if (
      payment.order_id !== attempt.razorpayOrderId ||
      razorpayOrder.id !== attempt.razorpayOrderId
    ) {
      return res.status(400).json({
        message: 'Payment does not match this checkout.',
      });
    }

    if (
      payment.amount !== attempt.amountPaise ||
      razorpayOrder.amount !== attempt.amountPaise ||
      payment.currency !== attempt.currency ||
      razorpayOrder.currency !== attempt.currency
    ) {
      return res.status(400).json({
        message: 'Payment amount or currency does not match the checkout.',
      });
    }

    if (payment.status !== 'captured') {
      return res.status(409).json({
        message: 'Payment has not been captured yet.',
        status: payment.status,
      });
    }

    if (
      attempt.paymentId &&
      attempt.paymentId !== razorpay_payment_id
    ) {
      return res.status(409).json({
        message: 'A different payment is already associated with this checkout.',
      });
    }

    attempt.paymentId = razorpay_payment_id;
    attempt.status = 'paid';

    await attempt.save();

    return res.status(200).json({
      message: 'Payment verified successfully.',
      razorpay_order_id,
      razorpay_payment_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
    });
  } catch (error) {
    console.error(
      'Payment verification failed:',
      error.message
    );

    return res.status(500).json({
      message: 'Unable to verify payment. Please contact support before retrying.',
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};