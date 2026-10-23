import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

const EditProduct = () => {
  const { id } = useParams();
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
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin' || !id) {
      setFetching(false);
      return;
    }

    let isMounted = true;

    const fetchProduct = async () => {
      setFetching(true);
      setError('');

      try {
        const res = await fetch(`/api/products/${id}`);

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || 'Unable to load product details.');
        }

        if (isMounted) {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            price: data.price ?? '',
            category: data.category || '',
            stock: data.stock ?? ''
          });
        }
      } catch (err) {
        console.error('Error fetching product:', err);

        if (isMounted) {
          setError(err.message || 'Failed to load product.');
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

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

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (!formData.name.trim() || !formData.description.trim() ||
        !formData.category.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('Please enter a valid price greater than zero.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a non-negative whole number.');
      return;
    }

    if (image && !image.type.startsWith('image/')) {
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

    if (image) {
      data.append('image', image);
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: data
      });

      const responseData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          responseData.message || 'Unable to update product. Please try again.'
        );
      }

      alert('Product updated successfully!');
      navigate('/admin/products');
    } catch (err) {
      console.error('Error updating product:', err);

      setError(err.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#f97316', marginBottom: '20px' }}>
          Edit Product
        </h2>
        <p style={{ color: '#a1a1aa' }}>Loading product details...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>
        Edit Product
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
          required
          maxLength={150}
          value={formData.name}
          onChange={handleChange}
          style={inputStyle}
        />

        <textarea
          name="description"
          placeholder="Description"
          required
          rows="4"
          maxLength={5000}
          value={formData.description}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          required
          min="0.01"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          required
          maxLength={100}
          value={formData.category}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          required
          min="0"
          step="1"
          value={formData.stock}
          onChange={handleChange}
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
            htmlFor="replace-product-image"
            style={{
              display: 'block',
              marginBottom: '10px',
              color: '#a1a1aa'
            }}
          >
            Replace Image (Optional)
          </label>

          <input
            id="replace-product-image"
            type="file"
            accept="image/*"
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
          disabled={loading || fetching}
          className="btn"
          style={{
            marginTop: '10px',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
};

const containerStyle = {
  maxWidth: '600px',
  margin: '40px auto',
  background: '#18181b',
  padding: '40px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.05)',
  color: '#fafafa'
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

export default EditProduct;