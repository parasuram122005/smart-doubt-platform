const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Doubt = require('../models/Doubt');
const Subject = require('../models/Subject');

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const faculty = await User.countDocuments({ role: 'faculty' });
    const admins = await User.countDocuments({ role: 'admin' });
    const pendingVerification = await User.countDocuments({ verificationStatus: 'pending', role: { $ne: 'admin' } });

    const totalDoubts = await Doubt.countDocuments();
    const openDoubts = await Doubt.countDocuments({ status: { $in: ['PENDING', 'AI_ANSWERED'] } });
    const claimedDoubts = await Doubt.countDocuments({ status: 'CLAIMED' });
    const resolvedDoubts = await Doubt.countDocuments({ status: 'SOLVED' });

    const totalSubjects = await Subject.countDocuments();

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, students, faculty, admins, pendingVerification },
        doubts: { total: totalDoubts, open: openDoubts, claimed: claimedDoubts, resolved: resolvedDoubts },
        subjects: totalSubjects,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;
