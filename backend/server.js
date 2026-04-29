const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const doubtRoutes = require('./routes/doubts');
const subjectRoutes = require('./routes/subjects');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

const notificationRoutes = require('./routes/notifications');
const verificationRoutes = require('./routes/verification');

app.use('/api/notifications', notificationRoutes);
app.use('/api/verification', verificationRoutes);

// Database Connection
const seedSubjects = require('./utils/seedSubjects');
const seedKnowledge = require('./utils/seedKnowledge');
const seedAdmin = require('./utils/seedAdmin');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_doubt_db')
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin();
    await seedSubjects();
    await seedKnowledge();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
