import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api';

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(previous => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!image) {
      setError('Please select a product image.');
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (!Number.isFinite(price) || price <= 0) {
      setError('Please enter a valid price greater than zero.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a non-negative whole number.');
      return;
    }

    if (!image.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setLoading(true);
    setError('');

    const data = new FormData();

    data.append('name', formData.name.trim());
    data.append('description', formData.description.trim());
    data.append('price', String(price));
    data.append('category', formData.category.trim());
    data.append('stock', String(stock));
    data.append('image', image);

    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: data
      });

      const responseData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          responseData.message || 'Error creating product. Please try again.'
        );
      }

      alert('Product created successfully!');
      navigate('/shop');
    } catch (err) {
      console.error('Error creating product:', err);

      setError(
        err.message || 'Unable to create product. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '40px auto',
        background: '#18181b',
        padding: '40px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
        color: '#fafafa'
      }}
    >
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>
        Add New Product
      </h2>

      {error && (
        <div
          role="alert"
          style={{
            background: '#09090b',
            color: '#ef4444',
            border: '1px solid #27272a',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={150}
          style={inputStyle}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          maxLength={5000}
          style={inputStyle}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
          min="0.01"
          step="0.01"
          style={inputStyle}
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          required
          maxLength={100}
          style={inputStyle}
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock Quantity"
          value={formData.stock}
          onChange={handleChange}
          required
          min="0"
          step="1"
          style={inputStyle}
        />

        <div
          style={{
            padding: '15px',
            border: '1px dashed #f97316',
            borderRadius: '8px'
          }}
        >
          <label
            htmlFor="product-image"
            style={{
              display: 'block',
              marginBottom: '10px',
              color: '#a1a1aa'
            }}
          >
            Upload Product Image (Cloudinary)
          </label>

          <input
            id="product-image"
            type="file"
            accept="image/*"
            required
            onChange={(e) => {
              setImage(e.target.files?.[0] || null);
              setError('');
            }}
            style={{ color: '#fff', maxWidth: '100%' }}
          />

          {image && (
            <p
              style={{
                color: '#a1a1aa',
                fontSize: '0.9rem',
                marginTop: '10px',
                overflowWrap: 'anywhere'
              }}
            >
              Selected: {image.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn"
          style={{
            marginTop: '10px',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Uploading & Creating...' : 'Publish Product'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '12px',
  background: '#09090b',
  border: '1px solid #27272a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

export default AddProduct;