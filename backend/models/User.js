// ============ MODÈLE USER CORRIGÉ ============
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, default: '' },
  matricule: { type: String, unique: true, sparse: true }, // ← changed: required: false
  email: { type: String, required: true, unique: true },
  telephone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'apprenant', 'formateur'], 
    default: 'apprenant' 
  },
  formateurType: { 
    type: String, 
    enum: ['formateur', 'enseignant', null], 
    default: null 
  },
  isActive: { type: Boolean, default: false },
  isEmailValidated: { type: Boolean, default: false },
  validationToken: { type: String, default: null },
  status: { type: String, default: 'pending' },
  avatar: { type: String, default: null },
  dateNaissance: { type: Date, default: null },
  sexe: { type: String, default: null },
  adresse: { type: String, default: '' },
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Générer matricule automatiquement AVANT validation
userSchema.pre('validate', async function(next) {
  if (!this.matricule) {
    try {
      let prefix = 'APP';
      if (this.role === 'admin') prefix = 'ADM';
      else if (this.role === 'formateur') {
        if (this.formateurType === 'enseignant') prefix = 'ENS';
        else prefix = 'FRM';
      }
      
      const year = new Date().getFullYear();
      
      // Compter les utilisateurs existants avec le même préfixe
      let count = await mongoose.model('User').countDocuments({ 
        matricule: { $regex: `^${prefix}${year}` }
      });
      
      // Générer le matricule
      this.matricule = `${prefix}${year}${String(count + 1).padStart(4, '0')}`;
      
      console.log(`✅ Matricule généré: ${this.matricule}`);
    } catch (error) {
      console.error('Erreur génération matricule:', error);
      // Fallback: générer un matricule temporaire
      this.matricule = `TMP${Date.now()}`;
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);