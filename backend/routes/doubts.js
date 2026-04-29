const express = require('express');
const { protect, authorize, requireVerified } = require('../middleware/auth');
const Doubt = require('../models/Doubt');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateAnswer } = require('../services/aiService');
const Subject = require('../models/Subject');

const router = express.Router();

// Multer setup for doubt images
const uploadDir = path.join(__dirname, '..', 'uploads', 'doubts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doubt-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Public: Knowledge base (search resolved doubts)
router.get('/knowledge-base', async (req, res) => {
  const { search } = req.query;
  try {
    let query = { status: 'SOLVED' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    const doubts = await Doubt.find(query)
      .populate('subjectId', 'subjectName')
      .populate('studentId', 'name')
      .populate('facultyId', 'name isActive lastActiveAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: doubts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Admin: Get all doubts
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const doubts = await Doubt.find({})
      .populate('subjectId', 'subjectName')
      .populate('studentId', 'name')
      .populate('facultyId', 'name isActive lastActiveAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: doubts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Admin: Delete doubt
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }
    await doubt.deleteOne();
    res.json({ success: true, message: 'Doubt removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Faculty: Get open doubts OR doubts claimed by this faculty
router.get('/open', protect, authorize('faculty'), async (req, res) => {
  const { search } = req.query;
  try {
    const baseFilter = {
      $or: [
        { status: 'PENDING' },
        { status: 'AI_ANSWERED' },
        { status: 'CLAIMED', facultyId: req.user._id }
      ]
    };
    
    let query = { ...baseFilter };
    if (search) {
      query = {
        $and: [
          baseFilter,
          {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } }
            ]
          }
        ]
      };
    }

    const doubts = await Doubt.find(query)
      .populate('subjectId', 'subjectName')
      .populate('studentId', 'name email')
      .populate('facultyId', 'name isActive lastActiveAt')
      .populate('suggestions.studentId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: doubts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Faculty: Claim doubt
router.put('/claim/:id', protect, authorize('faculty'), async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }
    if (doubt.status !== 'PENDING' && doubt.status !== 'AI_ANSWERED') {
      return res.status(400).json({ success: false, message: 'Doubt is already claimed or resolved' });
    }
    doubt.status = 'CLAIMED';
    doubt.facultyId = req.user._id;
    const updatedDoubt = await doubt.save();
    
    // Notify student
    await Notification.create({
      userId: doubt.studentId,
      message: `Faculty ${req.user.name} has claimed your doubt: "${doubt.title}".`
    });

    const populated = await updatedDoubt.populate('facultyId', 'name isActive lastActiveAt');
    res.json({ success: true, data: populated, message: 'Doubt claimed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Faculty: Submit answer (requires verification)
router.put('/answer/:id', protect, authorize('faculty'), requireVerified, async (req, res) => {
  const { answer } = req.body;
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }
    if (doubt.status !== 'CLAIMED' || doubt.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You have not claimed this doubt' });
    }
    if (!answer) {
      return res.status(400).json({ success: false, message: 'Answer is required' });
    }
    doubt.status = 'SOLVED';
    doubt.answer = answer;
    const updatedDoubt = await doubt.save();

    // Notify student
    await Notification.create({
      userId: doubt.studentId,
      message: `Your doubt "${doubt.title}" has been answered by ${req.user.name}!`
    });

    res.json({ success: true, data: updatedDoubt, message: 'Doubt answered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Student: Get my resolved doubts
router.get('/my/resolved', protect, authorize('student'), async (req, res) => {
  const { search } = req.query;
  try {
    let query = { studentId: req.user._id, status: 'SOLVED' };
    if (search) {
      query = {
        $and: [
          { studentId: req.user._id, status: 'SOLVED' },
          {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } }
            ]
          }
        ]
      };
    }
    const doubts = await Doubt.find(query)
      .populate('subjectId', 'subjectName')
      .populate('facultyId', 'name isActive lastActiveAt')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: doubts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Faculty: Get doubts I resolved
router.get('/faculty/resolved', protect, authorize('faculty'), async (req, res) => {
  const { search } = req.query;
  try {
    let query = { facultyId: req.user._id, status: 'SOLVED' };
    if (search) {
      query = {
        $and: [
          { facultyId: req.user._id, status: 'SOLVED' },
          {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } }
            ]
          }
        ]
      };
    }
    const doubts = await Doubt.find(query)
      .populate('subjectId', 'subjectName')
      .populate('studentId', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: doubts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Student: Get my doubts
router.get('/my', protect, authorize('student'), async (req, res) => {
  const { search } = req.query;
  try {
    let query = { studentId: req.user._id };
    if (search) {
      query = {
        $and: [
          { studentId: req.user._id },
          {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } }
            ]
          }
        ]
      };
    }
    const doubts = await Doubt.find(query)
      .populate('subjectId', 'subjectName')
      .populate('facultyId', 'name isActive lastActiveAt')
      .populate('suggestions.studentId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: doubts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Student: Create doubt (requires verification) + AI Integration + Multer
router.post('/', protect, authorize('student'), requireVerified, upload.single('image'), async (req, res) => {
  const { subjectId, title, description, urgency } = req.body;
  try {
    if (!subjectId || !description) { // Title can be derived or required depending on UI, let's keep both required based on test cases
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    // Support creating Text-Only, Image-Only (with small title/desc proxy context since schema requires title/desc)
    // TCs require Image-only to succeed, so we handle missing title/desc gracefully if image is present
    const finalTitle = title || (req.file ? 'Image Doubt' : 'Untitled Doubt');
    const finalDescription = description || (req.file ? 'Please see the attached image.' : '');

    if (!finalTitle || !finalDescription) {
        return res.status(400).json({ success: false, message: 'Validation error: Empty submission not allowed.' });
    }

    let doubtData = {
      studentId: req.user._id,
      subjectId,
      title: finalTitle,
      description: finalDescription,
      urgency: urgency || 'medium',
      status: 'PENDING'
    };

    if (req.file) {
      doubtData.imageUrl = `/uploads/doubts/${req.file.filename}`;
    }

    // AI Check
    const subject = await Subject.findById(subjectId);
    if (subject && finalDescription.length > 5) {
        const aiResult = await generateAnswer(finalDescription, subject.subjectName);
        if (aiResult && aiResult.confidence === 'high') { // Similarity > 80% equivalent
            doubtData.aiAnswer = aiResult.answer;
            doubtData.aiConfidence = aiResult.confidence;
            doubtData.status = 'AI_ANSWERED';
        }
    }

    const doubt = new Doubt(doubtData);
    const createdDoubt = await doubt.save();
    const populated = await createdDoubt.populate('subjectId', 'subjectName');
    
    res.status(201).json({ success: true, data: populated, message: 'Doubt posted successfully' });
  } catch (error) {
    if (error.message.includes('Only JPG and PNG')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Student: Vote on an Answer (Faculty or AI)
router.post('/:id/vote', protect, authorize('student'), async (req, res) => {
    const { type } = req.body; // 'upvote' or 'downvote'
    try {
        if (!['upvote', 'downvote'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid vote type' });
        }

        const doubt = await Doubt.findById(req.params.id).populate('facultyId', 'name');
        if (!doubt) {
            return res.status(404).json({ success: false, message: 'Doubt not found' });
        }

        if (doubt.status !== 'SOLVED' && doubt.status !== 'AI_ANSWERED') {
            return res.status(400).json({ success: false, message: 'Can only vote on answered doubts' });
        }

        // Check for existing vote
        const existingVoteIndex = doubt.votes.voters.findIndex(v => v.userId.toString() === req.user._id.toString());

        if (existingVoteIndex !== -1) {
            const currentType = doubt.votes.voters[existingVoteIndex].type;
            if (currentType === type) {
                return res.status(400).json({ success: false, message: `You have already ${type}d this answer.` });
            }
            // Switch logic
            if (type === 'upvote') {
                doubt.votes.upvotes += 1;
                doubt.votes.downvotes -= 1;
            } else {
                doubt.votes.upvotes -= 1;
                doubt.votes.downvotes += 1;
            }
            doubt.votes.voters[existingVoteIndex].type = type;
        } else {
            // New vote
            if (type === 'upvote') doubt.votes.upvotes += 1;
            else doubt.votes.downvotes += 1;
            
            doubt.votes.voters.push({ userId: req.user._id, type });
        }

        await doubt.save();

        // Notification Integration Check
        if (type === 'upvote' && doubt.votes.upvotes === 5 && doubt.facultyId) {
            await Notification.create({
                userId: doubt.facultyId._id,
                message: `Congratulations! Your answer to "${doubt.title}" has reached 5 upvotes and is marked as Highly Trusted.`
            });
        }

        res.json({ success: true, data: doubt.votes, message: 'Vote successfully recorded' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
});

// Student: Post Peer Suggestion
router.post('/:id/suggest', protect, authorize('student'), async (req, res) => {
    const { answer } = req.body;
    try {
        if (!answer) return res.status(400).json({ success: false, message: 'Answer is required' });
        
        const doubt = await Doubt.findById(req.params.id);
        if(!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });
        
        doubt.suggestions.push({
            studentId: req.user._id,
            answer,
            status: 'pending'
        });
        
        await doubt.save();
        res.status(201).json({ success: true, message: 'Suggestion added!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
});

// Faculty: Review Peer Suggestion
router.put('/:id/suggest/:suggestionId', protect, authorize('faculty'), async (req, res) => {
    const { action } = req.body; // 'approve' or 'reject'
    try {
        const doubt = await Doubt.findById(req.params.id);
        if(!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });
        
        const suggestion = doubt.suggestions.id(req.params.suggestionId);
        if(!suggestion) return res.status(404).json({ success: false, message: 'Suggestion not found' });

        if (action === 'approve') {
            suggestion.status = 'verified';
            // Also add as answer potentially, or just mark it verified (test cases say "Approved -> marked verified")
        } else if (action === 'reject') {
            suggestion.status = 'rejected';
        }

        await doubt.save();
        res.json({ success: true, message: `Suggestion ${action}d` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
});

module.exports = router;
