const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_doubt_db')
  .then(async () => {
    console.log('MongoDB connected for seeding identities.');

    const students = await User.find({ role: 'student' });
    for (let i = 0; i < students.length; i++) {
        if (!students[i].studentId) {
            students[i].studentId = `STU2024${i.toString().padStart(3, '0')}`;
            students[i].department = 'Computer Science & Engineering';
            students[i].year = '3rd';
            students[i].section = 'A';
            students[i].college = 'Institute of Technology';
            students[i].status = 'active';
            await students[i].save();
        }
    }

    const faculties = await User.find({ role: 'faculty' });
    for (let i = 0; i < faculties.length; i++) {
        if (!faculties[i].facultyId) {
            faculties[i].facultyId = `FAC201${i.toString().padStart(3, '0')}`;
            faculties[i].department = 'Computer Science & Engineering';
            faculties[i].designation = 'Assistant Professor';
            faculties[i].organization = 'Institute of Technology';
            faculties[i].status = 'active';
            await faculties[i].save();
        }
    }

    const admins = await User.find({ role: 'admin' });
    for (let i = 0; i < admins.length; i++) {
        if (!admins[i].adminId) {
            admins[i].adminId = `ADM100${i.toString().padStart(3, '0')}`;
            admins[i].organization = 'Institute of Technology';
            admins[i].roleLevel = 'super_admin';
            admins[i].status = 'active';
            await admins[i].save();
        }
    }

    console.log('Identities successfully seeded for existing users.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
