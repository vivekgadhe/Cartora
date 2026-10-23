const mongoose = require('mongoose');

const Order = require('../models/Order');
const Product = require('../models/Product');
const PaymentAttempt = require('../models/PaymentAttempt');
const sendEmail = require('../utils/sendEmail');

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

const addOrderItems = async (req, res) => {
  const paymentId = req.body.paymentId;

  if (
    typeof paymentId !== 'string' ||
    !paymentId.startsWith('pay_')
  ) {
    return res.status(400).json({
      message: 'A valid payment ID is required.',
    });
  }

  try {
    const existingOrder = await Order.findOne({ paymentId });

    if (existingOrder) {
      if (
        String(existingOrder.userId) !== String(req.user._id)
      ) {
        return res.status(409).json({
          message: 'This payment is already associated with an order.',
        });
      }

      return res.status(200).json(existingOrder);
    }

    const attempt = await PaymentAttempt.findOne({
      paymentId,
      userId: req.user._id,
    });

    if (
      !attempt ||
      !['paid', 'ordered'].includes(attempt.status)
    ) {
      return res.status(409).json({
        message: 'A verified captured payment is required before an order can be created.',
      });
    }

    const session = await mongoose.startSession();

    let createdOrder;

    try {
      await session.withTransaction(async () => {
        const freshAttempt = await PaymentAttempt.findOne({
          _id: attempt._id,
          userId: req.user._id,
        }).session(session);

        if (
          !freshAttempt ||
          !['paid', 'ordered'].includes(freshAttempt.status)
        ) {
          throw new Error(
            'Payment attempt is not ready for order creation.'
          );
        }

        const alreadyCreated = await Order.findOne({
          paymentId: freshAttempt.paymentId,
        }).session(session);

        if (alreadyCreated) {
          createdOrder = alreadyCreated;
          freshAttempt.status = 'ordered';
          await freshAttempt.save({ session });
          return;
        }

        for (const item of freshAttempt.items) {
          const stockUpdate = await Product.updateOne(
            {
              _id: item.productId,
              stock: { $gte: item.qty },
            },
            {
              $inc: { stock: -item.qty },
            },
            { session }
          );

          if (stockUpdate.modifiedCount !== 1) {
            throw new Error(
              'One or more products no longer have sufficient stock. Contact support before retrying payment.'
            );
          }
        }

        const orders = await Order.create(
          [
            {
              userId: freshAttempt.userId,

              items: freshAttempt.items.map((item) => ({
                productId: item.productId,
                qty: item.qty,
                price: item.price,
              })),

              totalAmount: freshAttempt.totalAmount,
              address: freshAttempt.address,
              paymentId: freshAttempt.paymentId,
              status: 'Pending',
            },
          ],
          { session }
        );

        createdOrder = orders[0];

        freshAttempt.status = 'ordered';

        await freshAttempt.save({ session });
      });
    } finally {
      await session.endSession();
    }

    if (!createdOrder) {
      return res.status(500).json({
        message: 'Payment is verified, but order creation could not be confirmed. Contact support before trying another payment.',
      });
    }

    // A failed email must not make a saved order appear unsuccessful.
    try {
      await sendEmail({
        email: req.user.email,
        subject: 'Cartora - Order Confirmation',

        message: `
          <h2>Order Confirmation</h2>
          <p>Hello ${escapeHtml(req.user.name || 'Customer')},</p>
          <p>Your Cartora order has been placed successfully.</p>
          <p>Order ID: <strong>${escapeHtml(createdOrder._id)}</strong></p>
          <p>Total: ₹${Number(createdOrder.totalAmount).toFixed(2)}</p>
          <p>Shipping address:
            ${escapeHtml(createdOrder.address.street)},
            ${escapeHtml(createdOrder.address.city)}
          </p>
          <p>Thank you for shopping with Cartora!</p>
        `,
      });
    } catch (emailError) {
      console.error(
        'Order saved, but confirmation email failed:',
        emailError.message
      );
    }

    return res.status(201).json(createdOrder);
  } catch (error) {
    if (error.code === 11000) {
      const existing = await Order.findOne({ paymentId })
        .catch(() => null);

      if (
        existing &&
        String(existing.userId) === String(req.user._id)
      ) {
        return res.status(200).json(existing);
      }
    }

    console.error(
      'Order creation failed:',
      error.message
    );

    return res.status(500).json({
      message: 'Payment may be captured, but order creation needs attention. Contact support before trying another payment.',
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      'Pending',
      'Shipped',
      'Delivered',
    ];

    if (
      req.body.status &&
      !allowedStatuses.includes(req.body.status)
    ) {
      return res.status(400).json({
        message: 'Invalid order status.',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      });
    }

    order.status = req.body.status || order.status;

    return res.json(await order.save());
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrders,
  updateOrderStatus,
};