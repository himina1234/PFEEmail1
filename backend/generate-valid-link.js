// generate-valid-link.js
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gestion_utilisateurs';

const userSchema = new mongoose.Schema({
  email: String,
  matricule: String,
  nom: String,
  prenom: String
});

const User = mongoose.model('User', userSchema);

async function generateLink() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    const user = await User.findOne({ email: "mounaxnadjat@gmail.com" });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    // Générer un vrai token JWT
    const token = jwt.sign(
      { email: user.email, matricule: user.matricule },
      process.env.JWT_SECRET || 'secret_key_2026',
      { expiresIn: '7d' }
    );
    
    const validLink = `http://localhost:5000/api/auth/validate-account?email=${user.email}&token=${token}`;
    
    console.log('\n🔗 LIEN DE VALIDATION VALIDE :\n');
    console.log(validLink);
    console.log('\n' + '='.repeat(80));
    console.log('👉 Copiez ce lien et collez-le dans votre navigateur');
    console.log('='.repeat(80) + '\n');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

generateLink();