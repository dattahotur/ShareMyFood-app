import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNavigationGuard from '../hooks/useNavigationGuard';
import Notification from '../components/Notification';

const MyOrders = () => {
  const navigate = useNavigate();
  useNavigationGuard();
  const [orders, setOrders] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [reportModal, setReportModal] = useState({ open: false, orderId: null });
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    if (reportModal.open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [reportModal.open]);

  const showNotification = (message, type) => setNotification({ message, type });

  useEffect(() => {
    const fetchData = async () => {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) { navigate('/login'); return; }
      const user = JSON.parse(loggedInUser);

      try {
        setLoading(true);
        const [ordersRes, recipesRes] = await Promise.all([
          fetch(`/api/orders/user/${user.id}`),
          fetch(`/api/recipes`)
        ]);
        const ordersData = await ordersRes.json();
        const recipesData = await recipesRes.json();
        
        const recipeMap = {};
        recipesData.forEach(r => recipeMap[r.id] = r);
        setOrders(ordersData);
        setRecipes(recipeMap);

        // Clear notifications for this page
        fetch(`/api/notifications/${user.id}/read?type=ORDER_APPROVED`, { method: 'POST' }).catch(() => {});
        fetch(`/api/notifications/${user.id}/read?type=ORDER_REJECTED`, { method: 'POST' }).catch(() => {});
      } catch (err) {
        showNotification("Failed to load your orders.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const openReportModal = (orderId) => {
    setReportModal({ open: true, orderId });
    setReportReason('');
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      showNotification("Please select a reason for your report.", "error");
      return;
    }
    if (!reportModal.proofImage) {
      showNotification("Please upload a photo as proof.", "error");
      return;
    }
    try {
      const res = await fetch(`/api/orders/${reportModal.orderId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, proof: reportModal.proof, proofImage: reportModal.proofImage })
      });
      if (res.ok) {
        showNotification("Issue reported. We will investigate.", "success");
        setOrders(prev => prev.map(o => o._id === reportModal.orderId ? { ...o, status: 'reported' } : o));
        setReportModal({ open: false, orderId: null, proof: '', proofImage: null });
      } else {
        showNotification("Failed to submit report.", "error");
      }
    } catch (err) {
      showNotification("Network error.", "error");
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
      
      {/* Report Reason + Proof Modal */}
      {reportModal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Report Issue</h3>
            <p style={styles.modalSubtitle}>Please tell us why you're reporting this order and provide proof.</p>
            
            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', display: 'block' }}>Reason</label>
            <div style={styles.reasonOptions}>
              {['Food was not available at pickup', 'Restaurant was closed', 'Food quality was poor', 'Wrong items received', 'Other'].map(reason => (
                <button 
                  key={reason}
                  onClick={() => setReportReason(reason)} 
                  style={reportReason === reason ? styles.reasonBtnActive : styles.reasonBtn}
                >
                  {reason}
                </button>
              ))}
            </div>

            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', display: 'block', marginTop: '1rem' }}>Proof Description</label>
            <textarea 
              placeholder="Describe what happened..." 
              style={styles.reasonTextarea}
              value={reportModal.proof || ''}
              onChange={(e) => setReportModal(prev => ({ ...prev, proof: e.target.value }))}
            />

            <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', display: 'block', marginTop: '1rem' }}>Photo Proof (required)</label>
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer' }}
              onClick={() => document.getElementById('report-photo-input').click()}>
              {reportModal.proofImage ? (
                <img src={reportModal.proofImage} alt="Proof" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '0.5rem' }} />
              ) : (
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                  <p style={{ color: '#64748b', margin: '0.5rem 0 0', fontWeight: '500', fontSize: '0.85rem' }}>Click to upload proof photo</p>
                </div>
              )}
              <input id="report-photo-input" type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => setReportModal(prev => ({ ...prev, proofImage: reader.result }));
                reader.readAsDataURL(file);
              }} style={{ display: 'none' }} />
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setReportModal({ open: false, orderId: null, proof: '', proofImage: null })} style={styles.modalCancelBtn}>Cancel</button>
              <button onClick={submitReport} style={styles.modalSubmitBtn}>Submit Report</button>
            </div>
          </div>
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/')} style={backLinkStyle}>
          &larr; Back to Home
        </button>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ ...styles.title, margin: 0 }}>My Orders</h1>
          <p style={{ ...styles.subtitle, margin: 0 }}>View your past reservations and manage any issues.</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" style={{width:'64px',height:'64px',color:'#cbd5e1',marginBottom:'1rem'}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <h3 style={{color:'#334155',margin:'0 0 0.5rem 0'}}>No orders yet</h3>
          <p style={{color:'#64748b',margin:0}}>When you claim food, it will appear here.</p>
        </div>
      ) : (
        <div style={styles.orderList}>
          {orders.map(order => {
            const recipe = recipes[order.recipeId] || { title: 'Unknown Item', restaurant: 'Unknown', price: 0 };
            return (
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.orderDetails}>
                  <div style={styles.orderDate}>{new Date(order.timestamp).toLocaleString()}</div>
                  <h3 style={styles.recipeTitle}>{recipe.title}</h3>
                  <p style={styles.restaurantName}>{recipe.restaurant}</p>
                  <p style={styles.quantity}>Qty: {order.quantity} • ₹{recipe.price * order.quantity}</p>
                </div>
                <div style={styles.orderActions}>
                  {order.status === 'reported' ? (
                    <span style={styles.reportedBadge}>Reported</span>
                  ) : order.status === 'approved' ? (
                    <>
                      <span style={styles.completedBadge}>Approved</span>
                      <button onClick={() => openReportModal(order._id)} style={styles.reportBtn}>Report Issue</button>
                    </>
                  ) : order.status === 'rejected' ? (
                    <span style={styles.rejectedBadge}>Rejected</span>
                  ) : (
                    <span style={styles.pendingBadge}>Pending Approval</span>
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
  orderCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  orderDetails: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  orderDate: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
  recipeTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 },
  restaurantName: { fontSize: '0.95rem', color: '#64748b', margin: '0 0 0.25rem 0' },
  quantity: { fontSize: '0.9rem', color: '#334155', fontWeight: '500', margin: 0 },
  orderActions: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' },
  pendingBadge: { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' },
  completedBadge: { backgroundColor: '#dcfce7', color: '#15803d', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' },
  reportedBadge: { backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' },
  rejectedBadge: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' },
  reportBtn: { backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #fca5a5', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  // Report Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' },
  modal: { backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', margin: 'auto' },
  modalTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' },
  modalSubtitle: { fontSize: '0.95rem', color: '#64748b', margin: '0 0 1.25rem 0' },
  reasonOptions: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' },
  reasonBtn: { textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s' },
  reasonBtnActive: { textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '2px solid #10b981', backgroundColor: '#f0fdf4', color: '#15803d', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' },
  reasonTextarea: { width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', marginBottom: '1.25rem' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' },
  modalCancelBtn: { padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' },
  modalSubmitBtn: { padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(239,68,68,0.3)' }
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

export default MyOrders;
