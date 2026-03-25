import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useNavigationGuard from '../hooks/useNavigationGuard';

const Dashboard = () => {
  const navigate = useNavigate();
  useNavigationGuard();
  const [userName, setUserName] = useState('User');
  const [metrics, setMetrics] = useState({ meals: 0, co2: 0, money: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) {
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(loggedInUser);
      setUserName(user.name);

      try {
        setLoading(true);
        // Fetch User's Orders
        const ordersRes = await fetch(`/api/orders/user/${user.id}`);
        const ordersData = await ordersRes.json();
        
        // Fetch All Recipes
        const recipesRes = await fetch(`/api/recipes`);
        const recipesData = await recipesRes.json();
        
        const recipeMap = {};
        recipesData.forEach(r => recipeMap[r.id] = r);

        // Calculate accurate metrics
        let mealsCount = 0;
        let moneySaved = 0;
        const validOrders = [];

        ordersData.forEach(order => {
          if (order.status !== 'reported') {
            const recipe = recipeMap[order.recipeId];
            if (recipe) {
              mealsCount += order.quantity;
              moneySaved += (recipe.originalPrice - recipe.price) * order.quantity;
              validOrders.push({ ...order, recipe });
            }
          }
        });

        setMetrics({
          meals: mealsCount,
          co2: (mealsCount * 2.5).toFixed(1), // 2.5kg CO2 per meal
          money: moneySaved.toFixed(2),
          heroPoints: mealsCount * 10 // 10 points per meal
        });

        // Top 3 recent valid activities
        setRecentActivity(validOrders.slice(0, 3));

      } catch (err) {
        console.error("Dashboard fetch error:", err);
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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1.5rem' }}>
        <button onClick={() => navigate('/')} style={backLinkStyle}>
          &larr; Back to Home
        </button>
        <div style={{ textAlign: 'right', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ ...styles.title, margin: 0 }}>Welcome back, <span style={styles.textGradient}>{userName}</span></h1>
            {JSON.parse(localStorage.getItem('user') || '{}').verificationStatus === 'verified' && (
              <span style={{ 
                display: 'flex', alignItems: 'center', backgroundColor: '#ecfdf5', color: '#059669', 
                borderRadius: '999px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #d1fae5'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{width: '14px', height: '14px', marginRight: '4px'}}>
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 1 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                </svg>
                VERIFIED PARTNER
              </span>
            )}
          </div>
          <p style={{ ...styles.subtitle, margin: 0 }}>Your real-time impact on the community.</p>
        </div>
      </header>

      {(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role === 'restaurant' && user.verificationStatus !== 'verified' && (
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
                <h4 style={{ margin: 0, color: '#0f172a' }}>Increase Your Trust Score</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {user.verificationStatus === 'pending' 
                    ? 'Your verification request is currently being reviewed by our team.' 
                    : 'Submit your business documents to get the "Verified" trust badge.'}
                </p>
              </div>
            </div>
            {user.verificationStatus !== 'pending' && (
              <Link to="/verify-partner" style={{
                backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '0.6rem 1.25rem',
                borderRadius: '0.75rem', color: '#0f172a', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>Get Verified &rarr;</Link>
            )}
          </div>
        );
      })()}

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconBg}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '28px', height: '28px', color: '#10b981'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.866 8.281 8.281 0 0 0 3 .001Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22.5c-5.385 0-9.75-4.365-9.75-9.75s4.365-9.75 9.75-9.75 9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75Z" />
            </svg>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{metrics.meals}</span>
            <span style={styles.statLabel}>Meals Rescued</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconBg}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '28px', height: '28px', color: '#10b981'}}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25.75h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25.75h7.5A1.125 1.125 0 0 1 19.5 19.5v.001" />
            </svg>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{metrics.co2} kg</span>
            <span style={styles.statLabel}>CO₂ Saved</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconBg}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '28px', height: '28px', color: '#10b981'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>₹{metrics.money}</span>
            <span style={styles.statLabel}>Money Saved</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIconBg}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '28px', height: '28px', color: '#10b981'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{metrics.heroPoints}</span>
            <span style={styles.statLabel}>Hero Points</span>
          </div>
        </div>
      </section>

      <section style={styles.recentSection}>
        <div style={styles.sectionHeader}>
          <h2>Recent Reservations</h2>
          <Link to="/my-orders" style={styles.viewAllBtn}>View All History</Link>
        </div>
        
        <div style={styles.activityList}>
          {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
            <div key={i} style={styles.activityCard}>
              <div style={styles.activityDetails}>
                <div style={styles.activityDate}>{new Date(activity.timestamp).toLocaleString()}</div>
                <h3 style={styles.activityTitle}>{activity.recipe.title}</h3>
                <p style={styles.activityRestaurant}>{activity.recipe.restaurant}</p>
              </div>
              <div style={styles.activityStatus}>
                <span style={activity.status === 'completed' ? styles.statusBadgeCompleted : styles.statusBadge}>
                  {activity.status === 'pending' ? 'Reserved' : activity.status}
                </span>
                <span style={styles.activityPrice}>₹{parseFloat(activity.recipe.price * activity.quantity).toFixed(2)}</span>
              </div>
            </div>
          )) : (
            <div style={{padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '1rem'}}>
              <p style={{color: '#64748b'}}>No recent activity yet. Go save some food!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem', minHeight: '80vh' },
  header: { marginBottom: '3rem' },
  title: { fontSize: '3rem', fontWeight: '800', color: 'var(--slate-900)', margin: '0 0 0.5rem 0', letterSpacing: '-1px' },
  textGradient: { background: 'linear-gradient(135deg, var(--primary-500), #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { fontSize: '1.1rem', color: 'var(--slate-500)', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '4rem' },
  statCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid var(--slate-100)', transition: 'transform 0.2s' },
  statIconBg: { backgroundColor: 'var(--primary-50)', width: '60px', height: '60px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statValue: { fontSize: '1.5rem', fontWeight: '800', color: 'var(--slate-900)', lineHeight: 1.2 },
  statLabel: { fontSize: '0.9rem', color: 'var(--slate-500)', fontWeight: '500' },
  recentSection: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  viewAllBtn: { textDecoration: 'none', backgroundColor: 'transparent', border: 'none', color: 'var(--primary-600)', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  activityCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--slate-100)' },
  activityDetails: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  activityDate: { fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: '500' },
  activityTitle: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--slate-900)' },
  activityRestaurant: { margin: 0, fontSize: '0.95rem', color: 'var(--slate-500)' },
  activityStatus: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' },
  statusBadge: { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' },
  statusBadgeCompleted: { backgroundColor: '#dcfce7', color: '#15803d', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' },
  activityPrice: { fontWeight: '800', fontSize: '1.1rem', color: 'var(--slate-900)' }
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

export default Dashboard;
