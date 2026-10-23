import React from 'react';

const About = () => {
  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px',
    background: '#18181b',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    textAlign: 'center'
  };

  const socialBtnStyle = {
    display: 'inline-block',
    margin: '10px',
    padding: '10px 20px',
    background: '#27272a',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  return (
    <div style={containerStyle}>
      <img
        src="/images/profile.jpeg"
        alt="Cartora"
        style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: '4px solid #f97316',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)'
        }}
      />

      <h2
        style={{
          fontSize: '2.5rem',
          marginBottom: '10px',
          color: '#fff'
        }}
      >
        About Cartora
      </h2>

      <h3
        style={{
          fontSize: '1.5rem',
          color: '#f97316',
          marginBottom: '15px'
        }}
      >
        Cartora | E-commerce Platform
      </h3>

      <p
        style={{
          color: '#a1a1aa',
          fontSize: '1.2rem',
          lineHeight: '1.8',
          maxWidth: '600px',
          margin: '0 auto 30px auto'
        }}
      >
        <strong>Everything You Love, One Cart Away!</strong>{' '}
        Welcome to Cartora, an e-commerce platform designed to make
        online shopping simple and convenient. Explore products, manage
        your shopping cart, place orders, and enjoy a seamless shopping
        experience.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '20px'
        }}
      >
        <a
          href="/shop"
          style={socialBtnStyle}
        >
          🛍️ Explore Shop
        </a>

        <a
          href="/cart"
          style={{
            ...socialBtnStyle,
            background: 'rgba(239, 68, 68, 0.2)',
            borderColor: '#ef4444',
            color: '#ef4444'
          }}
        >
          🛒 My Cart
        </a>

        <a
          href="/profile"
          style={{
            ...socialBtnStyle,
            background: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            color: '#3b82f6'
          }}
        >
          👤 My Account
        </a>
      </div>
    </div>
  );
};

export default About;