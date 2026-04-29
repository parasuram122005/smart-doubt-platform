const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true, unique: true },
  description: { type: String }
}, {
  timestamps: true
});

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;
