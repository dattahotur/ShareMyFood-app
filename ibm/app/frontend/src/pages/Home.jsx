import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Bakery', 'Meals', 'Groceries', 'Vegan'];

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/recipes');
        if (res.ok) {
          const data = await res.json();
          setRecipes(data);
        }
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.heroBadge}>Eco-friendly choices</span>
          <h1 style={styles.title}>Rescue Food, <br/><span style={styles.textGradient}>Share Joy</span></h1>
          <p style={styles.subtitle}>
            A community platform connecting you with delicious surplus food at incredible prices. Eat well and help the planet.
          </p>
          
          <div style={styles.searchContainer}>
            <div style={styles.searchBox}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'20px', height:'20px', marginRight:'0.75rem', color:'var(--slate-400)'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search for restaurants or food..." 
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const el = document.getElementById('listings');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <section style={styles.features}>
        <div style={styles.featureCard}>
          <div style={styles.icon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'40px',height:'40px',color:'#10b981'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          </div>
          <h3>For Restaurants</h3>
          <p>List unsold, perfectly good food at the end of the day. Reduce waste, recover costs, and help the community.</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.icon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'40px',height:'40px',color:'#10b981'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <h3>For Community</h3>
          <p>Discover locally available surplus food at discounted prices. Eat well while doing good for the planet.</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.icon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'40px',height:'40px',color:'#10b981'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64" />
            </svg>
          </div>
          <h3>Environmental Impact</h3>
          <p>Every meal rescued is a step towards a greener planet. Track your impact on CO2 emissions saved.</p>
        </div>
      </section>

      <section id="listings" style={styles.recentListings}>
        <div style={styles.listingHeader}>
          <h2>Available Near You</h2>
          <div style={styles.categoryPills}>
            {categories.map(category => (
              <button 
                key={category} 
                onClick={() => setActiveCategory(category)}
                style={activeCategory === category ? styles.activePill : styles.pill}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div style={{...styles.grid, opacity: recipes.length === 0 ? 0.5 : 1}}>
          {(() => {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const filteredRecipes = recipes.filter(r => {
              const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesCategory = activeCategory === 'All' ? true : (r.category && r.category === activeCategory) || r.title.toLowerCase().includes(activeCategory.toLowerCase());
              const timeLeft = r.expiryTimestamp ? r.expiryTimestamp - Date.now() : 0;
              const isNotExpired = !r.expiryTimestamp || timeLeft > 0;
              const isAllowed = currentUser.role === 'admin' || currentUser.role === 'restaurant' || !r.allowedRoles || r.allowedRoles.includes(currentUser.role || 'user');
              return matchesSearch && matchesCategory && isNotExpired && isAllowed;
            });

            if (filteredRecipes.length === 0) {
              return (
                <div style={styles.emptyState}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'48px',height:'48px',color:'#94a3b8',marginBottom:'1rem'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <h3>No food found</h3>
                  <p>We couldn't find any listings matching your search. Try different keywords or categories.</p>
                  <button onClick={() => { setSearchTerm(''); setActiveCategory('All'); }} style={styles.secondaryBtn}>Clear Filters</button>
                </div>
              );
            }

            return filteredRecipes.map(recipe => {
              const timeLeft = recipe.expiryTimestamp ? recipe.expiryTimestamp - Date.now() : 0;
              const isFreeSoon = currentUser.role === 'ngo' && timeLeft > 0 && timeLeft <= 30 * 60 * 1000;

              return (
                <Link 
                  key={recipe.id} 
                  to={`/food/${recipe.id}`} 
                  style={styles.placeholderCard}
                  className="food-card hover-lift"
                  data-testid={`food-card-${recipe.id}`}
                >
                  <div style={styles.cardImgContainer}>
                    <img 
                      src={recipe.image || `https://images.unsplash.com/photo-${recipe.id % 2 === 0 ? '1546069901-ba9599a7e63c' : '1567623481151-1cfad0929a4a'}?w=500&auto=format&fit=crop&q=80`}
                      alt={recipe.title}
                      style={styles.cardImg}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'; }}
                    />
                    <div style={styles.locationBadge}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px',marginRight:'4px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {recipe.distance || '0.5 km'}
                    </div>
                    {recipe.quantity === 0 && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        backgroundColor: '#ef4444', color: 'white', padding: '0.4rem 0.75rem',
                        borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: '800',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}>OUT OF STOCK</div>
                    )}
                    {recipe.allowedRoles && recipe.allowedRoles.length === 1 && recipe.allowedRoles[0] === 'ngo' && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        backgroundColor: '#581c87', color: 'white', padding: '0.4rem 0.75rem',
                        borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: '800',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{width: '12px', height: '12px'}}>
                          <path d="M8.5 4.466V1.75a.75.75 0 0 0-1.5 0v2.716C4.12 4.966 2 7.234 2 10a6 6 0 1 0 12 0c0-2.766-2.12-5.034-5-5.534ZM8 14.5A4.5 4.5 0 0 1 3.5 10c0-2.152 1.513-3.951 3.522-4.401a.75.75 0 0 0 .5-.716V1.75h.956v3.133a.75.75 0 0 0 .5.716c2.009.45 3.522 2.249 3.522 4.401a4.501 4.501 0 0 1-4.5 4.5Z" />
                        </svg>
                        NGO ONLY
                      </div>
                    )}
                    {isFreeSoon && (
                      <div style={{
                        position: 'absolute', top: '12px', left: '12px',
                        backgroundColor: '#7c3aed', color: 'white', padding: '0.4rem 0.75rem',
                        borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: '800',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', animation: 'pulse-glow 2s infinite'
                      }}>FREE FOR NGOs SOON</div>
                    )}
                  </div>
                  <div style={{...styles.cardContent, opacity: recipe.quantity === 0 ? 0.7 : 1}}>
                    <h4>{recipe.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <p style={{ margin: 0 }}>{recipe.restaurant}</p>
                      {recipe.donorVerified && (
                        <span style={{ 
                          display: 'flex', alignItems: 'center', backgroundColor: '#ecfdf5', color: '#059669', 
                          borderRadius: '4px', padding: '1px 4px', fontSize: '0.65rem', fontWeight: '800', border: '1px solid #d1fae5'
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{width: '10px', height: '10px', marginRight: '2px'}}>
                            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 1 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                          </svg>
                          VERIFIED
                        </span>
                      )}
                      {recipe.isNGOPreferred && (
                        <span style={{ 
                          display: 'flex', alignItems: 'center', backgroundColor: '#f5f3ff', color: '#7c3aed', 
                          borderRadius: '4px', padding: '1px 4px', fontSize: '0.65rem', fontWeight: '800', border: '1px solid #ddd6fe'
                        }}>
                          NGO PREFERRED
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0 }}>Available until {recipe.availableUntil}</p>
                    {recipe.expiryTimestamp && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>Freshness Timeline</span>
                          <span className={((recipe.expiryTimestamp - Date.now()) / 3600000) < 2 ? 'pulse-red' : ''}>
                            {(() => {
                              const totalMinutes = Math.floor((recipe.expiryTimestamp - Date.now()) / 60000);
                              const h = Math.floor(totalMinutes / 60);
                              const m = totalMinutes % 60;
                              return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
                            })()}
                          </span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.max(0, Math.min(100, ((recipe.expiryTimestamp - Date.now()) / (recipe.expiryTimestamp - (recipe.createdAt || (recipe.expiryTimestamp - 3600000)))) * 100))}%`,
                            background: 'linear-gradient(90deg, #ef4444 0%, #10b981 100%)',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease-out'
                          }} />
                        </div>
                      </div>
                    )}
                    <div style={styles.cardFooter}>
                      <span style={styles.price}>
                        ₹{parseFloat(recipe.discountPrice || recipe.price || 0).toFixed(2)} 
                        {recipe.originalPrice && <del style={{ marginLeft: '4px', color: '#94a3b8', fontSize: '0.9rem' }}>₹{parseFloat(recipe.originalPrice).toFixed(2)}</del>}
                      </span>
                      <span style={styles.claimBtn}>View Details</span>
                    </div>
                  </div>
                </Link>
              );
            });
          })()}
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4rem',
  },
  hero: {
    padding: '6rem 0',
    display: 'flex',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom, var(--slate-50), white)',
    borderRadius: '2rem',
    marginBottom: '2rem',
  },
  heroContent: {
    textAlign: 'center',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  heroBadge: {
    backgroundColor: 'var(--primary-50)',
    color: 'var(--primary-600)',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontWeight: '700',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    border: '1px solid var(--primary-100)',
  },
  title: {
    fontSize: '4.5rem',
    fontWeight: '900',
    color: 'var(--slate-900)',
    margin: 0,
    lineHeight: '1.1',
    letterSpacing: '-1px',
  },
  textGradient: {
    background: 'linear-gradient(135deg, var(--primary-500), #0ea5e9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--slate-500)',
    maxWidth: '600px',
    lineHeight: '1.6',
    margin: '0 auto',
  },
  searchContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    width: '100%',
    maxWidth: '600px',
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '0.5rem 1.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
    border: '1px solid var(--slate-100)',
  },
  searchIcon: {
    fontSize: '1.2rem',
    marginRight: '0.75rem',
    color: 'var(--slate-400)',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '1rem',
    padding: '0.75rem 0',
    color: 'var(--slate-800)',
    background: 'transparent',
  },
  primaryBtn: {
    backgroundColor: 'var(--slate-900)',
    color: 'white',
    padding: '0 2rem',
    borderRadius: '1rem',
    fontWeight: '600',
    fontSize: '1.1rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  secondaryBtn: {
    backgroundColor: 'white',
    color: 'var(--slate-800)',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: '600',
    border: '1px solid var(--slate-200)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  icon: {
    fontSize: '3rem',
    backgroundColor: '#ecfdf5',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  listingHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  categoryPills: {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
    scrollbarWidth: 'none', /* Firefox */
    msOverflowStyle: 'none',  /* IE and Edge */
  },
  pill: {
    padding: '0.6rem 1.25rem',
    borderRadius: '9999px',
    border: '1px solid var(--slate-200)',
    backgroundColor: 'white',
    color: 'var(--slate-600)',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  activePill: {
    padding: '0.6rem 1.25rem',
    borderRadius: '9999px',
    border: '1px solid var(--slate-900)',
    backgroundColor: 'var(--slate-900)',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  emptyState: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
    backgroundColor: 'var(--slate-50)',
    borderRadius: '1.5rem',
    gap: '1rem',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
  },
  placeholderCard: {
    backgroundColor: 'white',
    borderRadius: '1.25rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    color: 'inherit',
    border: '1px solid #f1f5f9',
  },
  cardImgContainer: {
    height: '200px',
    backgroundColor: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  locationBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(4px)',
    padding: '0.4rem 0.75rem',
    borderRadius: '0.75rem',
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#0f172a',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
  cardContent: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '0.5rem',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
  },
  price: {
    fontWeight: '800',
    fontSize: '1.3rem',
    color: '#0f172a',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'baseline',
  },
  claimBtn: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  }
};

export default Home;
