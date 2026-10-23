import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../api';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    const fetchMyOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_URL}/api/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        if (res.status === 401) {
          logout();
          navigate('/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Unable to load your orders. Please try again.');
        }

        const data = await res.json();

        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);

        if (isMounted) {
          setError(
            err.message || 'Something went wrong while loading your orders.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyOrders();

    return () => {
      isMounted = false;
    };
  }, [user, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const containerStyle = {
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '30px',
    background: '#18181b',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#fafafa'
  };

  const badgeStyle = {
    background: 'rgba(249,115,22,0.1)',
    color: '#f97316',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    display: 'inline-block'
  };

  const formatPrice = (amount) => {
    const value = Number(amount);
    return `₹${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`;
  };

  const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? 'Date unavailable'
      : parsedDate.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '30px',
          marginBottom: '30px',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h2
            style={{
              color: '#fff',
              fontSize: '2.2rem',
              marginBottom: '10px'
            }}
          >
            My Profile
          </h2>

          <p
            style={{
              color: '#a1a1aa',
              fontSize: '1.2rem',
              marginBottom: '5px'
            }}
          >
            <strong>Name:</strong> {user.name || 'Not available'}
          </p>

          <p
            style={{
              color: '#a1a1aa',
              fontSize: '1.2rem',
              marginBottom: '15px'
            }}
          >
            <strong>Email:</strong> {user.email || 'Not available'}
          </p>

          <span style={badgeStyle}>
            Account Type: {(user.role || 'user').toUpperCase()}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="btn"
          style={{ background: '#ef4444', boxShadow: 'none' }}
        >
          Logout
        </button>
      </div>

      <h3
        style={{
          color: '#f97316',
          marginBottom: '20px',
          fontSize: '1.5rem'
        }}
      >
        Order History
      </h3>

      {loading ? (
        <p style={{ color: '#a1a1aa' }}>Fetching your orders...</p>
      ) : error ? (
        <div
          style={{
            background: '#09090b',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #27272a'
          }}
        >
          <p style={{ color: '#ef4444', marginBottom: '15px' }}>
            {error}
          </p>

          <button
            className="btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            background: '#09090b',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #27272a'
          }}
        >
          <p style={{ color: '#a1a1aa', marginBottom: '15px' }}>
            You haven't placed any orders yet.
          </p>

          <Link to="/shop" className="btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map((order, index) => {
            const status = order.status || 'Processing';

            const statusColor =
              status === 'Delivered'
                ? '#10b981'
                : status === 'Shipped'
                ? '#3b82f6'
                : '#f59e0b';

            const statusBackground =
              status === 'Delivered'
                ? 'rgba(16,185,129,0.1)'
                : status === 'Shipped'
                ? 'rgba(59,130,246,0.1)'
                : 'rgba(245,158,11,0.1)';

            return (
              <div
                key={order._id || index}
                style={{
                  background: '#09090b',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #27272a',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                <div>
                  <p
                    style={{
                      color: '#a1a1aa',
                      fontSize: '0.9rem',
                      marginBottom: '5px'
                    }}
                  >
                    Order ID:{' '}
                    <span style={{ color: '#fff' }}>
                      {order._id || 'Unavailable'}
                    </span>
                  </p>

                  <p
                    style={{
                      color: '#a1a1aa',
                      fontSize: '0.9rem',
                      marginBottom: '5px'
                    }}
                  >
                    Placed On:{' '}
                    <span style={{ color: '#fff' }}>
                      {formatDate(order.createdAt)}
                    </span>
                  </p>

                  <p
                    style={{
                      color: '#a1a1aa',
                      fontSize: '0.9rem'
                    }}
                  >
                    Total:{' '}
                    <strong style={{ color: '#10b981' }}>
                      {formatPrice(order.totalAmount)}
                    </strong>
                  </p>
                </div>

                <div>
                  <span
                    style={{
                      background: statusBackground,
                      color: statusColor,
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontWeight: 'bold'
                    }}
                  >
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Profile;