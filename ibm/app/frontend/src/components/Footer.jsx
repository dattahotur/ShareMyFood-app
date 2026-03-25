import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          <div style={styles.brandCol}>
            <div style={styles.logoGroup}>
              <span style={styles.logoIconBg}><span style={styles.logoIcon}>🌍</span></span>
              <h3 style={styles.title}>ShareMyFood</h3>
            </div>
            <p style={styles.tagline}>Reducing food waste, one delicious meal at a time. Join the movement.</p>
          </div>
          
          <div style={styles.linkCol}>
            <h4 style={styles.colTitle}>Platform</h4>
            <ul style={styles.list}>
              <li style={styles.listItem}>Browse Food</li>
              <li style={styles.listItem}>Donate Excess</li>
              <li style={styles.listItem}>Impact Tracking</li>
            </ul>
          </div>
          
          <div style={styles.linkCol}>
            <h4 style={styles.colTitle}>Company</h4>
            <ul style={styles.list}>
              <li style={styles.listItem}>About Us</li>
              <li style={styles.listItem}>Careers</li>
              <li style={styles.listItem}>Contact</li>
            </ul>
          </div>
        </div>
        
        <div style={styles.bottomBar}>
          <p style={styles.copyright}>© {new Date().getFullYear()} ShareMyFood Platform. All rights reserved.</p>
          <div style={styles.legalLinks}>
            <span style={styles.legalItem}>Privacy Policy</span>
            <span style={styles.legalItem}>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: 'white',
    borderTop: '1px solid var(--slate-200)',
    padding: '4rem 0 2rem 0',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: '4rem',
    marginBottom: '4rem',
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '300px',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoIconBg: {
    backgroundColor: 'var(--primary-100)',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: '1.2rem',
  },
  title: {
    color: 'var(--slate-900)',
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '800',
  },
  tagline: {
    margin: 0,
    fontSize: '0.95rem',
    color: 'var(--slate-500)',
    lineHeight: 1.6,
  },
  linkCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  colTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--slate-900)',
    margin: 0,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  listItem: {
    color: 'var(--slate-500)',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  bottomBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--slate-200)',
    paddingTop: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  copyright: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--slate-500)',
  },
  legalLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  legalItem: {
    fontSize: '0.85rem',
    color: 'var(--slate-500)',
    cursor: 'pointer',
  }
};

export default Footer;
