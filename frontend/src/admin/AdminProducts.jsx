import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminProducts = () => {
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingIds, setDeletingIds] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch('/api/products');

        if (!res.ok) {
          throw new Error('Unable to load products. Please try again.');
        }

        const data = await res.json();

        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);

        if (isMounted) {
          setError(err.message || 'Failed to load products.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!user?.token) {
      setError('Please log in as an administrator to delete products.');
      return;
    }

    if (deletingIds.includes(id)) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) {
      return;
    }

    setDeletingIds(previous => [...previous, id]);
    setError('');

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!res.ok) {
        throw new Error('Unable to delete product. Please try again.');
      }

      setProducts(previous =>
        previous.filter(product => product._id !== id)
      );
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product.');
    } finally {
      setDeletingIds(previous =>
        previous.filter(productId => productId !== id)
      );
    }
  };

  const formatPrice = (price) => {
    const value = Number(price);

    return `₹${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`;
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '15px',
          flexWrap: 'wrap'
        }}
      >
        <h2 style={{ color: '#f97316' }}>Manage Products</h2>

        <Link to="/admin/add-product" className="btn">
          + Add Product
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            color: '#ef4444',
            background: '#09090b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#f97316' }}>Loading products...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={rowStyle}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>NAME</th>
                <th style={thStyle}>PRICE</th>
                <th style={thStyle}>CATEGORY</th>
                <th style={thStyle}>STOCK</th>
                <th style={thStyle}>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr style={rowStyle}>
                  <td
                    colSpan="6"
                    style={{
                      ...tdStyle,
                      textAlign: 'center',
                      color: '#a1a1aa'
                    }}
                  >
                    No products found. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} style={rowStyle}>
                    <td style={tdStyle}>
                      {product._id
                        ? `${String(product._id).substring(0, 8)}...`
                        : 'N/A'}
                    </td>

                    <td style={tdStyle}>
                      {product.name || 'Unnamed Product'}
                    </td>

                    <td style={tdStyle}>
                      {formatPrice(product.price)}
                    </td>

                    <td style={tdStyle}>
                      {product.category || 'Uncategorized'}
                    </td>

                    <td style={tdStyle}>
                      {product.stock ?? 0}
                    </td>

                    <td style={tdStyle}>
                      <Link
                        to={`/admin/edit-product/${product._id}`}
                        style={editBtn}
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(product._id)}
                        style={{
                          ...deleteBtn,
                          opacity: deletingIds.includes(product._id)
                            ? 0.6
                            : 1,
                          cursor: deletingIds.includes(product._id)
                            ? 'not-allowed'
                            : 'pointer'
                        }}
                        disabled={deletingIds.includes(product._id)}
                      >
                        {deletingIds.includes(product._id)
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '40px auto',
  padding: '30px',
  background: '#18181b',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.05)',
  color: '#fafafa'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const rowStyle = {
  borderBottom: '1px solid rgba(255,255,255,0.1)'
};

const thStyle = {
  padding: '15px',
  textAlign: 'left',
  color: '#a1a1aa',
  fontSize: '0.9rem'
};

const tdStyle = {
  padding: '15px',
  textAlign: 'left'
};

const editBtn = {
  background: '#3b82f6',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: '4px',
  marginRight: '10px',
  display: 'inline-block'
};

const deleteBtn = {
  background: '#ef4444',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer'
};

export default AdminProducts;