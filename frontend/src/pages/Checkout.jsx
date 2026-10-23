import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';
import API_URL from '../api';

// Load Razorpay only when the customer initiates payment.
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const scriptUrl =
      'https://checkout.razorpay.com/v1/checkout.js';

    const existingScript = document.querySelector(
      `script[src="${scriptUrl}"]`
    );

    if (existingScript) {
      existingScript.addEventListener(
        'load',
        () => resolve(!!window.Razorpay),
        { once: true }
      );

      existingScript.addEventListener(
        'error',
        () => {
          existingScript.remove();
          resolve(false);
        },
        { once: true }
      );

      return;
    }

    const script = document.createElement('script');

    script.src = scriptUrl;
    script.async = true;

    script.onload = () => {
      resolve(!!window.Razorpay);
    };

    script.onerror = () => {
      script.remove();
      resolve(false);
    };

    document.body.appendChild(script);

  });
};

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });

  // Display-only estimate. The backend calculates the actual amount.
  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.qty),
    0
  );

  const handlePayment = async () => {
    if (!user) {
      alert('Please login first.');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      navigate('/shop');
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay only when payment is initiated.
      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        throw new Error(
          'Unable to load the payment service. Please check your internet connection and try again.'
        );
      }

      // Create the payment order on the backend.
      const orderRes = await fetch(`${API_URL}/api/payment/order`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },

        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            qty: Number(item.qty),
          })),

          address,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(
          orderData.message ||
          'Unable to initialize payment.'
        );
      }

      if (
        !orderData.id ||
        !Number.isSafeInteger(orderData.amount) ||
        !orderData.currency ||
        !orderData.key
      ) {
        throw new Error(
          'The payment service returned an invalid order.'
        );
      }

      // Open Razorpay checkout.
      const razorpay = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,

        name: 'Cartora',
        description: 'Cartora Order',
        order_id: orderData.id,

        prefill: {
          name: address.fullName,
          email: user.email || '',
        },

        theme: {
          color: '#f97316',
        },

        handler: async (response) => {
          try {
            // Verify the payment on the backend.
            const verifyRes = await fetch(
              '/api/payment/verify',
              {
                method: 'POST',

                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${user.token}`,
                },

                body: JSON.stringify(response),
              }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(
                verifyData.message ||
                'Payment verification failed. Contact support before trying another payment.'
              );
            }

            // Save the order after payment verification.
            const saveOrderRes = await fetch(
              '/api/orders',
              {
                method: 'POST',

                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${user.token}`,
                },

                body: JSON.stringify({
                  paymentId: response.razorpay_payment_id,
                }),
              }
            );

            const savedOrder = await saveOrderRes.json();

            if (!saveOrderRes.ok) {
              throw new Error(
                savedOrder.message ||
                'Payment may have succeeded, but order creation needs attention. Contact support before trying again.'
              );
            }

            // Clear the cart and navigate after successful processing.
            dispatch(clearCart());
            navigate('/ordersuccess');
          } catch (error) {
            console.error(
              'Order processing error:',
              error
            );

            alert(
              error.message ||
              'Order processing needs attention. Contact support before attempting another payment.'
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });

      razorpay.on('payment.failed', (response) => {
        console.error(
          'Payment failed:',
          response.error
        );

        alert(
          response.error?.description ||
          'Payment failed. Please try again.'
        );

        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);

      alert(
        error.message ||
        'Unable to initialize checkout. Please try again.'
      );

      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!user) {
      alert('Please login first.');
      navigate('/login');
      return;
    }

    if (!loading) {
      handlePayment();
    }

  };

  return (<div className="checkout-container"> <h2>Checkout</h2>


    <div className="checkout-content">
      <form
        onSubmit={handleSubmit}
        className="shipping-form"
      >
        <h3>Shipping Address</h3>

        <input
          type="text"
          placeholder="Full Name"
          required
          value={address.fullName}
          onChange={(event) =>
            setAddress({
              ...address,
              fullName: event.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Street"
          required
          value={address.street}
          onChange={(event) =>
            setAddress({
              ...address,
              street: event.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="City"
          required
          value={address.city}
          onChange={(event) =>
            setAddress({
              ...address,
              city: event.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Postal Code"
          required
          value={address.postalCode}
          onChange={(event) =>
            setAddress({
              ...address,
              postalCode: event.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Country"
          required
          value={address.country}
          onChange={(event) =>
            setAddress({
              ...address,
              country: event.target.value,
            })
          }
        />

        <div className="checkout-summary">
          <h4>
            Total to Pay: ₹{totalPrice.toFixed(2)}
          </h4>

          <button
            type="submit"
            className="btn"
            disabled={
              loading || cartItems.length === 0
            }
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </form>
    </div>
  </div>

  );
};

export default Checkout;
