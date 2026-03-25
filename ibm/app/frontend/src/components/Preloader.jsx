import React, { useState, useEffect } from 'react';

const Preloader = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 800);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff', // Clean white theme
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: isVisible ? 1 : 0,
      overflow: 'hidden'
    }}>
      <style>
        {`
          @keyframes bloomReveal {
            0% { transform: scale(0.8); opacity: 0; filter: blur(10px); }
            100% { transform: scale(1); opacity: 1; filter: blur(0); }
          }
          @keyframes softPulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            70% { transform: scale(1.02); box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          @keyframes textSlideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes loadingBar {
            0% { width: 0%; left: 0; }
            50% { width: 100%; left: 0; }
            100% { width: 0%; left: 100%; }
          }
        `}
      </style>

      {/* Organic Background Pulse */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
        animation: 'softPulse 4s infinite ease-in-out'
      }} />
      
      {/* Logo Container */}
      <div style={{
        width: '130px',
        height: '130px',
        borderRadius: '28px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
        animation: 'bloomReveal 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        marginBottom: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <img src="/favicon.png" alt="Logo" style={{ width: '85px', height: '85px', objectFit: 'contain' }} />
      </div>

      {/* Brand Identification */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#0f172a',
          margin: 0,
          letterSpacing: '-1.5px',
          animation: 'textSlideUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.2s forwards',
          opacity: 0
        }}>
          ShareMyFood
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          fontWeight: '500',
          marginTop: '0.5rem',
          animation: 'textSlideUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.4s forwards',
          opacity: 0
        }}>
          Reducing waste, sharing love.
        </p>
      </div>

      {/* Premium Minimal Loading Bar */}
      <div style={{
        marginTop: '4rem',
        width: '120px',
        height: '3px',
        backgroundColor: '#f1f5f9',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          height: '100%',
          backgroundColor: '#10b981',
          animation: 'loadingBar 2.5s infinite ease-in-out'
        }} />
      </div>
    </div>
  );
};

export default Preloader;
