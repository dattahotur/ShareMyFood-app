import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    discountPrice: '',
    quantity: 1,
    availableFor: 4,
    distance: '',
    category: 'Meals',
    isNGOOnly: false,
    isNGOPreferred: false
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image must be under 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(loggedInUser);
      if (parsedUser.role === 'ngo') {
        showNotification('NGOs are restricted to claiming food, not donating.', 'error');
        setTimeout(() => navigate('/ngo-dashboard'), 2000);
      } else {
        setUser(parsedUser);
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.role === 'ngo') {
      showNotification('Unauthorized: NGOs cannot list food items.', 'error');
      return;
    }

    if (!imagePreview) {
      showNotification('Please upload a photo of the food.', 'error');
      return;
    }

    try {
      const hours = parseFloat(formData.availableFor) || 4;
      const expiryTimestamp = Date.now() + (hours * 3600000);
      const availableUntilDate = new Date(expiryTimestamp);
      const availableUntilStr = availableUntilDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const allowedRoles = formData.isNGOOnly ? ['ngo'] : ['user', 'ngo'];

      const payload = { 
        ...formData, 
        restaurant: user.name,
        donorId: user.id,
        donorRole: user.role,
        donorVerified: user.verificationStatus === 'verified',
        availableUntil: availableUntilStr,
        expiryTimestamp: expiryTimestamp,
        createdAt: Date.now(),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.discountPrice) + 5,
        price: parseFloat(formData.discountPrice),
        distance: formData.distance || "0.5 km",
        quantity: parseInt(formData.quantity),
        category: formData.category,
        image: imagePreview,
        allowedRoles: allowedRoles,
        isNGOPreferred: formData.isNGOPreferred
      };
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showNotification('Food item successfully listed!', 'success');
        setTimeout(() => navigate('/'), 2000);
      } else {
        showNotification('Failed to list food item', 'error');
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
      <h2 style={styles.header}>Donate Excess Food</h2>
      <p style={styles.subheader}>Help reduce waste by listing your available food for the community.</p>
      
      <form onSubmit={handleSubmit} style={styles.formContainer}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Food Item / Bundle Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} required placeholder="e.g. End of Day Pastry Box" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} style={{...styles.input, minHeight: '100px'}} required placeholder="What's included in this listing?" />
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Original Value (₹)</label>
            <input type="number" step="any" name="originalPrice" value={formData.originalPrice} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Discounted Price (₹)</label>
            <input type="number" step="any" name="discountPrice" value={formData.discountPrice} onChange={handleChange} style={styles.input} required />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Quantity Available</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} style={styles.input} min="1" required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Available for (hours)</label>
            <input type="number" step="any" name="availableFor" value={formData.availableFor} onChange={handleChange} style={styles.input} required min="0.1" />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Location / Distance (e.g. 1.2 km away)</label>
          <input type="text" name="distance" value={formData.distance} onChange={handleChange} style={styles.input} required placeholder="e.g. 1.2 km" />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Type of Food</label>
          <select name="category" value={formData.category} onChange={handleChange} style={styles.input}>
            <option value="Meals">Meals</option>
            <option value="Bakery">Bakery & Pastries</option>
            <option value="Groceries">Groceries & Produce</option>
            <option value="Vegan">Vegan/Vegetarian</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{...styles.formGroup, flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #bcf0da', flex: 'none' }}>
          <input 
            type="checkbox" 
            name="isNGOOnly" 
            checked={formData.isNGOOnly} 
            onChange={(e) => setFormData({...formData, isNGOOnly: e.target.checked})}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <div>
            <label style={{ fontWeight: '700', color: '#15803d', display: 'block' }}>Reserved for Local NGOs / Shelters</label>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>Only verified NGO accounts can claim this listing.</p>
          </div>
        </div>

        <div style={{...styles.formGroup, flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#f5f3ff', borderRadius: '0.75rem', border: '1px solid #ddd6fe', flex: 'none' }}>
          <input 
            type="checkbox" 
            name="isNGOPreferred" 
            checked={formData.isNGOPreferred} 
            onChange={(e) => setFormData({...formData, isNGOPreferred: e.target.checked})}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <div>
            <label style={{ fontWeight: '700', color: '#7c3aed', display: 'block' }}>Tag as NGO Preferred</label>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6d28d9' }}>Highlight this item as particularly suitable for charity organizations.</p>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Food Photo (required)</label>
          <div style={{ border: '2px dashed #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer', position: 'relative' }}
            onClick={() => document.getElementById('food-photo-input').click()}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '0.5rem' }} />
            ) : (
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '40px', height: '40px', color: '#94a3b8', margin: '0 auto' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                <p style={{ color: '#64748b', margin: '0.5rem 0 0', fontWeight: '500' }}>Click to upload a photo of the food</p>
                <p style={{ color: '#94a3b8', margin: '0.25rem 0 0', fontSize: '0.8rem' }}>Max 5MB, JPG/PNG</p>
              </div>
            )}
            <input id="food-photo-input" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>
        </div>

        <button type="submit" style={styles.submitBtn}>List Food Item</button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  header: { marginTop: 0, marginBottom: '0.5rem', color: '#0f172a' },
  subheader: { color: '#64748b', marginBottom: '2rem' },
  formContainer: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  row: { display: 'flex', gap: '1.5rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  label: { fontWeight: '600', fontSize: '0.875rem', color: '#1e293b' },
  input: { 
    width: '100%',
    boxSizing: 'border-box',
    padding: '1rem', 
    border: '1px solid #e2e8f0', 
    borderRadius: '0.75rem', 
    fontFamily: 'inherit', 
    fontSize: '1rem', 
    backgroundColor: '#f8fafc', 
    transition: 'border-color 0.2s', 
    outline: 'none' 
  },
  submitBtn: { 
    background: 'linear-gradient(135deg, var(--primary-500) 0%, #0ea5e9 100%)', 
    color: 'white', 
    padding: '1.25rem', 
    border: 'none', 
    borderRadius: '1rem', 
    fontSize: '1.15rem', 
    fontWeight: '700', 
    cursor: 'pointer', 
    marginTop: '1.5rem',
    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
    transition: 'transform 0.2s' 
  }
};

export default AddRecipe;
