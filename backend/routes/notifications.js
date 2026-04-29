const express = require('express');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

const router = express.Router();

// Get My Notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Dispatch a Raven (Student to Faculty)
router.post('/raven', protect, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    // Find all faculty members
    const facultyMembers = await User.find({ role: 'faculty' });
    
    // Create a notification for each faculty
    const ravenNotifications = facultyMembers.map(faculty => ({
      userId: faculty._id,
      senderId: req.user._id,
      message: `URGENT RAVEN from ${req.user.name}: ${message}`,
      type: 'raven',
      read: false
    }));

    if (ravenNotifications.length > 0) {
      await Notification.insertMany(ravenNotifications);
    }

    res.json({ success: true, message: 'Raven dispatched to all faculty.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Faculty Reply to a Raven
router.post('/raven/reply/:id', protect, async (req, res) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage) return res.status(400).json({ success: false, message: 'Reply message is required' });

    const originalRaven = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
    if (!originalRaven) {
      return res.status(404).json({ success: false, message: 'Raven not found' });
    }

    if (!originalRaven.senderId) {
      return res.status(400).json({ success: false, message: 'Original sender unknown. Cannot reply.' });
    }

    // Send the reply back to the student
    await Notification.create({
      userId: originalRaven.senderId,
      senderId: req.user._id,
      message: `RAVEN REPLY from ${req.user.name}: ${replyMessage}`,
      type: 'raven_reply',
      read: false
    });

    // Mark the original raven as read
    originalRaven.read = true;
    await originalRaven.save();

    res.json({ success: true, message: 'Reply dispatched.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Mark as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;
