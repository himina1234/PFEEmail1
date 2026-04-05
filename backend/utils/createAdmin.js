const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const admin = new User({
        nom: 'Administrateur',
        email: 'admin@example.com',
        matricule: 'ADMIN001',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      
      await admin.save();
      console.log('\n=================================');
      console.log('✅ Administrateur créé avec succès!');
      console.log('📝 Matricule: ADMIN001');
      console.log('🔑 Mot de passe: admin123');
      console.log('=================================\n');
    } else {
      console.log('👤 Administrateur déjà existant');
    }
  } catch (error) {
    console.error('Erreur création admin:', error);
  }
};

module.exports = createAdmin;