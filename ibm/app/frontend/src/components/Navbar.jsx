import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState({ donations: false, orders: false, reports: false });
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(localStorage.getItem('user'));
    };
    handleAuthChange();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  useEffect(() => {
    const checkNotifications = async () => {
      if (!user) return;
      try {
        const userData = JSON.parse(user);
        const res = await fetch(`/api/notifications/${userData.id || userData._id}`);
        if (res.ok) {
          const allNotifs = await res.json();
          const unread = allNotifs.filter(n => !n.isRead);
          
          setNotifications({
            donations: unread.some(n => n.type === 'ORDER_PLACED'),
            orders: unread.some(n => n.type === 'ORDER_APPROVED' || n.type === 'ORDER_REJECTED'),
            reports: unread.some(n => n.type === 'ORDER_REPORTED')
          });
        }
      } catch (err) {
        console.error('Failed to check notifications:', err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); 
    return () => clearInterval(interval);
  }, [user]);

  const clearNotification = async (type) => {
    if (!user) return;
    try {
      const userData = JSON.parse(user);
      let apiType = '';
      if (type === 'donations') apiType = 'ORDER_PLACED';
      if (type === 'orders') apiType = 'ORDER_APPROVED'; // Note: simplified for example
      if (type === 'reports') apiType = 'ORDER_REPORTED';

      await fetch(`/api/notifications/${userData.id || userData._id}/read?type=${apiType}`, { 
        method: 'POST' 
      });
      setNotifications(prev => ({ ...prev, [type]: false }));
    } catch (err) {
      console.error('Failed to clear notification:', err);
    }
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    setMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  const MenuIcon = ({ d }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
      style={{ width: '22px', height: '22px', color: '#64748b', flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );

  return (
    <>
      <nav style={{
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            letterSpacing: '-0.5px',
            animation: 'fadeInDown 0.8s ease-out'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9'
            }}>
              <img src="/favicon.png" alt="Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
            </div>
            ShareMyFood
          </Link>

          {/* Hamburger Button */}


          <button 
            onClick={() => setMenuOpen(true)}
            className="hover-lift"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--slate-100)',
              color: 'var(--slate-800)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
              position: 'relative'
            }}
            aria-label="Open menu"
          >
            {(notifications.donations || notifications.reports || notifications.orders) && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '10px',
                height: '10px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                border: '2px solid white',
                zIndex: 1
              }} />
            )}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div 
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998
          }}
        />
      )}

      {/* Slide-Out Side Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '280px',
        backgroundColor: '#ffffff',
        zIndex: 9999,
        boxShadow: menuOpen ? '-8px 0 30px rgba(0,0,0,0.12)' : 'none',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Panel Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Menu</span>
          <button onClick={closeMenu} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
            padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '22px', height: '22px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Links */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem' }}>
          <Link to="/" onClick={closeMenu} style={linkStyle}>
            <MenuIcon d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            Home
          </Link>

          {(() => {
            const parsed = user ? JSON.parse(user) : null;
            if (parsed && parsed.role === 'ngo') return null;
            return (
              <Link to="/add-food" onClick={closeMenu} style={linkStyle}>
                <MenuIcon d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                Donate
              </Link>
            );
          })()}

          {user && (
            <>
              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.5rem 0.75rem' }} />

              <Link to="/my-orders" onClick={() => { closeMenu(); clearNotification('orders'); }} style={{ ...linkStyle, position: 'relative' }}>
                <MenuIcon d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                My Orders
                {notifications.orders && <div style={dotInMenuStyle} />}
              </Link>

              <Link to="/manage-donations" onClick={() => { closeMenu(); clearNotification('donations'); }} style={{ ...linkStyle, position: 'relative' }}>
                <MenuIcon d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                Manage Donations
                {notifications.donations && <div style={dotInMenuStyle} />}
              </Link>

              {(() => {
                const parsed = JSON.parse(user);
                const isNgo = parsed.role === 'ngo';
                return (
                  <Link to={isNgo ? "/ngo-dashboard" : "/dashboard"} onClick={closeMenu} style={linkStyle}>
                    <MenuIcon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    {isNgo ? "NGO Dashboard" : "Dashboard"}
                  </Link>
                );
              })()}

              {(() => {
                const parsed = JSON.parse(user);
                if (parsed.role === 'admin') return (
                  <Link to="/admin" onClick={() => { closeMenu(); clearNotification('reports'); }} style={{ ...linkStyle, backgroundColor: '#f5f3ff', color: '#7c3aed', position: 'relative' }}>
                    <MenuIcon d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    Admin Portal
                    {notifications.reports && <div style={dotInMenuStyle} />}
                  </Link>
                );
                return null;
              })()}

              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.5rem 0.75rem' }} />

              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.85rem 1rem', borderRadius: '0.75rem',
                background: 'none', border: 'none', color: '#ef4444',
                fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer',
                width: '100%', textAlign: 'left', fontFamily: 'inherit'
              }}>
                <MenuIcon d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                Log out
              </button>
            </>
          )}

          {!user && (
            <>
              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.5rem 0.75rem' }} />

              <Link to="/login" onClick={closeMenu} style={linkStyle}>
                <MenuIcon d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                Log in
              </Link>

              <Link to="/register" onClick={closeMenu} style={{
                ...linkStyle,
                backgroundColor: '#f0fdf4',
                color: '#15803d'
              }}>
                <MenuIcon d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.85rem 1rem',
  borderRadius: '0.75rem',
  textDecoration: 'none',
  color: '#334155',
  fontWeight: '600',
  fontSize: '0.95rem',
  transition: 'background-color 0.15s'
};

const dotInMenuStyle = {
  position: 'absolute',
  right: '1rem',
  width: '8px',
  height: '8px',
  backgroundColor: '#ef4444',
  borderRadius: '50%',
  border: '1.5px solid white'
};

export default Navbar;
