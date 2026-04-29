const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Doubt = require('../models/Doubt');

const router = express.Router();

// Get profile stats
router.get('/profile-stats', protect, async (req, res) => {
  try {
    const role = req.user.role;
    let stats = {};
    if (role === 'student') {
      stats.doubtsPosted = await Doubt.countDocuments({ studentId: req.user._id });
      stats.doubtsResolved = await Doubt.countDocuments({ studentId: req.user._id, status: 'RESOLVED' });
    } else if (role === 'faculty') {
      stats.doubtsAnswered = await Doubt.countDocuments({ facultyId: req.user._id, status: 'RESOLVED' });
    } else if (role === 'admin') {
      stats.systemUsers = await User.countDocuments();
      stats.totalDoubts = await Doubt.countDocuments();
    }
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Admin: Get all users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Admin: Delete user and orphan their doubts
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Protection: Prevent Admin from deleting themselves accidentally
    if (userToDelete._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot self-delete administrative accounts' });
    }

    // Orphan records to maintain public knowledge base stability
    await Doubt.updateMany(
      { studentId: userToDelete._id },
      { $unset: { studentId: "" } }
    );
    await Doubt.updateMany(
      { facultyId: userToDelete._id },
      { $unset: { facultyId: "" } }
    );

    await userToDelete.deleteOne();

    res.json({ success: true, message: `User ${userToDelete.name} has been permanently deleted.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;
