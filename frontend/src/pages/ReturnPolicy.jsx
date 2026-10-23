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

const ReturnPolicy = () => {
  return (
    <div style={textualStyle}>
      <h2 style={{ color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
        Return & Refund Policy
      </h2>

      <p style={{ marginBottom: '20px' }}>
        At Cartora, we aim to provide a convenient shopping experience.
        Return and refund eligibility depends on the product, the order
        details, and the return terms applicable to the purchase. Please
        review the following information before requesting a return.
      </p>

      <h4 style={{ color: '#f97316', marginTop: '25px', marginBottom: '10px' }}>
        1. Eligibility for Returns
      </h4>
      <p style={{ marginBottom: '15px' }}>
        Return eligibility may depend on the item's condition, product
        category, and applicable return terms. Keep your order confirmation
        and proof of purchase available when requesting assistance.
        Contact the store administrator to confirm whether a particular
        item is eligible for return.
      </p>

      <h4 style={{ color: '#f97316', marginTop: '25px', marginBottom: '10px' }}>
        2. Refund Processing
      </h4>
      <p style={{ marginBottom: '15px' }}>
        Approved refunds, where applicable, are subject to verification
        and the payment provider's processing procedures. Refund timelines
        depend on the payment method and the provider. A refund should not
        be considered confirmed until its status has been verified.
      </p>

      <h4 style={{ color: '#f97316', marginTop: '25px', marginBottom: '10px' }}>
        3. Non-Returnable Items
      </h4>
      <p style={{ marginBottom: '15px' }}>
        Certain products may be excluded from returns because of their
        nature, condition, or applicable policies. Any restrictions should
        be communicated in the relevant product information or at checkout.
      </p>

      <h4 style={{ color: '#f97316', marginTop: '25px', marginBottom: '10px' }}>
        4. Return Shipping Costs
      </h4>
      <p>
        Responsibility for return shipping costs depends on the reason
        for the return and the applicable terms. Please confirm any
        shipping charges with the store administrator before sending
        an item back.
      </p>
    </div>
  );
};

export default ReturnPolicy;