const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Common Fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'suspended', 'on_leave'], default: 'active' },

  // Availability Fields
  isActive: { type: Boolean, default: false },
  lastActiveAt: { type: Date, default: Date.now },

  // Institution Details
  institutionName: { type: String, default: '' },
  institutionId: { type: String, sparse: true },
  department: { type: String, default: 'CSE' },
  institutionEmail: { type: String, default: '' },

  // Student Fields
  studentId: { type: String, unique: true, sparse: true },
  year: { type: String, enum: ['1st', '2nd', '3rd', '4th', ''] },
  section: { type: String },
  college: { type: String },

  // Faculty Fields
  facultyId: { type: String, unique: true, sparse: true },
  designation: { type: String },
  
  // Admin Fields
  adminId: { type: String, unique: true, sparse: true },
  roleLevel: { type: String, enum: ['super_admin', 'moderator'] },
  
  // Shared Organizational Fields
  organization: { type: String },

  // Verification Fields
  idProofUrl: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },

}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
