import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNavigationGuard from '../hooks/useNavigationGuard';
import Notification from '../components/Notification';

const ManageDonations = () => {
  const navigate = useNavigate();
  useNavigationGuard();
  const [orders, setOrders] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type) => setNotification({ message, type });

  useEffect(() => {
    const fetchData = async () => {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) { navigate('/login'); return; }
      const user = JSON.parse(loggedInUser);

      try {
        setLoading(true);
        const [ordersRes, recipesRes] = await Promise.all([
          fetch(`/api/orders/donor/${user.id}`),
          fetch(`/api/recipes`)
        ]);
        const ordersData = await ordersRes.json();
        const recipesData = await recipesRes.json();
        
        const recipeMap = {};
        recipesData.forEach(r => recipeMap[r.id] = r);
        
        setOrders(ordersData);
        setRecipes(recipeMap);

        // Clear notifications for this page (new requests)
        fetch(`/api/notifications/${user.id}/read?type=ORDER_PLACED`, { method: 'POST' }).catch(() => {});
      } catch (err) {
        showNotification("Failed to load incoming requests.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleAction = async (orderId, action) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/${action}`, { method: 'POST' });
      if (res.ok) {
        const msg = action === 'approve' 
          ? "Order approved! The claimer has been notified." 
          : "Order rejected. Stock has been restored.";
        showNotification(msg, "success");
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: action === 'approve' ? 'approved' : 'rejected' } : o));
      } else {
        const data = await res.json();
        showNotification(data.error || `Failed to ${action} order.`, "error");
      }
    } catch (err) {
      showNotification("Network error. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading incoming requests...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/')} style={backLinkStyle}>
          &larr; Back to Home
        </button>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ ...styles.title, margin: 0 }}>Manage Donations</h1>
          <p style={{ ...styles.subtitle, margin: 0 }}>Review and approve reservation requests.</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" style={{width:'64px',height:'64px',color:'#cbd5e1',marginBottom:'1rem'}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
          </svg>
          <h3 style={{color: '#334155', margin: '0 0 0.5rem 0'}}>No incoming requests</h3>
          <p style={{color: '#64748b', margin: 0}}>When someone claims your donated food, their request will appear here.</p>
        </div>
      ) : (
        <div style={styles.orderList}>
          {orders.map(order => {
            const recipe = recipes[order.recipeId] || { title: 'Unknown Item', price: 0 };
            return (
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.orderInfo}>
                  <div style={styles.orderDate}>{new Date(order.timestamp).toLocaleString()}</div>
                  <h3 style={styles.itemTitle}>{recipe.title}</h3>
                  <p style={styles.claimerInfo}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'16px',height:'16px',marginRight:'4px', verticalAlign: 'middle'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    Requested by: <strong>{order.userName || 'Unknown User'}</strong>
                  </p>
                  <p style={styles.qtyText}>Qty: {order.quantity} &bull; Value: ₹{recipe.price * order.quantity}</p>
                </div>
                
                <div style={styles.orderActions}>
                  {order.status === 'pending' ? (
                    <div style={styles.actionBtns}>
                      <button onClick={() => handleAction(order._id, 'approve')} style={styles.approveBtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{width:'16px',height:'16px',marginRight:'6px'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Approve
                      </button>
                      <button onClick={() => handleAction(order._id, 'reject')} style={styles.rejectBtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{width:'16px',height:'16px',marginRight:'6px'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={order.status === 'approved' ? styles.approvedBadge : order.status === 'rejected' ? styles.rejectedBadge : styles.otherBadge}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem', minHeight: '80vh' },
  centerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0', letterSpacing: '-1px' },
  subtitle: { fontSize: '1rem', color: '#64748b', margin: 0 },
  emptyState: { backgroundColor: 'white', padding: '4rem 2rem', borderRadius: '1rem', textAlign: 'center', border: '1px dashed #cbd5e1' },
  orderList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  orderCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  orderInfo: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  orderDate: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
  itemTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 },
  claimerInfo: { fontSize: '0.95rem', color: '#475569', margin: 0 },
  qtyText: { fontSize: '0.9rem', color: '#64748b', margin: 0 },
  orderActions: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' },
  actionBtns: { display: 'flex', gap: '0.75rem' },
  approveBtn: { display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16,185,129,0.3)' },
  rejectBtn: { display: 'flex', alignItems: 'center', backgroundColor: 'transparent', color: '#ef4444', border: '1.5px solid #fca5a5', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' },
  approvedBadge: { backgroundColor: '#dcfce7', color: '#15803d', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' },
  rejectedBadge: { backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' },
  otherBadge: { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }
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
  transition: 'all 0.2s',
  cursor: 'pointer'
};

export default ManageDonations;
