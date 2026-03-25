import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const AdminPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [orderStats, setOrderStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) { navigate('/login'); return; }
    const user = JSON.parse(loggedInUser);
    if (user.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, [navigate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reportsRes, usersRes, listingsRes, verificationsRes, orderStatsRes, userStatsRes] = await Promise.all([
        fetch('/api/orders/admin/reports'),
        fetch('/api/users/admin/all'),
        fetch('/api/recipes'),
        fetch('/api/users/admin/verifications'),
        fetch('/api/orders/admin/stats'),
        fetch('/api/users/admin/stats')
      ]);
      setReports(await reportsRes.json());
      setUsers((await usersRes.json()).filter(u => u.role !== 'admin'));
      setListings(await listingsRes.json());
      setVerifications(await verificationsRes.json());
      setOrderStats(await orderStatsRes.json());
      setUserStats(await userStatsRes.json());

      // Clear report notifications for admin
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      if (loggedInUser && loggedInUser.id) {
        fetch(`/api/notifications/${loggedInUser.id}/read?type=ORDER_REPORTED`, { method: 'POST' }).catch(() => {});
      }
    } catch (err) {
      setNotification({ message: 'Failed to load admin data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: 'Resolved by admin' }) });
      if (res.ok) {
        setNotification({ message: 'Report resolved.', type: 'success' });
        setReports(prev => prev.filter(r => r._id !== orderId));
      }
    } catch { setNotification({ message: 'Failed.', type: 'error' }); }
  };

  const handleDismiss = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/dismiss`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: 'Dismissed by admin' }) });
      if (res.ok) {
        setNotification({ message: 'Report dismissed.', type: 'success' });
        setReports(prev => prev.filter(r => r._id !== orderId));
      }
    } catch { setNotification({ message: 'Failed.', type: 'error' }); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setNotification({ message: 'User account deleted.', type: 'success' });
        setUsers(prev => prev.map(u => String(u.id) === String(userId) ? { ...u, status: 'deleted' } : u));
      }
    } catch { setNotification({ message: 'Failed to delete user.', type: 'error' }); }
  };

  const handleRestoreUser = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}/restore`, { method: 'PUT' });
      if (res.ok) {
        setNotification({ message: 'User account restored.', type: 'success' });
        setUsers(prev => prev.map(u => String(u.id) === String(userId) ? { ...u, status: 'active', reportCount: 0 } : u));
      }
    } catch { setNotification({ message: 'Failed.', type: 'error' }); }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Delete this food listing?')) return;
    try {
      const res = await fetch(`/api/recipes/${listingId}`, { method: 'DELETE' });
      if (res.ok) {
        setNotification({ message: 'Listing removed.', type: 'success' });
        setListings(prev => prev.filter(l => l.id !== listingId));
      }
    } catch { setNotification({ message: 'Failed.', type: 'error' }); }
  };

  const handleVerify = async (userId, status) => {
    try {
      const res = await fetch(`/api/users/admin/verify/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setNotification({ message: `User ${status === 'verified' ? 'verified' : 'rejected'}.`, type: 'success' });
        setVerifications(prev => prev.filter(v => String(v.id) !== String(userId)));
        fetchAll(); // Refresh users
      }
    } catch { setNotification({ message: 'Failed to update verification.', type: 'error' }); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="loader"></div>
      <p style={{ marginLeft: '1rem', color: '#64748b' }}>Loading admin data...</p>
    </div>
  );

  const tabs = [
    { key: 'reports', label: 'Reports', count: reports.length },
    { key: 'verifications', label: 'Verifications', count: verifications.length },
    { key: 'users', label: 'Users', count: users.length },
    { key: 'listings', label: 'Listings', count: listings.length },
    { key: 'analytics', label: 'Analytics' }
  ];

  return (
    <div style={s.container}>
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', gap: '1rem' }}>
        <button onClick={() => navigate('/')} style={backLinkStyle}>
          &larr; Back to Home
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ ...s.title, margin: 0, fontSize: '2rem' }}>Admin Portal</h1>
          <p style={{ ...s.subtitle, margin: 0 }}>Reports, users, listings, and analytics.</p>
        </div>
        <button onClick={fetchAll} style={s.refreshBtn}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '18px', height: '18px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
          Refresh
        </button>
      </header>

      {/* Tabs */}
      <div style={s.tabs}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={activeTab === tab.key ? s.tabActive : s.tab}>
            {tab.label}
            {tab.count !== undefined && <span style={activeTab === tab.key ? s.tabBadgeActive : s.tabBadge}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ====== REPORTS TAB ====== */}
      {activeTab === 'reports' && (
        <div>
          {reports.length === 0 ? (
            <div style={s.emptyState}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" style={{ width: '48px', height: '48px', color: '#cbd5e1' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p style={{ color: '#64748b', fontWeight: '600' }}>No pending reports</p>
            </div>
          ) : (
            reports.map(report => {
              const reportedUser = users.find(u => String(u.id) === String(report.donorId));
              return (
                <div key={report._id} style={s.reportCard}>
                  <div style={s.reportHeader}>
                    <div>
                      <span style={s.reportLabel}>Reported Donor:</span>
                      <span style={s.reportValue}>{reportedUser?.name || `User #${report.donorId}`}</span>
                      {reportedUser && (
                        <span style={{
                          ...s.countBadge,
                          backgroundColor: (reportedUser.reportCount || 0) >= 3 ? '#fee2e2' : '#fef3c7',
                          color: (reportedUser.reportCount || 0) >= 3 ? '#dc2626' : '#d97706'
                        }}>
                          {reportedUser.reportCount || 0} reports
                        </span>
                      )}
                    </div>
                    <span style={s.reportDate}>{new Date(report.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={s.reportBody}>
                    <div style={s.reportField}>
                      <span style={s.fieldLabel}>Reported By:</span>
                      <span>{report.userName || `User #${report.userId}`}</span>
                    </div>
                    <div style={s.reportField}>
                      <span style={s.fieldLabel}>Reason:</span>
                      <span>{report.reportReason}</span>
                    </div>
                    <div style={s.reportField}>
                      <span style={s.fieldLabel}>Proof:</span>
                      <span style={{ fontStyle: report.reportProof ? 'normal' : 'italic', color: report.reportProof ? '#334155' : '#94a3b8' }}>{report.reportProof || 'No proof provided'}</span>
                    </div>
                    {report.reportProofImage && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={s.fieldLabel}>Proof Photo:</span>
                        <div style={{ marginTop: '0.5rem' }}>
                          <img 
                            src={report.reportProofImage} 
                            alt="Report Proof" 
                            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={s.reportActions}>
                    <button onClick={() => handleResolve(report._id)} style={s.resolveBtn}>Resolve</button>
                    <button onClick={() => handleDismiss(report._id)} style={s.dismissBtn}>Dismiss</button>
                    {reportedUser && (reportedUser.reportCount || 0) >= 3 && reportedUser.status !== 'deleted' && (
                      <button onClick={() => handleDeleteUser(reportedUser.id)} style={s.deleteBtn}>
                        Delete User Account
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

            {/* ====== VERIFICATIONS TAB ====== */}
      {activeTab === 'verifications' && (
        <div>
          {verifications.length === 0 ? (
            <div style={s.emptyState}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" style={{ width: '48px', height: '48px', color: '#cbd5e1' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p style={{ color: '#64748b', fontWeight: '600' }}>No pending verifications</p>
            </div>
          ) : (
            verifications.map(user => (
              <div key={user.id} style={s.reportCard}>
                <div style={s.reportHeader}>
                  <div>
                    <span style={s.reportLabel}>Partner Name:</span>
                    <span style={s.reportValue}>{user.name}</span>
                    <span style={{
                      ...s.countBadge,
                      backgroundColor: user.role === 'ngo' ? '#f5f3ff' : '#eff6ff',
                      color: user.role === 'ngo' ? '#7c3aed' : '#2563eb',
                      textTransform: 'uppercase'
                    }}>
                      {user.role}
                    </span>
                  </div>
                  <span style={s.reportDate}>Joined {new Date().toLocaleDateString()}</span>
                </div>
                <div style={s.reportBody}>
                  <div style={s.reportField}>
                    <span style={s.fieldLabel}>Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div style={s.reportField}>
                    <span style={s.fieldLabel}>Documents:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      {user.verificationDocs?.map((doc, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{doc.name}</span>
                          <a href={doc.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>View Document &rarr;</a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={s.reportActions}>
                  <button onClick={() => handleVerify(user.id, 'verified')} style={s.resolveBtn}>Approve & Verify</button>
                  <button onClick={() => handleVerify(user.id, 'rejected')} style={s.dismissBtn}>Reject Request</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ====== USERS TAB ====== */}
      {activeTab === 'users' && (
        <div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Reports</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={user.status === 'deleted' ? { opacity: 0.5 } : {}}>
                    <td style={s.td}>{user.id}</td>
                    <td style={{ ...s.td, fontWeight: '600' }}>{user.name}</td>
                    <td style={s.td}>{user.email}</td>
                    <td style={s.td}>
                      <span style={{
                        padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                        backgroundColor: user.role === 'restaurant' ? '#dbeafe' : '#f0fdf4',
                        color: user.role === 'restaurant' ? '#2563eb' : '#15803d'
                      }}>{user.role}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        fontWeight: '700',
                        color: (user.reportCount || 0) >= 3 ? '#dc2626' : (user.reportCount || 0) > 0 ? '#d97706' : '#15803d'
                      }}>{user.reportCount || 0}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                        backgroundColor: user.status === 'deleted' ? '#fee2e2' : '#dcfce7',
                        color: user.status === 'deleted' ? '#dc2626' : '#15803d'
                      }}>{user.status}</span>
                    </td>
                    <td style={s.td}>
                      {user.status === 'deleted' ? (
                        <button onClick={() => handleRestoreUser(user.id)} style={s.smallRestore}>Restore</button>
                      ) : (
                        <button onClick={() => handleDeleteUser(user.id)} style={s.smallDelete} disabled={(user.reportCount || 0) < 3}
                          title={(user.reportCount || 0) < 3 ? 'Can only delete users with 3+ reports' : 'Delete this user'}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====== LISTINGS TAB ====== */}
      {activeTab === 'listings' && (
        <div style={s.listingsGrid}>
          {listings.filter(item => {
            const isExpired = item.expiryTimestamp && item.expiryTimestamp < Date.now();
            return item.quantity > 0 && !isExpired;
          }).map(item => (
            <div key={item.id} style={s.listingCard}>
              <img 
                src={item.image || `https://images.unsplash.com/photo-${item.id % 2 === 0 ? '1546069901-ba9599a7e63c' : '1567623481151-1cfad0929a4a'}?w=500&auto=format&fit=crop&q=80`}
                alt={item.title}
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{item.restaurant}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{
                    padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.75rem',
                    backgroundColor: '#dcfce7',
                    color: '#15803d'
                  }}>{item.quantity} left</span>
                  {item.expiryTimestamp && (
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>
                      ⏳ {Math.max(0, Math.floor((item.expiryTimestamp - Date.now()) / 3600000))}h left
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>₹{item.price || item.discountPrice}</span>
                <button onClick={() => handleDeleteListing(item.id)} style={s.smallDelete}>Remove</button>
              </div>
            </div>
          ))}
          {listings.filter(item => {
            const isExpired = item.expiryTimestamp && item.expiryTimestamp < Date.now();
            return item.quantity > 0 && !isExpired;
          }).length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              No active listings found.
            </div>
          )}
        </div>
      )}

      {/* ====== ANALYTICS TAB ====== */}
      {activeTab === 'analytics' && (
        <div>
          <div style={s.statsGrid}>
            <StatCard label="Total Users" value={userStats.totalUsers || 0} color="#3b82f6" />
            <StatCard label="Restaurants" value={userStats.restaurants || 0} color="#8b5cf6" />
            <StatCard label="Regular Users" value={userStats.regularUsers || 0} color="#10b981" />
            <StatCard label="Deleted Accounts" value={userStats.deletedUsers || 0} color="#ef4444" />
          </div>
          <h3 style={{ margin: '2rem 0 1rem', fontWeight: '700', color: '#0f172a' }}>Order Breakdown</h3>
          <div style={s.statsGrid}>
            <StatCard label="Total Orders" value={orderStats.total || 0} color="#0f172a" />
            <StatCard label="Pending" value={orderStats.pending || 0} color="#f59e0b" />
            <StatCard label="Approved" value={orderStats.approved || 0} color="#10b981" />
            <StatCard label="Rejected" value={orderStats.rejected || 0} color="#ef4444" />
            <StatCard label="Reported" value={orderStats.reported || 0} color="#dc2626" />
            <StatCard label="Resolved" value={orderStats.resolved || 0} color="#6366f1" />
          </div>
          <h3 style={{ margin: '2rem 0 1rem', fontWeight: '700', color: '#0f172a' }}>Active Listings</h3>
          <div style={s.statsGrid}>
            <StatCard label="Total Listings" value={listings.length} color="#0ea5e9" />
            <StatCard label="In Stock" value={listings.filter(l => l.quantity > 0).length} color="#10b981" />
            <StatCard label="Out of Stock" value={listings.filter(l => l.quantity <= 0).length} color="#94a3b8" />
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{
    backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem',
    border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex', flexDirection: 'column', gap: '0.25rem'
  }}>
    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
    <span style={{ fontSize: '2rem', fontWeight: '800', color, letterSpacing: '-1px' }}>{value}</span>
  </div>
);

const s = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem', minHeight: '80vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0', letterSpacing: '-1px' },
  subtitle: { fontSize: '1rem', color: '#64748b', margin: 0 },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', color: '#334155' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' },
  tab: { padding: '0.6rem 1.25rem', border: 'none', background: 'none', fontWeight: '600', fontSize: '0.9rem', color: '#94a3b8', cursor: 'pointer', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit' },
  tabActive: { padding: '0.6rem 1.25rem', border: 'none', background: '#f1f5f9', fontWeight: '700', fontSize: '0.9rem', color: '#0f172a', cursor: 'pointer', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit' },
  tabBadge: { backgroundColor: '#f1f5f9', color: '#94a3b8', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' },
  tabBadgeActive: { backgroundColor: '#0f172a', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' },
  emptyState: { backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', textAlign: 'center', border: '1px dashed #cbd5e1' },
  // Report Cards
  reportCard: { backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  reportLabel: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', marginRight: '0.5rem' },
  reportValue: { fontSize: '1rem', fontWeight: '700', color: '#0f172a' },
  countBadge: { marginLeft: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' },
  reportDate: { fontSize: '0.8rem', color: '#94a3b8' },
  reportBody: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem' },
  reportField: { display: 'flex', gap: '0.5rem', fontSize: '0.9rem' },
  fieldLabel: { fontWeight: '700', color: '#64748b', minWidth: '100px' },
  reportActions: { display: 'flex', gap: '0.75rem' },
  resolveBtn: { padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' },
  dismissBtn: { padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' },
  deleteBtn: { padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', marginLeft: 'auto' },
  // Table
  tableWrap: { backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '0.75rem 1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#334155' },
  smallDelete: { padding: '0.3rem 0.65rem', borderRadius: '0.4rem', border: '1px solid #fca5a5', background: 'white', color: '#ef4444', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' },
  smallRestore: { padding: '0.3rem 0.65rem', borderRadius: '0.4rem', border: '1px solid #86efac', background: 'white', color: '#15803d', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' },
  // Listings
  listingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  listingCard: { backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #f1f5f9' },
  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' },
};

const backLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: '#64748b',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '0.9rem',
  padding: '0.6rem 1.2rem',
  borderRadius: '9999px',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  transition: 'all 0.15s',
  cursor: 'pointer'
};

export default AdminPortal;
