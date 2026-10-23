import React from 'react';

const textualStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '40px',
  background: '#18181b',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  lineHeight: '1.8',
  color: '#a1a1aa'
};

const Disclaimer = () => {
  return (
    <div style={textualStyle}>
      <h2 style={{ color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
        Legal & Site Disclaimer
      </h2>

      <p style={{ marginBottom: '20px' }}>
        Cartora is an e-commerce platform developed as a web development
        project. It demonstrates common online shopping features, including
        product browsing, shopping cart management, user accounts, and order
        processing. Some content and functionality may be intended for
        demonstration or testing purposes.
      </p>

      <h4 style={{ color: '#f97316', marginTop: '25px', marginBottom: '10px' }}>
        1. Accuracy of Materials
      </h4>
      <p style={{ marginBottom: '15px' }}>
        Product descriptions, prices, images, availability, and other
        information displayed on Cartora may be sample or demonstration
        content. Please verify product information before relying on it.
        Product availability and details depend on the data configured
        for the platform.
      </p>

      <h4 style={{ color: '#f97316', marginTop: '25px', marginBottom: '10px' }}>
        2. Payment Processing
      </h4>
      <p style={{ marginBottom: '15px' }}>
        Cartora may use Razorpay for payment processing. Payment availability
        depends on the configured payment gateway and environment. Test-mode
        transactions do not represent real payments. If live payments are
        enabled, transactions are subject to the payment provider's terms
        and applicable policies. Never submit real payment details unless
        the checkout is configured and verified for live transactions.
      </p>

      <h4 style={{ color: '#f97316', marginTop: '25px', marginBottom: '10px' }}>
        3. External Links and Services
      </h4>
      <p style={{ marginBottom: '15px' }}>
        Cartora may integrate with third-party services for payment
        processing, image hosting, and other functionality. These services
        operate under their own terms and privacy policies. Cartora is not
        responsible for the availability or content of external websites.
      </p>

      <h4 style={{ color: '#f97316', marginTop: '25px', marginBottom: '10px' }}>
        4. Project Limitations
      </h4>
      <p style={{ marginBottom: '15px' }}>
        Features may be modified, unavailable, or limited during development
        and testing. Users should not rely on demonstration functionality
        for critical transactions without confirming that the relevant
        services are operational.
      </p>

      <p style={{ marginTop: '30px', fontStyle: 'italic', fontSize: '0.9rem' }}>
        By using Cartora, you acknowledge that you are responsible for
        reviewing the information and terms applicable to the services
        you use.
      </p>
    </div>
  );
};

export default Disclaimer;