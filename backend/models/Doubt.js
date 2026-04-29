const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'AI_ANSWERED', 'CLAIMED', 'SOLVED'], default: 'PENDING' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  answer: { type: String, default: '' },
  aiAnswer: { type: String, default: '' },
  aiConfidence: { type: String, enum: ['high', 'medium', 'low', 'none'], default: 'none' },
  aiFeedback: { type: String, enum: ['helpful', 'not_helpful', null], default: null },
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  imageUrl: { type: String, default: '' },
  votes: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voters: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: { type: String, enum: ['upvote', 'downvote'] }
    }]
  },
  suggestions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answer: { type: String, required: true },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

doubtSchema.index({ title: 'text', description: 'text' });
doubtSchema.index({ createdAt: -1 });
doubtSchema.index({ status: 1 });

const Doubt = mongoose.model('Doubt', doubtSchema);
module.exports = Doubt;
