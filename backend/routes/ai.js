const express = require('express');
const { protect } = require('../middleware/auth');
const { generateAnswer } = require('../services/aiService');
const Doubt = require('../models/Doubt');

const router = express.Router();

// POST /api/ai/answer — Generate AI answer for a question
router.post('/answer', protect, async (req, res) => {
  const { question, doubtId, subjectName } = req.body;

  if (!question || question.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Question must be at least 5 characters.' });
  }

  try {
    const result = await generateAnswer(question.trim(), subjectName || '');

    // If a doubtId is provided, save the AI answer to the doubt
    if (doubtId) {
      await Doubt.findByIdAndUpdate(doubtId, {
        aiAnswer: result.answer,
        aiConfidence: result.confidence,
      });
    }

    res.json({
      success: true,
      data: {
        answer: result.answer,
        confidence: result.confidence,
        sources: result.sources,
      }
    });
  } catch (error) {
    console.error('AI answer endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI answer.' });
  }
});

// POST /api/ai/feedback — Submit feedback on an AI answer
router.post('/feedback', protect, async (req, res) => {
  const { doubtId, feedback } = req.body;

  if (!doubtId || !['helpful', 'not_helpful'].includes(feedback)) {
    return res.status(400).json({ success: false, message: 'Invalid feedback data.' });
  }

  try {
    await Doubt.findByIdAndUpdate(doubtId, { aiFeedback: feedback });
    res.json({ success: true, message: 'Feedback recorded. Thank you!' });
  } catch (error) {
    console.error('AI feedback error:', error);
    res.status(500).json({ success: false, message: 'Failed to save feedback.' });
  }
});

module.exports = router;
