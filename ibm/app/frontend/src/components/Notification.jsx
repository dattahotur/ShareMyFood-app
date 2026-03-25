import React, { useEffect, useState } from 'react';

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '24px', height: '24px'}}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '24px', height: '24px'}}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '24px', height: '24px'}}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

const Notification = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade-out animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message && !isVisible) return null;

  const getStyle = () => {
    let bgColor = '#3b82f6'; // info blue
    if (type === 'success') bgColor = '#10b981';
    if (type === 'error') bgColor = '#ef4444';

    return {
      position: 'fixed',
      top: '24px',
      right: '24px',
      padding: '1rem 1.25rem',
      borderRadius: '0.75rem',
      backgroundColor: 'white',
      color: '#0f172a',
      fontWeight: '600',
      fontSize: '0.95rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      borderLeft: `4px solid ${bgColor}`,
      zIndex: 99999,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      maxWidth: '400px',
    };
  };

  const getIconColor = () => {
    if (type === 'success') return '#10b981';
    if (type === 'error') return '#ef4444';
    return '#3b82f6';
  };

  return (
    <div style={getStyle()}>
      <div style={{ color: getIconColor(), display: 'flex', alignItems: 'center' }}>
        {type === 'success' ? <SuccessIcon /> : type === 'error' ? <ErrorIcon /> : <InfoIcon />}
      </div>
      <div>{message}</div>
    </div>
  );
};

export default Notification;
