// backend/migration-update-status.js
const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  matricule: String,
  email: String,
  telephone: String,
  password: String,
  role: String,
  isActive: { type: Boolean, default: true },
  status: { type: String, default: 'actif' },
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function migrateUsers() {
  try {
    console.log('🔄 Début de la migration des utilisateurs...');
    
    // Connexion à MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_utilisateurs';
    await mongoose.connect(mongoURI);
    console.log('✅ Connecté à MongoDB');
    
    // Mettre à jour tous les utilisateurs pour avoir le champ status
    const result = await User.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'actif', isActive: true } }
    );
    
    console.log(`✅ ${result.modifiedCount} utilisateurs mis à jour avec le champ "status"`);
    
    // Afficher tous les utilisateurs après mise à jour
    const users = await User.find({}).select('nom prenom matricule status isActive role');
    console.log('\n📋 Liste des utilisateurs après migration:');
    console.log('='.repeat(70));
    users.forEach(user => {
      const statusIcon = user.status === 'actif' ? '🟢' : '🔴';
      console.log(`${statusIcon} ${user.nom} ${user.prenom} | ${user.matricule} | Rôle: ${user.role} | Status: ${user.status} | isActive: ${user.isActive}`);
    });
    console.log('='.repeat(70));
    console.log(`\n📊 Total: ${users.length} utilisateur(s)`);
    
    await mongoose.disconnect();
    console.log('\n✅ Migration terminée avec succès !');
    console.log('💡 Maintenant, les comptes inactifs ne pourront plus se connecter.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateUsers();