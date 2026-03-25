import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const RecipeDetails = () => {
  const APP_VERSION = "2.0.0-OVERHAUL";
  console.log(`[FoodShare] RecipeDetails render v${APP_VERSION}, ID:`, useParams().id);
  
  const { id } = useParams();
  const navigate = useNavigate();

  const [foodDetails, setFoodDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isFreeForNGO, setIsFreeForNGO] = useState(false);

  useEffect(() => {
    const checkFreeStatus = () => {
      if (!foodDetails || !foodDetails.expiryTimestamp) return;
      
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) return;
      
      const user = JSON.parse(loggedInUser);
      const timeLeft = foodDetails.expiryTimestamp - Date.now();
      const within30Mins = timeLeft > 0 && timeLeft <= 30 * 60 * 1000;
      
      setIsFreeForNGO(user.role === 'ngo' && within30Mins);
    };

    checkFreeStatus();
    const interval = setInterval(checkFreeStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [foodDetails]);

  useEffect(() => {
    if (showConfirmModal || showImagePreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showConfirmModal, showImagePreview]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Reset ALL states on ID change to prevent stale data display
        setFoodDetails(null);
        setError(null);
        setLoading(true);
        
        const res = await fetch(`/api/recipes/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.discountPrice) data.price = data.discountPrice;
          setFoodDetails(data);
        } else {
          setError("This delicious item is no longer available.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("We're having trouble reaching the kitchen. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleClaim = async () => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      showNotification("Please log in to claim this item.", "error");
      setTimeout(() => navigate('/login', { state: { from: `/food/${id}` } }), 2000);
      return;
    }
    
    setIsSubmitting(true);
    const user = JSON.parse(loggedInUser);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          userName: user.name, 
          donorId: foodDetails.donorId, 
          recipeId: id, 
          quantity: 1,
          paymentMethod: paymentMethod,
          claimerRole: user.role || 'user',
          price: isFreeForNGO ? 0 : foodDetails.price
        })
      });
      
      if (res.ok) {
        showNotification("Request sent to donor! You'll be notified when they approve.", "success");
        setShowConfirmModal(false);
        // Refresh details to update quantity if backend supports it
        setFoodDetails(prev => ({...prev, quantity: prev.quantity - 1}));
      } else {
        const errorData = await res.json();
        showNotification(`Order failed: ${errorData.details || errorData.error || 'Connection error'}`, "error");
      }
    } catch (err) {
      showNotification("Network error. Please check your connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{...styles.skeleton, width: '150px', height: '24px'}}></div>
      </header>
      <div style={styles.card}>
        <div style={{...styles.skeleton, height: '100%', minHeight: '500px'}}></div>
        <div style={styles.infoSection}>
          <div style={{...styles.skeleton, width: '80%', height: '40px', marginBottom: '1rem'}}></div>
          <div style={{...styles.skeleton, width: '40%', height: '24px', marginBottom: '2rem'}}></div>
          <div style={{...styles.skeleton, width: '100%', height: '120px', borderRadius: '1rem', marginBottom: '2rem'}}></div>
          <div style={{...styles.skeleton, width: '100%', height: '100px', marginBottom: '2rem'}}></div>
          <div style={{...styles.skeleton, width: '100%', height: '60px', borderRadius: '1rem'}}></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={styles.centerContainer}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '64px', height: '64px', color: '#94a3b8', marginBottom: '1rem'}}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <h2 style={{color: '#0f172a'}}>Oops!</h2>
      <p style={{color: '#64748b', marginBottom: '1.5rem'}}>{error}</p>
      <Link to="/" style={styles.backBtn}>Back to Home</Link>
    </div>
  );

  return (
    <div style={styles.container}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />

      <header style={styles.header}>
        <Link to="/" style={styles.backLink}>&larr; Browse All ShareMyFood</Link>
        <span style={styles.versionTag}>v{APP_VERSION}</span>
      </header>
      
      <div style={styles.card}>
        <div style={styles.imageSection} onClick={() => setShowImagePreview(true)}>
          <img 
            src={foodDetails.image || `https://images.unsplash.com/photo-${foodDetails.id % 2 === 0 ? '1546069901-ba9599a7e63c' : '1567623481151-1cfad0929a4a'}?w=1000&auto=format&fit=crop&q=80`} 
            alt={foodDetails.title}
            style={{ ...styles.heroImg, cursor: 'zoom-in' }}
          />
          <div style={styles.imgOverlay}>
            <span style={styles.badge}>Live Listing</span>
            {foodDetails.quantity === 0 && (
              <span style={{...styles.badge, backgroundColor: '#ef4444', marginLeft: '0.5rem'}}>OUT OF STOCK</span>
            )}
          </div>
        </div>
        
        <div style={styles.infoSection}>
          <div style={styles.infoHead}>
            <h1 style={styles.title}>{foodDetails.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.25rem' }}>
              <p style={styles.restaurant}>by <span style={styles.restaurantName}>{foodDetails.restaurant}</span></p>
              {foodDetails.donorVerified && (
                <span style={{ 
                  display: 'flex', alignItems: 'center', backgroundColor: '#ecfdf5', color: '#059669', 
                  borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #d1fae5'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{width: '12px', height: '12px', marginRight: '4px'}}>
                    <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 1 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                  </svg>
                  VERIFIED DONOR
                </span>
              )}
              {foodDetails.isNGOPreferred && (
                <span style={{ 
                  display: 'flex', alignItems: 'center', backgroundColor: '#f5f3ff', color: '#7c3aed', 
                  borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #ddd6fe'
                }}>
                  NGO PREFERRED
                </span>
              )}
            </div>
          </div>
          
          <div style={styles.priceRow}>
            <div style={styles.priceTags}>
              <span style={styles.currentPrice}>
                {isFreeForNGO ? "FREE" : `₹${parseFloat(foodDetails.price).toFixed(2)}`}
              </span>
              {!isFreeForNGO && <del style={styles.oldPrice}>₹{parseFloat(foodDetails.originalPrice).toFixed(2)}</del>}
            </div>
            {isFreeForNGO ? (
              <div style={{...styles.savingsBadge, backgroundColor: '#7c3aed', color: 'white'}}>
                NGO LAST-MINUTE RESCUE
              </div>
            ) : (
              <div style={styles.savingsBadge}>
                Save ₹{(parseFloat(foodDetails.originalPrice) - parseFloat(foodDetails.price)).toFixed(2)}
              </div>
            )}
          </div>
          
          {isFreeForNGO && (
            <div style={{
              backgroundColor: '#f5f3ff', padding: '1rem', borderRadius: '1rem', border: '2px solid #7c3aed',
              display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem' }}>📢</div>
              <div>
                <strong style={{ color: '#7c3aed', display: 'block' }}>Emergency Recovery Window</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6d28d9' }}>
                  This food item is nearing expiration. As a verified NGO, you can rescue this for **free** to ensure it reaches those in need today.
                </p>
              </div>
            </div>
          )}
          
          <div style={styles.descriptionBox}>
            <h3 style={styles.sectionTitle}>What's inside?</h3>
            <p style={styles.descriptionText}>{foodDetails.description}</p>
            {foodDetails.expiryTimestamp && (
              <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>Availability Timeline</span>
                  <span style={{ 
                    color: ((foodDetails.expiryTimestamp - Date.now()) / 3600000) < 2 ? '#ef4444' : '#64748b', 
                    fontWeight: '800', 
                    fontSize: '0.9rem' 
                  }} className={((foodDetails.expiryTimestamp - Date.now()) / 3600000) < 2 ? 'pulse-red' : ''}>
                    ⌛ {(() => {
                      const totalMinutes = Math.floor((foodDetails.expiryTimestamp - Date.now()) / 60000);
                      const h = Math.floor(totalMinutes / 60);
                      const m = totalMinutes % 60;
                      return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
                    })()}
                  </span>
                </div>
                <div style={{ height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(0, Math.min(100, ((foodDetails.expiryTimestamp - Date.now()) / (foodDetails.expiryTimestamp - (foodDetails.createdAt || (foodDetails.expiryTimestamp - 3600000)))) * 100))}%`,
                    background: 'linear-gradient(90deg, #ef4444 0%, #f97316 50%, #10b981 100%)',
                    borderRadius: '6px',
                    transition: 'width 1s ease-in-out'
                  }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center', fontWeight: '500' }}>
                  Available until {foodDetails.availableUntil}
                </p>
              </div>
            )}
          </div>
          
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '24px', height: '24px', color: '#64748b'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <div>
                <span style={styles.statLabel}>Pick up before</span>
                <span style={styles.statValue}>{foodDetails.availableUntil}</span>
              </div>
            </div>
            <div style={styles.statItem}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '24px', height: '24px', color: '#64748b'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              <div>
                <span style={styles.statLabel}>Stock left</span>
                <span style={styles.statValue}>
                  {foodDetails.quantity} items
                  {foodDetails.quantity <= 2 && <span style={styles.urgencyText}> (Selling Fast!)</span>}
                </span>
              </div>
            </div>
          </div>
          
          {(() => {
            const loggedInUser = localStorage.getItem('user');
            const user = loggedInUser ? JSON.parse(loggedInUser) : null;
            const isDonor = user && foodDetails.donorId && (String(user.id) === String(foodDetails.donorId));
            
            // Check NGO restriction - Admin and NGO can always claim NGO-only items
            const isNgoOnly = foodDetails.allowedRoles && foodDetails.allowedRoles.length === 1 && foodDetails.allowedRoles[0] === 'ngo';
            const canClaim = !isNgoOnly || (user && (user.role === 'ngo' || user.role === 'admin'));

            if (isDonor) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#92400e', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                    This is your donated listing
                  </div>
                  <button onClick={async () => {
                    try {
                      const res = await fetch(`/api/recipes/${id}/decrement`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quantity: foodDetails.quantity })
                      });
                      if (res.ok) {
                        setFoodDetails(prev => ({...prev, quantity: 0}));
                        showNotification('Item marked as out of stock.', 'success');
                      } else {
                        showNotification('Failed to update stock.', 'error');
                      }
                    } catch (err) {
                      showNotification('Network error.', 'error');
                    }
                  }} style={{ ...styles.claimBtn, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} disabled={foodDetails.quantity === 0}>
                    {foodDetails.quantity === 0 ? 'Out of Stock' : 'Mark as Out of Stock'}
                  </button>
                </div>
              );
            }

            if (!canClaim) {
              return (
                <div style={{ backgroundColor: '#f5f3ff', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #ddd6fe', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: '700', color: '#7c3aed' }}>Verified NGO Only</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#6d28d9' }}>This donation is reserved for local shelters and community kitchens.</p>
                </div>
              );
            }

            if (user && user.role === 'restaurant') {
              return (
                <div style={{ backgroundColor: '#fef2f2', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #fecaca', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: '700', color: '#dc2626' }}>Business Partner Restricted</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#991b1b' }}>As a business partner, your role is to donate surplus food. Claiming is reserved for individual contributors and NGOs.</p>
                </div>
              );
            }

            return (
              <button onClick={() => setShowConfirmModal(true)} style={styles.claimBtn} disabled={foodDetails.quantity === 0}>
                {foodDetails.quantity === 0 ? 'Out of Stock' : 'Claim This Meal'}
              </button>
            );
          })()}
        </div>
      </div>

      {showConfirmModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Confirm Reservation</h2>
            <p>You are about to reserve <strong>{foodDetails.title}</strong> for <strong>₹{parseFloat(foodDetails.price).toFixed(2)}</strong>.</p>
            
            <div style={{ margin: '2rem 0', textAlign: 'left' }}>
              <label style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'block' }}>Select Payment Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', 
                  borderRadius: '0.75rem', border: `2px solid ${paymentMethod === 'COD' ? '#10b981' : '#f1f5f9'}`,
                  backgroundColor: paymentMethod === 'COD' ? '#f0fdf4' : 'white', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ accentColor: '#10b981' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: '700', color: '#1e293b' }}>Cash on Delivery</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pay when you pick up your food</span>
                  </div>
                </label>
                <label style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', 
                  borderRadius: '0.75rem', border: `2px solid ${paymentMethod === 'UPI' ? '#10b981' : '#f1f5f9'}`,
                  backgroundColor: paymentMethod === 'UPI' ? '#f0fdf4' : 'white', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} style={{ accentColor: '#10b981' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: '700', color: '#1e293b' }}>UPI Transfer</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fast & secure digital payment</span>
                  </div>
                </label>
              </div>
            </div>

            <p style={styles.modalSubtext}>Please ensure you can pick it up before {foodDetails.availableUntil}.</p>
            <div style={styles.modalActions}>
              <button onClick={() => setShowConfirmModal(false)} style={styles.cancelBtn} disabled={isSubmitting}>Cancel</button>
              <button onClick={handleClaim} style={styles.confirmBtn} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Confirm & Claim"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImagePreview && (
        <div style={styles.previewOverlay} onClick={() => setShowImagePreview(false)}>
          <div style={styles.previewContainer}>
            <button style={styles.closePreviewBtn} onClick={() => setShowImagePreview(false)}>&times;</button>
            <img 
              src={foodDetails.image || `https://images.unsplash.com/photo-${foodDetails.id % 2 === 0 ? '1546069901-ba9599a7e63c' : '1567623481151-1cfad0929a4a'}?w=2000&auto=format&fit=crop&q=90`} 
              alt={foodDetails.title}
              style={styles.previewImg}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  centerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  backLink: { 
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
    transition: 'all 0.2s'
  },
  versionTag: { fontSize: '0.7rem', color: '#cbd5e1', letterSpacing: '1px' },
  card: { display: 'grid', gridTemplateColumns: 'minmax(400px, 1.2fr) 1fr', backgroundColor: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
  imageSection: { position: 'relative', height: '100%', minHeight: '500px' },
  heroImg: { width: '100%', height: '100%', objectFit: 'cover' },
  imgOverlay: { position: 'absolute', top: '20px', left: '20px' },
  badge: { backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  infoSection: { padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' },
  infoHead: { borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' },
  title: { fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: 1.1 },
  restaurant: { fontSize: '1.1rem', color: '#64748b', margin: 0 },
  restaurantName: { color: '#10b981', fontWeight: '700' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '1rem' },
  priceTags: { display: 'flex', alignItems: 'baseline', gap: '0.75rem' },
  currentPrice: { fontSize: '2.25rem', fontWeight: '900', color: '#0f172a' },
  oldPrice: { fontSize: '1.25rem', color: '#94a3b8' },
  savingsBadge: { backgroundColor: '#dcfce7', color: '#166534', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.9rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#334155', margin: '0 0 0.75rem 0' },
  descriptionText: { color: '#475569', lineHeight: 1.6, margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  statItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '0.75rem' },
  statIcon: { fontSize: '1.5rem' },
  statLabel: { display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' },
  statValue: { display: 'block', fontSize: '1rem', fontWeight: '700', color: '#0f172a' },
  claimBtn: { backgroundColor: '#10b981', color: 'white', padding: '1.25rem', borderRadius: '1rem', border: 'none', fontSize: '1.25rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)', padding: '2rem 1rem', overflowY: 'auto' },
  modal: { backgroundColor: 'white', padding: '2.5rem', borderRadius: '1.5rem', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', margin: 'auto' },
  modalSubtext: { color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' },
  modalActions: { display: 'flex', gap: '1rem', marginTop: '2rem' },
  cancelBtn: { flex: 1, padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' },
  confirmBtn: { flex: 1, padding: '1rem', borderRadius: '0.75rem', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: '700', cursor: 'pointer' },
  loadingText: { marginTop: '1rem', color: '#64748b', fontWeight: '500' },
  backBtn: { backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '600' },
  skeleton: {
    backgroundColor: 'var(--slate-200)',
    borderRadius: '0.5rem',
    background: 'linear-gradient(90deg, var(--slate-100) 25%, var(--slate-200) 50%, var(--slate-100) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  urgencyText: {
    color: 'var(--danger-500)',
    fontWeight: '800',
    fontSize: '0.85rem',
    marginLeft: '0.5rem',
  },
  previewOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11000,
    backdropFilter: 'blur(8px)',
    cursor: 'zoom-out'
  },
  previewContainer: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  previewImg: {
    maxWidth: '100%',
    maxHeight: '90vh',
    objectFit: 'contain',
    borderRadius: '0.75rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  closePreviewBtn: {
    position: 'absolute',
    top: '-40px',
    right: '-40px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '2.5rem',
    fontWeight: '300',
    cursor: 'pointer',
    padding: '10px',
    lineHeight: 1
  }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @media (max-width: 768px) {
    .closePreviewBtn {
       right: 0 !important;
       top: -50px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default RecipeDetails;

