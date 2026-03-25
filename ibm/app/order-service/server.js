const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/foodwaste_orders';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Order Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.Mixed,
  userName: String,
  donorId: mongoose.Schema.Types.Mixed,
  recipeId: mongoose.Schema.Types.Mixed,
  quantity: Number,
  status: { type: String, default: 'pending' },
  claimerRole: { type: String, default: 'user' },
  reportReason: String,
  reportProof: String,
  reportProofImage: String,
  adminNote: String,
  paymentMethod: { type: String, default: 'COD' },
  timestamp: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

app.get('/health', (req, res) => res.json({ status: 'Order Service Alive' }));

// Get all orders
app.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders placed BY a specific user (claimant)
app.get('/user/:userId', async (req, res) => {
  try {
    const uid = req.params.userId;
    // Query both string and number versions to handle type mismatch
    const orders = await Order.find({ userId: { $in: [uid, parseInt(uid)] } }).sort({ timestamp: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// Get orders FOR a specific donor (incoming requests)
app.get('/donor/:donorId', async (req, res) => {
  try {
    const did = req.params.donorId;
    const orders = await Order.find({ donorId: { $in: [did, parseInt(did)] } }).sort({ timestamp: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donor orders' });
  }
});

// Report an order
app.post('/:id/report', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.status = 'reported';
    order.reportReason = req.body.reason || 'No reason provided';
    order.reportProof = req.body.proof || '';
    order.reportProofImage = req.body.proofImage || '';
    await order.save();

    // Notify donor about the report
    try {
      axios.post('http://notification-service:5004/notify', {
        userId: order.donorId,
        message: `Your listing for record #${order.recipeId} has been reported.`,
        type: 'ORDER_REPORTED',
        relatedId: order._id
      }).catch(e => console.error("Notification failed:", e.message));
    } catch (err) {}

    res.json({ message: 'Order reported successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to report order' });
  }
});

// ============ ADMIN ENDPOINTS ============

// Get all reported orders
app.get('/admin/reports', async (req, res) => {
  try {
    const reports = await Order.find({ status: 'reported' }).sort({ timestamp: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get all orders (admin)
app.get('/admin/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get admin stats
app.get('/admin/stats', async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: 'pending' });
    const approved = await Order.countDocuments({ status: 'approved' });
    const rejected = await Order.countDocuments({ status: 'rejected' });
    const reported = await Order.countDocuments({ status: 'reported' });
    const resolved = await Order.countDocuments({ status: 'resolved' });
    res.json({ total, pending, approved, rejected, reported, resolved });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Resolve a report (admin action)
app.post('/:id/resolve', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = 'resolved';
    order.adminNote = req.body.note || '';
    await order.save();

    // Increment donor report count upon admin resolve
    if (order.donorId) {
      try {
        await axios.put(`http://user-service:5001/${order.donorId}/report`);
      } catch (err) {
        console.error('Failed to update donor report count on resolve:', err.message);
      }
    }

    res.json({ message: 'Report resolved', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// Dismiss a report (admin sets it back to approved)
app.post('/:id/dismiss', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = 'approved';
    order.adminNote = req.body.note || 'Report dismissed by admin';
    await order.save();
    res.json({ message: 'Report dismissed', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dismiss report' });
  }
});

// Approve an order (donor accepts the request)
app.post('/:id/approve', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Order is not pending' });
    
    order.status = 'approved';
    await order.save();

    // Notify claimant
    try {
      axios.post('http://notification-service:5004/notify', {
        userId: order.userId,
        message: `Your request for "${order.recipeId}" has been approved!`,
        type: 'ORDER_APPROVED',
        relatedId: order._id
      }).catch(e => console.error("Notification failed:", e.message));
    } catch (err) {}

    res.json({ message: 'Order approved', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve order' });
  }
});

// Reject an order (donor declines, stock is restored)
app.post('/:id/reject', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Order is not pending' });
    
    order.status = 'rejected';
    await order.save();

    // Notify claimant
    try {
      axios.post('http://notification-service:5004/notify', {
        userId: order.userId,
        message: `Your request for #${order.recipeId} was unfortunately declined.`,
        type: 'ORDER_REJECTED',
        relatedId: order._id
      }).catch(e => console.error("Notification failed:", e.message));
    } catch (err) {}

    // Restore stock in recipe-service
    try {
      await axios.put(`http://recipe-service:5002/${order.recipeId}/increment`, { quantity: order.quantity });
    } catch (err) {
      console.error("Failed to restore stock:", err.response?.data || err.message);
    }

    res.json({ message: 'Order rejected and stock restored', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject order' });
  }
});

// Place a new order (status starts as 'pending' - awaiting donor approval)
app.post('/', async (req, res) => {
  try {
    const { userId, userName, donorId, recipeId, quantity, paymentMethod, claimerRole } = req.body;
    
    if (claimerRole === 'restaurant') {
      return res.status(403).json({ error: 'Unauthorized: Business Partners cannot claim food donations.' });
    }
    
    // Decrement stock in recipe-service first to "hold" the item
    try {
      await axios.put(`http://recipe-service:5002/${recipeId}/decrement`, { quantity });
    } catch (err) {
      console.error("Failed to decrement stock:", err.response?.data || err.message);
      return res.status(400).json({ error: err.response?.data?.error || 'Failed to update stock. Item might be sold out.' });
    }

    const newOrder = new Order({ 
      userId, 
      userName, 
      donorId, 
      recipeId, 
      quantity, 
      paymentMethod: paymentMethod || 'COD',
      claimerRole: req.body.claimerRole || 'user',
      status: 'pending' 
    });
    await newOrder.save();

    // Send notification to donor about new request
    try {
      axios.post('http://notification-service:5004/notify', {
        userId: donorId,
        message: `New request received for your food item!`,
        type: 'ORDER_PLACED',
        relatedId: newOrder._id
      }).catch(e => console.error("Notification Service not reachable"));
    } catch (err) {
      console.error(err);
    }

    res.status(201).json({ message: 'Reservation request sent! Waiting for donor approval.', order: newOrder });
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ 
      error: 'Failed to place order', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.listen(PORT, () => console.log(`Order Service listening on port ${PORT}`));
