import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  const containerStyle = {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '50px 30px',
    background: '#18181b',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <h2
        style={{
          fontSize: '2.5rem',
          marginBottom: '20px',
          color: '#10b981'
        }}
      >
        Order Placed Successfully!
      </h2>

      <p
        style={{
          color: '#a1a1aa',
          fontSize: '1.2rem',
          marginBottom: '40px'
        }}
      >
        Thank you for shopping with Cartora! Your order has been placed.
        You can visit your profile to check your order details.
      </p>

      <Link to="/profile" className="btn">
        View My Profile
      </Link>

      {' '}

      <Link to="/shop" className="btn">
        Continue Shopping
      </Link>
    </div>
  );
};

export default OrderSuccess;