import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import API_URL from '../api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        setProducts(data.slice(0, 4)); // Featured products
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);



  return (
    <div className="home-container">
      <div className="hero-banner">
        <img
          src="/images/Cartora-hero.png"
          alt="Welcome to Cartora — Discover the best products at unbeatable prices"
          className="hero-background-image"
        />
      </div>

      <h2>Featured Products</h2>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );


};

export default Home;