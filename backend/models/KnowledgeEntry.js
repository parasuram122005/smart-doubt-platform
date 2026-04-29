const mongoose = require('mongoose');

const knowledgeEntrySchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  subject: { type: String, required: true },
  tags: [{ type: String }],
}, {
  timestamps: true
});

knowledgeEntrySchema.index({ question: 'text', answer: 'text', subject: 'text' });

const KnowledgeEntry = mongoose.model('KnowledgeEntry', knowledgeEntrySchema);
module.exports = KnowledgeEntry;
