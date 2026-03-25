import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useNavigationGuard from '../hooks/useNavigationGuard';

const NGODashboard = () => {
  const navigate = useNavigate();
  useNavigationGuard();
  const [userName, setUserName] = useState('NGO Partner');
  const [metrics, setMetrics] = useState({ meals: 0, co2: 0, peopleFed: 0 });
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) {
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(loggedInUser);
      if (user.role !== 'ngo' && user.role !== 'admin') {
        navigate('/dashboard'); // Normal users go to regular dashboard
        return;
      }
      setUserName(user.name);

      try {
        setLoading(true);
        // Fetch NGO's Claims
        const ordersRes = await fetch(`/api/orders/user/${user.id}`);
        const ordersData = await ordersRes.json();
        
        // Fetch All Recipes for details
        const recipesRes = await fetch(`/api/recipes`);
        const recipesData = await recipesRes.json();
        
        const recipeMap = {};
        recipesData.forEach(r => recipeMap[r.id] = r);

        let mealsCount = 0;
        const validClaims = [];

        ordersData.forEach(order => {
          const recipe = recipeMap[order.recipeId];
          if (recipe) {
            mealsCount += order.quantity;
            validClaims.push({ ...order, recipe });
          }
        });

        setMetrics({
          meals: mealsCount,
          co2: (mealsCount * 2.5).toFixed(1),
          peopleFed: mealsCount // Estimation: 1 meal per person
        });

        setRecentClaims(validClaims.slice(0, 5));

      } catch (err) {
        console.error("NGO Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={backLinkStyle}>&larr; Home</button>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px' }}>
            <h1 style={styles.title}>NGO Impact Portal: <span style={styles.textGradient}>{userName}</span></h1>
            {JSON.parse(localStorage.getItem('user') || '{}').verificationStatus === 'verified' && (
              <span style={{ 
                display: 'flex', alignItems: 'center', backgroundColor: '#f5f3ff', color: '#7c3aed', 
                borderRadius: '999px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #ddd6fe'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{width: '14px', height: '14px', marginRight: '4px'}}>
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 1 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                </svg>
                VERIFIED PARTNER
              </span>
            )}
          </div>
          <p style={styles.subtitle}>Directing surplus food to those who need it most.</p>
        </div>
      </header>

      {JSON.parse(localStorage.getItem('user') || '{}').verificationStatus !== 'verified' && (
        <div style={{
          backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1.25rem', padding: '1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '0.75rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: '24px', height: '24px', color: '#64748b'}}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#0f172a' }}>Gain Trusted Partner Status</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                {JSON.parse(localStorage.getItem('user') || '{}').verificationStatus === 'pending' 
                  ? 'Your NGO credentials are being reviewed by our verification team.' 
                  : 'Verify your NGO registration to unlock priority distribution and the "Verified" badge.'}
              </p>
            </div>
          </div>
          {JSON.parse(localStorage.getItem('user') || '{}').verificationStatus !== 'pending' && (
            <Link to="/verify-partner" style={{
              backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '0.6rem 1.25rem',
              borderRadius: '0.75rem', color: '#0f172a', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>Verify Now &rarr;</Link>
          )}
        </div>
      )}

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIconBg, backgroundColor: '#f0fdf4'}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#10b981" style={{width: '28px', height: '28px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.866 8.281 8.281 0 0 0 3 .001Z" />
            </svg>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{metrics.meals}</span>
            <span style={styles.statLabel}>Total Meals Rescued</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconBg, backgroundColor: '#fdf2f8'}}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#db2777" style={{width: '28px', height: '28px'}}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
             </svg>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{metrics.peopleFed}</span>
            <span style={styles.statLabel}>People Fed</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIconBg, backgroundColor: '#eff6ff'}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#3b82f6" style={{width: '28px', height: '28px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 0-7.5h-.75a6 6 0 0 0-11.25 0 4.5 4.5 0 0 0-6 4.5Z" />
            </svg>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{metrics.co2} kg</span>
            <span style={styles.statLabel}>Carbon Emissions Saved</span>
          </div>
        </div>
      </section>

      <section style={styles.recentSection}>
        <div style={styles.sectionHeader}>
          <h2>Recent Rescues</h2>
          <Link to="/my-orders" style={styles.viewAllBtn}>History & Tracking</Link>
        </div>
        
        <div style={styles.claimsList}>
          {recentClaims.length > 0 ? recentClaims.map((claim, i) => (
            <div key={i} style={styles.claimCard}>
              <div style={styles.claimInfo}>
                <span style={styles.claimDate}>{new Date(claim.timestamp).toLocaleDateString()}</span>
                <h3 style={styles.claimTitle}>{claim.recipe.title}</h3>
                <p style={styles.donorInfo}>Donor: {claim.recipe.restaurant}</p>
              </div>
              <div style={styles.statusBox}>
                <span style={styles.quantityBadge}>{claim.quantity} Meals</span>
                <span style={claim.status === 'completed' ? styles.statusSucceeded : styles.statusPending}>
                    {claim.status === 'pending' ? 'Ready for Pickup' : claim.status}
                </span>
              </div>
            </div>
          )) : (
            <div style={styles.emptyContainer}>
              <p>No rescues logged yet. Check the Home page for surplus food!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '3rem', minHeight: '80vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' },
  title: { fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', margin: 0 },
  textGradient: { background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#64748b', margin: '0.25rem 0 0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' },
  statCard: { backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
  statIconBg: { width: '64px', height: '64px', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statValue: { fontSize: '1.75rem', fontWeight: '900', color: '#0f172a' },
  statLabel: { fontSize: '0.9rem', color: '#64748b', fontWeight: '600' },
  recentSection: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  claimsList: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  claimCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' },
  claimDate: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
  claimTitle: { margin: '0.25rem 0', color: '#1e293b' },
  donorInfo: { margin: 0, fontSize: '0.9rem', color: '#64748b' },
  statusBox: { textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  quantityBadge: { fontWeight: '800', fontSize: '1.1rem', color: '#1e293b' },
  statusPending: { color: '#d97706', backgroundColor: '#fffbeb', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' },
  statusSucceeded: { color: '#059669', backgroundColor: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' },
  emptyContainer: { padding: '4rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '1.5rem', color: '#64748b' },
  viewAllBtn: { color: '#7c3aed', fontWeight: '700', textDecoration: 'none' }
};

const backLinkStyle = {
  backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '999px', cursor: 'pointer', fontWeight: '700', color: '#64748b'
};

export default NGODashboard;
