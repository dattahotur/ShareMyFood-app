import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: ''
  });
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        showNotification('Registration successful! Please log in.', 'success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const data = await res.json();
        showNotification(data.error || 'Registration failed', 'error');
      }
    } catch (err) {
      showNotification('Network error. Please try again.', 'error');
    }
  };

  return (
    <div style={styles.container}>
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: '' })} 
      />
      <div style={styles.card}>
        <h2 style={styles.title}>Create an Account</h2>
        <p style={styles.subtitle}>Join ShareMyFood and make a difference</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name or Business Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input} 
              placeholder="John Doe / Joe's Bakery"
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input} 
              placeholder="you@example.com"
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input} 
              placeholder="••••••••"
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>I am a...</label>
            <select 
              name="role" 
              value={formData.role || 'user'} 
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="user">Regular User (Claimant)</option>
              <option value="restaurant">Food Donor (Restaurant/Store)</option>
              <option value="ngo">Local NGO (Shelter/Kitchen)</option>
            </select>
          </div>
          
          <button type="submit" style={styles.submitBtn}>Sign Up</button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  card: { backgroundColor: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' },
  title: { margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: '#0f172a', textAlign: 'center' },
  subtitle: { margin: '0 0 2rem 0', color: '#64748b', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.875rem', fontWeight: '500', color: '#334155' },
  input: { padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' },
  submitBtn: { backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: '600', fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem' },
  footer: { marginTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' },
  link: { color: '#10b981', fontWeight: '600', textDecoration: 'none' }
};

export default Register;
