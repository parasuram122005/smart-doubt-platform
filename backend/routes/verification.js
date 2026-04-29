const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/verification - Get users pending verification
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ 
      verificationStatus: 'pending',
      role: { $ne: 'admin' }
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// PUT /api/verification/:id - Approve or reject a user (Update verification status)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, reason } = req.body; // Expecting status to be 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = {
        verificationStatus: status,
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
        rejectionReason: status === 'rejected' ? (reason || 'ID proof could not be verified.') : '',
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user, message: `${user.name} has been ${status}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;
