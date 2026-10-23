import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    let isMounted = true;

    const fetchStats = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_URL}/api/analytics`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        if (res.status === 401) {
          navigate('/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Unable to load dashboard statistics.');
        }

        const data = await res.json();

        if (isMounted) {
          setStats({
            totalOrders: Number(data.totalOrders) || 0,
            totalProducts: Number(data.totalProducts) || 0,
            totalUsers: Number(data.totalUsers) || 0,
            totalRevenue: Number(data.totalRevenue) || 0
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);

        if (isMounted) {
          setError(
            err.message || 'Something went wrong while loading statistics.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const cardStyle = {
    padding: '25px',
    background: '#18181b',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '10px'
  };

  const numberStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#f97316'
  };

  const formatRevenue = (amount) => {
    const value = Number(amount);
    return `₹${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`;
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '5px'
        }}
      >
        <img
          src="/images/CartoraLogo.png"
          alt="Cartora Logo"
          style={{
            height: '40px',
            width: '40px',
            borderRadius: '8px',
            objectFit: 'cover',
            filter: 'drop-shadow(0 0px 10px rgba(249, 115, 22, 0.3))'
          }}
        />

        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
      </div>

      <p
        style={{
          color: '#a1a1aa',
          marginBottom: '30px',
          fontSize: '1.1rem'
        }}
      >
        Welcome back,{' '}
        <span style={{ color: '#fff' }}>
          {user.name || 'Admin'}
        </span>
      </p>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            margin: '50px 0',
            color: '#f97316'
          }}
        >
          Loading metrics...
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: 'center',
            margin: '30px 0',
            color: '#ef4444'
          }}
        >
          <p>{error}</p>

          <button
            className="btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      ) : stats ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}
        >
          <div style={cardStyle}>
            <h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>
              Total Orders
            </h4>
            <div style={numberStyle}>{stats.totalOrders}</div>
          </div>

          <div style={cardStyle}>
            <h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>
              Total Products
            </h4>
            <div style={numberStyle}>{stats.totalProducts}</div>
          </div>

          <div style={cardStyle}>
            <h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>
              Total Users
            </h4>
            <div style={numberStyle}>{stats.totalUsers}</div>
          </div>

          <div style={cardStyle}>
            <h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>
              Total Revenue
            </h4>
            <div style={numberStyle}>
              {formatRevenue(stats.totalRevenue)}
            </div>
          </div>
        </div>
      ) : null}

      <div
        style={{
          marginTop: '40px',
          padding: '30px',
          background: '#18181b',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <h3 style={{ marginBottom: '25px', color: '#f97316' }}>
          Administrative Controls
        </h3>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >
          <button
            className="btn"
            onClick={() => navigate('/admin/add-product')}
          >
            + Add Product
          </button>

          <button
            className="btn"
            onClick={() => navigate('/admin/products')}
            style={{ background: '#3f3f46' }}
          >
            📦 Manage Products
          </button>

          <button
            className="btn"
            onClick={() => navigate('/admin/orders')}
            style={{ background: '#3f3f46' }}
          >
            🚚 Manage Orders
          </button>

          <button
            className="btn"
            onClick={() => navigate('/admin/users')}
            style={{ background: '#3f3f46' }}
          >
            👥 Users Directory
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;