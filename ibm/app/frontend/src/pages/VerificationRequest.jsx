import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const VerificationRequest = () => {
    const [user, setUser] = useState(null);
    const [documents, setDocuments] = useState([
        { name: 'Business License / NGO Registration', type: 'registration', link: '' },
        { name: 'Tax Identification / PAN', type: 'tax', link: '' }
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(loggedInUser);
        if (parsedUser.role === 'user') {
            showNotification('Verification is only available for Business Partners and NGOs.', 'error');
            setTimeout(() => navigate('/dashboard'), 2000);
            return;
        }
        setUser(parsedUser);
    }, [navigate]);

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const handleLinkChange = (index, value) => {
        const updatedDocs = [...documents];
        updatedDocs[index].link = value;
        setDocuments(updatedDocs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (documents.some(doc => !doc.link)) {
            showNotification('Please provide links for all required documents.', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/users/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    documents: documents
                })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('user', JSON.stringify(data.user));
                showNotification('Verification request submitted successfully!', 'success');
                setTimeout(() => {
                    navigate(user.role === 'ngo' ? '/ngo-dashboard' : '/dashboard');
                }, 2000);
            } else {
                showNotification('Failed to submit request.', 'error');
            }
        } catch (err) {
            showNotification('Network error.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div style={styles.container}>
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: '' })} 
            />
            
            <div style={styles.card}>
                <div style={styles.header}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 style={styles.title}>Partner Verification</h2>
                </div>

                <div style={styles.badgePreview}>
                    <div style={styles.badgeIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width: '32px', height: '32px', color: '#10b981'}}>
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div style={styles.badgeInfo}>
                        <h4 style={{margin: 0, color: '#0f172a'}}>Get Your Verified Badge</h4>
                        <p style={{margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b'}}>Verified partners build more trust and receive priority listing visibility.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <p style={styles.statusLabel}>
                        Current Status: <span style={{...styles.statusValue, color: user.verificationStatus === 'verified' ? '#10b981' : (user.verificationStatus === 'pending' ? '#f59e0b' : '#64748b')}}>
                            {user.verificationStatus ? user.verificationStatus.toUpperCase() : 'NONE'}
                        </span>
                    </p>

                    <div style={styles.docList}>
                        {documents.map((doc, index) => (
                            <div key={index} style={styles.docItem}>
                                <label style={styles.label}>{doc.name}</label>
                                <input 
                                    type="url" 
                                    placeholder="Paste document cloud link (G-Drive, Dropbox, etc.)"
                                    value={doc.link}
                                    onChange={(e) => handleLinkChange(index, e.target.value)}
                                    style={styles.input}
                                    required
                                    disabled={user.verificationStatus === 'pending' || user.verificationStatus === 'verified'}
                                />
                            </div>
                        ))}
                    </div>

                    <div style={styles.infoBox}>
                        <p style={{margin: 0, fontSize: '0.85rem', color: '#475569'}}>
                            <strong>Note:</strong> We currently accept cloud-hosted document links for verification. Our team will review these manually within 24-48 hours.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        style={{
                            ...styles.submitBtn,
                            opacity: (submitting || user.verificationStatus === 'pending' || user.verificationStatus === 'verified') ? 0.7 : 1,
                            cursor: (submitting || user.verificationStatus === 'pending' || user.verificationStatus === 'verified') ? 'not-allowed' : 'pointer'
                        }}
                        disabled={submitting || user.verificationStatus === 'pending' || user.verificationStatus === 'verified'}
                    >
                        {submitting ? 'Submitting...' : (
                            user.verificationStatus === 'verified' ? 'Already Verified' : 
                            (user.verificationStatus === 'pending' ? 'Request Pending' : 'Submit for Verification')
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '600px',
        margin: '2rem auto',
        padding: '0 1rem'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f1f5f9'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
    },
    backBtn: {
        padding: '0.6rem',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        backgroundColor: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b'
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
        color: '#0f172a'
    },
    badgePreview: {
        backgroundColor: '#f0fdf4',
        padding: '1.25rem',
        borderRadius: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        border: '1px solid #dcfce7'
    },
    badgeIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '1rem',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    statusLabel: {
        margin: 0,
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#64748b'
    },
    statusValue: {
        marginLeft: '4px'
    },
    docList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
    },
    docItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#334155'
    },
    input: {
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    infoBox: {
        backgroundColor: '#f8fafc',
        padding: '1rem',
        borderRadius: '0.75rem',
        border: '1px solid #f1f5f9'
    },
    submitBtn: {
        padding: '1rem',
        borderRadius: '1rem',
        border: 'none',
        backgroundColor: '#10b981',
        color: 'white',
        fontWeight: '700',
        fontSize: '1rem',
        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
        transition: 'transform 0.2s, box-shadow 0.2s'
    }
};

export default VerificationRequest;
