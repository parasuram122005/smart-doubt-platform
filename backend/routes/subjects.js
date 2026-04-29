const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Subject = require('../models/Subject');

const router = express.Router();

// Public: Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find({}).sort({ subjectName: 1 });
    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Admin: Create subject
router.post('/', protect, authorize('admin'), async (req, res) => {
  const { subjectName, description } = req.body;
  try {
    const exists = await Subject.findOne({ subjectName });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Subject already exists' });
    }
    const subject = await Subject.create({ subjectName, description });
    res.status(201).json({ success: true, data: subject, message: 'Subject created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Admin: Delete subject
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    await subject.deleteOne();
    res.json({ success: true, message: 'Subject removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;
