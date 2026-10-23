import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../api';

const AdminOrders = () => {
  const { user } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrders, setUpdatingOrders] = useState([]);

  useEffect(() => {
    if (!user?.token || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        if (!res.ok) {
          throw new Error('Unable to fetch orders. Please try again.');
        }

        const data = await res.json();

        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);

        if (isMounted) {
          setError(err.message || 'Failed to load orders.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const updateStatus = async (id, status) => {
    if (!user?.token || updatingOrders.includes(id)) {
      return;
    }

    setUpdatingOrders(previous => [...previous, id]);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        throw new Error('Unable to update order status. Please try again.');
      }

      setOrders(previous =>
        previous.map(order =>
          order._id === id ? { ...order, status } : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrders(previous =>
        previous.filter(orderId => orderId !== id)
      );
    }
  };

  const formatPrice = amount => {
    const value = Number(amount);

    return `₹${Number.isFinite(value) ? value.toFixed(2) : '0.00'}`;
  };

  const formatDate = date => {
    if (!date) return 'N/A';

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? 'N/A'
      : parsedDate.toLocaleDateString();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#f97316' }}>Access Denied</h2>
        <p>You must be an administrator to view orders.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>
        Manage Orders
      </h2>

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
        <p style={{ color: '#f97316' }}>Loading orders...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={rowStyle}>
                <th style={thStyle}>ORDER ID</th>
                <th style={thStyle}>USER</th>
                <th style={thStyle}>TOTAL</th>
                <th style={thStyle}>DATE</th>
                <th style={thStyle}>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr style={rowStyle}>
                  <td
                    colSpan="5"
                    style={{
                      ...tdStyle,
                      textAlign: 'center',
                      color: '#a1a1aa'
                    }}
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const status = order.status || 'Pending';

                  return (
                    <tr key={order._id} style={rowStyle}>
                      <td style={tdStyle}>
                        {order._id
                          ? `${String(order._id).substring(0, 8)}...`
                          : 'N/A'}
                      </td>

                      <td style={tdStyle}>
                        {order.userId?.name || 'Deleted User'}
                      </td>

                      <td style={tdStyle}>
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td style={tdStyle}>
                        {formatDate(order.createdAt)}
                      </td>

                      <td style={tdStyle}>
                        <select
                          value={status}
                          disabled={updatingOrders.includes(order._id)}
                          onChange={event =>
                            updateStatus(order._id, event.target.value)
                          }
                          aria-label={`Update status for order ${order._id}`}
                          style={{
                            background: '#09090b',
                            color: '#fff',
                            padding: '6px',
                            border: '1px solid #27272a',
                            borderRadius: '4px',
                            outline: 'none',
                            opacity: updatingOrders.includes(order._id)
                              ? 0.6
                              : 1
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>

                        {updatingOrders.includes(order._id) && (
                          <span
                            style={{
                              marginLeft: '8px',
                              color: '#a1a1aa',
                              fontSize: '0.8rem'
                            }}
                          >
                            Saving...
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
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

export default AdminOrders;