const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Aggressively drop existing admin mapping to permanently solve double-encryption/corrupt legacy states
    await User.deleteMany({ email: 'admin@platform.com' });

    console.log('Admin account database lock dropped. Re-seeding via pure Mongoose hooks...');
    const admin = new User({
      name: 'System Admin',
      email: 'admin@platform.com',
      password: 'admin123',
      role: 'admin',
      verificationStatus: 'verified',
      institutionName: 'Platform Central',
      department: 'Administration',
      adminId: 'ADMIN-001',
      roleLevel: 'super_admin'
    });
    
    await admin.save();
    console.log('Secure Default Admin initialized: admin@platform.com / admin123');

  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

module.exports = seedAdmin;
