import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/product.css';

const ProductCard = ({ product }) => {
  const price = Number(product.price);

  return (
    <div className="product-card">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="product-image"
        loading="lazy"
        decoding="async"
      />

      <div className="product-info">
        <h3>{product.name}</h3>

        <p className="price">
          ₹{Number.isFinite(price) ? price.toFixed(2) : '0.00'}
        </p>

        <Link to={`/product/${product._id}`} className="btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;