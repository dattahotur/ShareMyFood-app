const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Diagnostic Logging
app.use((req, res, next) => {
  console.log(`[USER-SERVICE] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5001;

const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize users from file or defaults
let users = [];
try {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } else {
    users = [
      { id: 99, name: "Admin", email: "admin@gmail.com", password: "admin", role: "admin", reportCount: 0, status: "active", verificationStatus: "verified", verificationDocs: [] },
      { id: 100, name: "City Shelter", email: "ngo@gmail.com", password: "ngo", role: "ngo", reportCount: 0, status: "active", verificationStatus: "verified", verificationDocs: [] }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }
} catch (err) {
  console.error("Failed to load users:", err);
  users = [];
}

const saveUsers = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Failed to save users:", err);
  }
};

app.get('/health', (req, res) => res.json({ status: 'User Service Alive' }));

// Get all users
app.get('/', (req, res) => res.json(users.filter(u => u.status !== 'deleted')));

// Get all users (admin) — includes deleted
app.get('/admin/all', (req, res) => res.json(users));

// Get single user by id
app.get('/:id', (req, res) => {
  const user = users.find(u => String(u.id) === String(req.params.id));
  if (user) return res.json(user);
  res.status(404).json({ error: 'User not found' });
});

app.post('/register', (req, res) => {
  const newUser = { 
    id: users.length + 1, 
    ...req.body, 
    reportCount: 0, 
    status: "active",
    verificationStatus: "none",
    verificationDocs: []
  };
  users.push(newUser);
  saveUsers();
  res.status(201).json({ message: 'User registered', user: newUser });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.status !== 'deleted');
  if (user) {
    // Universal password check for all roles
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { password: pw, ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser });
  } else {
    res.status(401).json({ error: 'Invalid credentials or account deleted' });
  }
});

// Increment report count for a user (called by order-service)
app.put('/:id/report', (req, res) => {
  const user = users.find(u => String(u.id) === String(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.reportCount = (user.reportCount || 0) + 1;
  saveUsers(); // Added saveUsers()
  res.json({ message: 'Report count updated', user });
});

// Delete user account (admin only)
app.delete('/:id', (req, res) => {
  const user = users.find(u => String(u.id) === String(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.status = 'deleted';
  saveUsers();
  res.json({ message: 'User account deleted', user });
});

// Restore user account (admin only)
app.put('/:id/restore', (req, res) => {
  const user = users.find(u => String(u.id) === String(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.status = 'active';
  user.reportCount = 0;
  saveUsers();
  res.json({ message: 'User account restored', user });
});

// Get platform stats
app.get('/admin/stats', (req, res) => {
  const active = users.filter(u => u.status === 'active' && u.role !== 'admin');
  const deleted = users.filter(u => u.status === 'deleted');
  const restaurants = active.filter(u => u.role === 'restaurant');
  const regularUsers = active.filter(u => u.role === 'user');
  const ngos = active.filter(u => u.role === 'ngo');
  res.json({
    totalUsers: active.length,
    deletedUsers: deleted.length,
    restaurants: restaurants.length,
    regularUsers: regularUsers.length,
    ngos: ngos.length
  });
});

// Submit verification documents
app.post('/verify', (req, res) => {
  console.log('Received verification request for user:', req.body.userId);
  const { userId, documents } = req.body;
  const user = users.find(u => String(u.id) === String(userId));
  if (!user) {
    console.log('User not found for verification:', userId);
    return res.status(404).json({ error: 'User not found' });
  }
  
  user.verificationStatus = 'pending';
  user.verificationDocs = documents; // Expecting array of { name, url }
  saveUsers(); // Added saveUsers()
  res.json({ message: 'Verification requested', user });
});

// Admin: Get all verification requests
app.get('/admin/verifications', (req, res) => {
  const requests = users.filter(u => u.verificationStatus === 'pending');
  res.json(requests);
});

// Admin: Update verification status
app.put('/admin/verify/:id', (req, res) => {
  const { status } = req.body; // 'verified' or 'rejected'
  const user = users.find(u => String(u.id) === String(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.verificationStatus = status;
  saveUsers(); // Added saveUsers()
  res.json({ message: `User verification ${status}`, user });
});

// Catch-all for debugging
app.use((req, res) => {
  console.log(`[USER-SERVICE-404] ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found in User Service' });
});

app.listen(PORT, () => console.log(`User Service listening on port ${PORT}`));
