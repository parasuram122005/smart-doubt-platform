const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_secret_key_here', {
    expiresIn: '7d',
  });
};

const formatUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  obj.id = obj._id;
  return obj;
};

// Register with institution details and optional file upload
router.post('/register', upload.single('idProof'), async (req, res) => {
  const { 
    name, email, password, role,
    institutionName, institutionId, department, institutionEmail,
    // Student-specific
    studentId, year, section, college,
    // Faculty-specific
    facultyId, designation, organization
  } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    // Check unique institution ID
    if (institutionId) {
      const idExists = await User.findOne({ institutionId });
      if (idExists) {
        return res.status(400).json({ success: false, message: 'This Institution ID is already registered.' });
      }
    }

    // Check unique student/faculty ID
    const userRole = role || 'student';
    if (userRole === 'student' && studentId) {
      const sidExists = await User.findOne({ studentId });
      if (sidExists) {
        return res.status(400).json({ success: false, message: 'This Student ID is already registered.' });
      }
    }
    if (userRole === 'faculty' && facultyId) {
      const fidExists = await User.findOne({ facultyId });
      if (fidExists) {
        return res.status(400).json({ success: false, message: 'This Faculty ID is already registered.' });
      }
    }

    // Build user object
    const userData = {
      name,
      email,
      password,
      role: userRole,
      institutionName: institutionName || '',
      institutionId: institutionId || undefined,
      department: department || 'CSE',
      institutionEmail: institutionEmail || '',
      verificationStatus: userRole === 'admin' ? 'verified' : 'pending',
    };

    // Role-specific fields
    if (userRole === 'student') {
      userData.studentId = studentId || undefined;
      userData.year = year || '';
      userData.section = section || '';
      userData.college = college || institutionName || '';
    } else if (userRole === 'faculty') {
      userData.facultyId = facultyId || undefined;
      userData.designation = designation || '';
      userData.organization = organization || institutionName || '';
    }

    // File upload
    if (req.file) {
      userData.idProofUrl = `/uploads/id-proofs/${req.file.filename}`;
    }

    const user = await User.create(userData);

    if (user) {
      if (userRole !== 'admin') {
         const admins = await User.find({ role: 'admin' });
         if (admins.length > 0) {
            const Notification = require('../models/Notification');
            const notifications = admins.map(admin => ({
              userId: admin._id,
              message: `Action Required: New ${userRole} "${user.name}" has registered and is awaiting verification.`
            }));
            await Notification.insertMany(notifications);
         }
      }

      res.status(201).json({
        success: true,
        message: userRole === 'admin' 
          ? 'Admin account created successfully.' 
          : 'Registration successful! Your account is pending verification.',
        token: generateToken(user._id),
        user: formatUser(user),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: formatUser(user),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: formatUser(req.user)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Update Presence
router.put('/presence', protect, async (req, res) => {
  try {
    req.user.isActive = true;
    req.user.lastActiveAt = new Date();
    await req.user.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

module.exports = router;
