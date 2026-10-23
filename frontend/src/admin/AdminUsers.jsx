import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../api';

const AdminUsers = () => {
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.token || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_URL}/api/auth/users`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        if (!res.ok) {
          throw new Error('Unable to load users. Please try again.');
        }

        const data = await res.json();

        if (isMounted) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching users:', err);

        if (isMounted) {
          setError(err.message || 'Failed to load users.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const formatDate = (date) => {
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
        <p>You must be an administrator to view the user directory.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>
        User Directory
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

          <button
            className="btn"
            onClick={() => window.location.reload()}
            style={{ marginLeft: '12px' }}
          >
            Try Again
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#f97316' }}>Loading users...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={rowStyle}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>NAME</th>
                <th style={thStyle}>EMAIL</th>
                <th style={thStyle}>ROLE</th>
                <th style={thStyle}>JOINED</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr style={rowStyle}>
                  <td
                    colSpan="5"
                    style={{
                      ...tdStyle,
                      textAlign: 'center',
                      color: '#a1a1aa'
                    }}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u, index) => {
                  const role = u.role || 'user';
                  const isAdmin = role === 'admin';

                  return (
                    <tr key={u._id || index} style={rowStyle}>
                      <td style={tdStyle}>
                        {u._id
                          ? `${String(u._id).substring(0, 8)}...`
                          : 'N/A'}
                      </td>

                      <td style={tdStyle}>
                        {u.name || 'N/A'}
                      </td>

                      <td style={tdStyle}>
                        {u.email || 'N/A'}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            background: isAdmin
                              ? 'rgba(234,88,12,0.2)'
                              : 'rgba(16,185,129,0.2)',
                            color: isAdmin ? '#f97316' : '#10b981',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {role.toUpperCase()}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {formatDate(u.createdAt)}
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

export default AdminUsers;