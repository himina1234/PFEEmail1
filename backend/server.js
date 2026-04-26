// backend/server.js - Version corrigée (supprimez les doublons et remplacez par ceci)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
// Dossier uploads - À ajouter APRÈS les middlewares
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ============ ROUTES ============
const cahierSuiviRoutes = require('./routes/cahierSuiviRoutes');

// ============ MIDDLEWARES ============
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ SERVICE EMAIL ============
class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== '') {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 30000,
          socketTimeout: 30000
        });
        console.log('✅ Service email initialisé avec SMTP (mode RÉEL)');
        console.log(`   📧 Envoi depuis: ${process.env.SMTP_USER}`);
      } else {
        console.log('⚠️ SMTP non configuré - Mode SIMULATION activé');
        this.transporter = null;
      }
    } catch (error) {
      console.error('❌ Erreur initialisation SMTP:', error.message);
      this.transporter = null;
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      console.log(`\n📧 [SIMULATION] Email à: ${to}`);
      console.log(`   Sujet: ${subject}`);
      return { success: true, simulated: true };
    }

    try {
      console.log(`📧 Envoi email réel à ${to}...`);
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Plateforme Formation" <noreply@plateforme-formation.dz>',
        to,
        subject,
        html,
      });
      console.log(`✅ Email envoyé à ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Erreur envoi email à ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeValidationEmail(user, temporaryPassword) {
    const validationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/validate-account?email=${encodeURIComponent(user.email)}&token=${user.validationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Bienvenue</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px;">
            <h2>Bienvenue ${user.prenom} ${user.nom} !</h2>
          </div>
          <div style="padding: 20px;">
            <p><strong>📧 Email:</strong> ${user.email}</p>
            <p><strong>🆔 Matricule:</strong> ${user.matricule}</p>
            <p><strong>🔑 Mot de passe temporaire:</strong></p>
            <div style="background: #2d3748; color: #68d391; font-size: 20px; padding: 10px; border-radius: 8px;">${temporaryPassword}</div>
            <a href="${validationLink}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px;">✅ Valider mon compte</a>
          </div>
        </div>
      </body>
      </html>
    `;
    return await this.sendEmail(user.email, '🎉 Bienvenue sur la Plateforme de Formation', html);
  }

  async sendAccountActivatedEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Compte activé</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 15px;">
            <h2>✅ Compte activé !</h2>
          </div>
          <div style="padding: 20px;">
            <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
            <p>Votre compte a été activé par l'administrateur.</p>
            <p><strong>📧 Email:</strong> ${user.email}</p>
            <p><strong>🆔 Matricule:</strong> ${user.matricule}</p>
            <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px;">🔐 Se connecter</a>
          </div>
        </div>
      </body>
      </html>
    `;
    return await this.sendEmail(user.email, '✅ Votre compte a été activé !', html);
  }

  // NOUVEAU: Email à l'admin quand un utilisateur valide son compte
  async sendAdminNotificationForValidation(user) {
    const adminDashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/users`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Nouvel utilisateur à activer</title></head>
      <body style="font-family: Arial, sans-serif; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #ff9800 0%, #f44336 100%); color: white; padding: 20px; border-radius: 15px; text-align: center;">
            <h2>👤 Nouvel utilisateur à activer</h2>
          </div>
          <div style="padding: 20px;">
            <p>Un utilisateur a validé son adresse email et attend votre activation.</p>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <p><strong>👤 Nom complet:</strong> ${user.prenom} ${user.nom}</p>
              <p><strong>📧 Email:</strong> ${user.email}</p>
              <p><strong>🆔 Matricule:</strong> ${user.matricule}</p>
              <p><strong>👔 Rôle:</strong> ${user.role}</p>
              <p><strong>📅 Date d'inscription:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${adminDashboardLink}" style="display: inline-block; background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 10px;">
                📋 Activer ce compte
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
              Cette notification a été envoyée automatiquement suite à la validation d'email par l'utilisateur.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return await this.sendEmail(user.email, `👤 ${user.prenom} ${user.nom} a validé son email - En attente d'activation`, html);
  }
}

const emailService = new EmailService();

// Dossier uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.mkdirSync(path.join(uploadDir, 'avatars'), { recursive: true });
}

// ============ MODÈLE USER ============
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, default: '' },
  matricule: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'apprenant', 'formateur'], default: 'apprenant' },
  formateurType: { type: String, enum: ['formateur', 'enseignant', null], default: null },
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

userSchema.pre('save', async function(next) {
  if (!this.matricule) {
    let prefix = 'APP';
    if (this.role === 'admin') prefix = 'ADM';
    else if (this.role === 'formateur') {
      prefix = this.formateurType === 'enseignant' ? 'ENS' : 'FRM';
    }
    const year = new Date().getFullYear();
    const count = await mongoose.model('User').countDocuments({ matricule: { $regex: `^${prefix}${year}` } });
    this.matricule = `${prefix}${year}${String(count + 1).padStart(4, '0')}`;
    console.log(`📝 Matricule généré: ${this.matricule}`);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// ============ AUTRES MODÈLES ============
const ChatHistory = mongoose.model('ChatHistory', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{ role: String, content: String, timestamp: Date }],
  createdAt: { type: Date, default: Date.now }
}));

const Formation = mongoose.model('Formation', new mongoose.Schema({
  titre: String, description: String, domaine: String, duree: String,
  prerequis: String, debouches: String, wilayas: [String],
  placesDisponibles: Number, dateDebut: Date, formateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}));

const Inscription = mongoose.model('Inscription', new mongoose.Schema({
  apprenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  formationId: { type: mongoose.Schema.Types.ObjectId, ref: "Formation" },
  formationTitre: String, formationDomaine: String,
  statut: { type: String, enum: ["en_attente", "confirmee", "refusee"], default: "en_attente" }
}, { timestamps: true }));

const Notification = mongoose.model('Notification', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, title: String, message: String, data: Object, read: { type: Boolean, default: false }
}));

// ============ MIDDLEWARES ============
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token manquant' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_2026');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userFormateurType = decoded.formateurType;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ success: false, message: 'Admin requis' });
  next();
};

const upload = multer({ storage: multer.memoryStorage() });
const uploadAvatar = multer({ dest: 'uploads/avatars/' });

// ============ CONNEXION MONGODB ============
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gestion_utilisateurs')
  .then(() => {
    console.log('✅ MongoDB connecté');
    fixAdminEmail();
  })
  .catch(err => console.error('❌ MongoDB error:', err.message));

const fixAdminEmail = async () => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (admin && admin.email === 'admin@algerieposte.dz') {
      admin.email = 'mounaxnadjat@gmail.com';
      await admin.save();
      console.log('✅ Email administrateur corrigé automatiquement');
      console.log(`   Nouvel email: ${admin.email}`);
    }
  } catch (error) {
    console.error('❌ Erreur correction email admin:', error.message);
  }
};

// ============ ROUTES DE TEST ============
app.get('/', (req, res) => res.json({ status: 'online' }));
app.get('/api/test', (req, res) => res.json({ message: 'API OK' }));

// ============ ROUTES D'AUTHENTIFICATION ============
app.post('/api/auth/setup-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return res.json({ success: true, message: 'Admin existe', credentials: { matricule: adminExists.matricule, password: 'admin123' } });
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      nom: 'Administrateur', prenom: 'Super', email: 'mounaxnadjat@gmail.com',
      telephone: '021000000', password: hashedPassword, role: 'admin',
      isActive: true, isEmailValidated: true, status: 'active'
    });
    await admin.save();
    res.json({ success: true, message: '✅ Admin créé', credentials: { matricule: admin.matricule, password: 'admin123' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { matricule, password } = req.body;
    console.log('🔐 Tentative:', matricule);
    
    const user = await User.findOne({ matricule });
    if (!user) return res.status(401).json({ success: false, message: 'Matricule ou mot de passe incorrect' });
    if (!user.isEmailValidated) return res.status(403).json({ success: false, message: '❌ Veuillez valider votre email', code: 'EMAIL_NOT_VALIDATED' });
    if (!user.isActive) return res.status(403).json({ success: false, message: '⏳ Compte en attente d\'activation', code: 'PENDING_APPROVAL' });
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ success: false, message: 'Matricule ou mot de passe incorrect' });
    
    const token = jwt.sign({ userId: user._id, role: user.role, formateurType: user.formateurType }, process.env.JWT_SECRET || 'secret_key_2026', { expiresIn: '7d' });
    user.lastLogin = new Date();
    await user.save();
    
    res.json({ success: true, token, user: { id: user._id, nom: user.nom, prenom: user.prenom, matricule: user.matricule, email: user.email, role: user.role, formateurType: user.formateurType, isActive: user.isActive, isEmailValidated: user.isEmailValidated } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTE DE VALIDATION D'EMAIL (CORRIGÉE) ============
app.get('/api/auth/validate-account', async (req, res) => {
  try {
    const { email, token } = req.query;
    
    console.log(`🔍 Tentative validation: ${email}`);
    
    if (!email || !token) {
      console.log('❌ Paramètres manquants');
      return res.redirect(`${process.env.FRONTEND_URL}/validate-account?error=invalid_link`);
    }
    
    try { 
      jwt.verify(token, process.env.JWT_SECRET || 'secret_key_2026'); 
    } catch (err) { 
      console.log('❌ Token invalide');
      return res.redirect(`${process.env.FRONTEND_URL}/validate-account?error=expired_link`); 
    }
    
    const user = await User.findOne({ email, validationToken: token });
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.redirect(`${process.env.FRONTEND_URL}/validate-account?error=user_not_found`);
    }
    
    if (user.isEmailValidated) {
      console.log('⚠️ Déjà validé');
      return res.redirect(`${process.env.FRONTEND_URL}/validate-account?error=already_validated`);
    }
    
    // Valider l'email
    user.isEmailValidated = true;
    user.status = 'pending_approval';  // En attente d'activation par l'admin
    user.validationToken = null;
    await user.save();
    
    console.log(`✅ Email validé: ${user.email} (${user.prenom} ${user.nom})`);
    
    // 🔔 NOTIFICATION À L'ADMIN (et SEULEMENT à l'admin)
    const admins = await User.find({ role: 'admin' });
    console.log(`📧 Envoi notification à ${admins.length} admin(s)...`);
    
    let emailsSent = 0;
    let emailsFailed = 0;
    
    for (const admin of admins) {
      // Envoyer l'email à l'admin, PAS à l'utilisateur
      const result = await emailService.sendEmail(
        admin.email,  // ← Email de l'admin
        `🔔 ${user.prenom} ${user.nom} a validé son email - En attente d'activation`,
        `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"><title>Nouvel utilisateur à activer</title></head>
          <body style="font-family: Arial, sans-serif; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #ff9800 0%, #f44336 100%); color: white; padding: 20px; border-radius: 15px; text-align: center;">
                <h2>👤 Nouvel utilisateur à activer</h2>
              </div>
              <div style="padding: 20px;">
                <p>Un utilisateur a validé son adresse email et attend votre activation.</p>
                
                <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 20px 0;">
                  <p><strong>👤 Nom complet:</strong> ${user.prenom} ${user.nom}</p>
                  <p><strong>📧 Email:</strong> ${user.email}</p>
                  <p><strong>🆔 Matricule:</strong> ${user.matricule}</p>
                  <p><strong>👔 Rôle:</strong> ${user.role}</p>
                  <p><strong>📅 Date d'inscription:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
                  <p><strong>✅ Email validé le:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL}/users" style="display: inline-block; background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 10px;">
                    📋 Activer ce compte
                  </a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      );
      
      if (result.success) {
        emailsSent++;
        console.log(`✅ Notification envoyée à l'admin: ${admin.email}`);
      } else {
        emailsFailed++;
        console.error(`❌ Échec envoi à l'admin ${admin.email}:`, result.error);
      }
    }
    
    console.log(`📊 Résumé: ${emailsSent} notification(s) admin envoyée(s), ${emailsFailed} échec(s)`);
    
    if (emailsSent === 0) {
      console.error('⚠️⚠️⚠️ AUCUN EMAIL ADMIN N\'A ÉTÉ ENVOYÉ ! Vérifiez configuration SMTP ⚠️⚠️⚠️');
      if (admins.length === 0) {
        console.error('❌ Aucun admin trouvé dans la base de données !');
      }
    }
    
    // Rediriger l'utilisateur vers la page de succès
    res.redirect(`${process.env.FRONTEND_URL}/validate-account?success=true&email=${encodeURIComponent(user.email)}&matricule=${user.matricule}&name=${encodeURIComponent(user.prenom + ' ' + user.nom)}`);
    
  } catch (error) {
    console.error('❌ Erreur validation:', error);
    res.redirect(`${process.env.FRONTEND_URL}/validate-account?error=server_error`);
  }
});

// ============ ADMIN ACTIVE UN COMPTE ============
app.put('/api/admin/activate-user/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    if (!user.isEmailValidated) return res.status(400).json({ success: false, message: 'Email non validé' });
    if (user.isActive) return res.status(400).json({ success: false, message: 'Déjà activé' });
    
    user.isActive = true;
    user.status = 'active';
    await user.save();
    
    // Envoyer email de confirmation à l'utilisateur
    await emailService.sendAccountActivatedEmail(user);
    
    res.json({ success: true, message: 'Compte activé avec succès', user: { id: user._id, matricule: user.matricule, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ADMIN VOIR LES COMPTES EN ATTENTE ============
app.get('/api/admin/pending-users', authMiddleware, adminMiddleware, async (req, res) => {
  const users = await User.find({ isEmailValidated: true, isActive: false, role: { $ne: 'admin' } }).select('nom prenom email matricule role formateurType createdAt');
  res.json({ success: true, count: users.length, users });
});

// ============ ROUTES DE DEBUG ============
app.get('/api/auth/force-activate/:email', async (req, res) => {
  const user = await User.findOne({ email: decodeURIComponent(req.params.email) });
  if (!user) return res.json({ success: false, message: 'Utilisateur non trouvé' });
  user.isEmailValidated = true;
  user.isActive = true;
  user.status = 'active';
  user.validationToken = null;
  await user.save();
  res.json({ success: true, message: '✅ Compte activé', credentials: { matricule: user.matricule, email: user.email } });
});

app.get('/api/auth/simple-reset/:email/:newPassword', async (req, res) => {
  const user = await User.findOne({ email: decodeURIComponent(req.params.email) });
  if (!user) return res.json({ success: false, message: 'Utilisateur non trouvé' });
  user.password = await bcrypt.hash(req.params.newPassword, 10);
  await user.save();
  res.json({ success: true, message: '✅ Mot de passe réinitialisé', credentials: { matricule: user.matricule, newPassword: req.params.newPassword } });
});

app.get('/api/debug/users', async (req, res) => {
  const users = await User.find({}).select('nom prenom email matricule role formateurType isActive isEmailValidated status');
  res.json({ success: true, count: users.length, users });
});

app.get('/api/debug/user/:matricule', async (req, res) => {
  const user = await User.findOne({ matricule: req.params.matricule });
  if (!user) return res.json({ success: false, message: 'Utilisateur non trouvé' });
  res.json({ success: true, matricule: user.matricule, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, formateurType: user.formateurType, isActive: user.isActive, isEmailValidated: user.isEmailValidated });
});

app.get('/api/debug/users-with-tokens', async (req, res) => {
  const users = await User.find({}).select('nom prenom email matricule validationToken isEmailValidated isActive');
  res.json({ 
    success: true, 
    users: users.map(u => ({
      ...u.toObject(),
      hasToken: !!u.validationToken,
      tokenPreview: u.validationToken ? u.validationToken.substring(0, 50) + '...' : null
    }))
  });
});

app.get('/api/debug/user/by-email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: decodeURIComponent(req.params.email) });
    if (!user) {
      return res.json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ 
      success: true, 
      user: {
        email: user.email,
        matricule: user.matricule,
        nom: user.nom,
        prenom: user.prenom,
        isEmailValidated: user.isEmailValidated,
        isActive: user.isActive,
        hasValidationToken: !!user.validationToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/validate-account-direct', async (req, res) => {
  try {
    const { email, token } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, error: 'user_not_found', message: 'Utilisateur non trouvé' });
    }
    
    if (user.isEmailValidated) {
      return res.json({ success: false, error: 'already_validated', message: 'Email déjà validé' });
    }
    
    if (user.validationToken !== token) {
      return res.json({ success: false, error: 'invalid_token', message: 'Token invalide' });
    }
    
    user.isEmailValidated = true;
    user.status = 'pending_approval';
    user.validationToken = null;
    await user.save();
    
    // Notifier les admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await emailService.sendEmail(admin.email, '👤 Nouvel utilisateur à activer', `
        <h2>Nouvel utilisateur à activer</h2>
        <p><strong>${user.prenom} ${user.nom}</strong></p>
        <p>Matricule: ${user.matricule}</p>
        <p>Email: ${user.email}</p>
        <a href="${process.env.FRONTEND_URL}/users">Activer maintenant</a>
      `);
    }
    
    res.json({ 
      success: true, 
      matricule: user.matricule, 
      name: `${user.prenom} ${user.nom}`,
      message: 'Email validé avec succès'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'server_error', message: error.message });
  }
});

app.get('/api/debug/create-missing-user', async (req, res) => {
  const email = req.query.email || 'projetaiie55@gmail.com';
  
  const existing = await User.findOne({ email });
  if (existing) {
    return res.json({ success: true, message: 'Utilisateur existe déjà', user: existing });
  }
  
  const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret_key_2026', { expiresIn: '7d' });
  const hashedPassword = await bcrypt.hash('temp123', 10);
  
  const user = new User({
    nom: 'Utilisateur',
    prenom: 'Test',
    email: email,
    password: hashedPassword,
    role: 'apprenant',
    validationToken: token,
    isEmailValidated: false,
    isActive: false
  });
  
  await user.save();
  
  res.json({
    success: true,
    message: '✅ Utilisateur créé',
    user: { email: user.email, matricule: user.matricule },
    validationLink: `http://localhost:3000/validate-account?email=${encodeURIComponent(email)}&token=${token}`
  });
});

app.post('/api/auth/register-and-validate', async (req, res) => {
  try {
    const { email, nom, prenom, validationToken } = req.body;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      const hashedPassword = await bcrypt.hash('temp123', 10);
      user = new User({
        nom: nom,
        prenom: prenom,
        email: email,
        password: hashedPassword,
        role: 'apprenant',
        validationToken: validationToken,
        isEmailValidated: true,
        isActive: false,
        status: 'pending_approval'
      });
      await user.save();
      console.log('✅ Nouvel utilisateur créé:', user.email);
    } else {
      user.isEmailValidated = true;
      user.status = 'pending_approval';
      user.validationToken = null;
      await user.save();
    }
    
    // Notifier l'admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await emailService.sendEmail(admin.email, '👤 Nouvel utilisateur à activer', `
        <h2>Nouvel utilisateur à activer</h2>
        <p><strong>${user.prenom} ${user.nom}</strong></p>
        <p>Matricule: ${user.matricule}</p>
        <p>Email: ${user.email}</p>
        <a href="${process.env.FRONTEND_URL}/users">Activer maintenant</a>
      `);
    }
    
    res.json({
      success: true,
      matricule: user.matricule,
      name: `${user.prenom} ${user.nom}`,
      message: 'Compte créé et validé avec succès'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTES UTILISATEURS ============
app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: users, total: users.length });
});

app.put('/api/users/:userId/activate', authMiddleware, adminMiddleware, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
  if (!user.isEmailValidated) return res.status(400).json({ success: false, message: 'Email non validé' });
  if (user.isActive) return res.status(400).json({ success: false, message: 'Déjà activé' });
  
  user.isActive = true;
  user.status = 'active';
  await user.save();
  await emailService.sendAccountActivatedEmail(user);
  res.json({ success: true, message: 'Compte activé avec succès' });
});

app.put('/api/users/:userId/status', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  const isActive = status === 'actif' || status === 'active';
  const user = await User.findByIdAndUpdate(req.params.userId, { isActive, status: isActive ? 'active' : 'inactive', updatedAt: new Date() }, { new: true }).select('-password');
  res.json({ success: true, message: `Compte ${isActive ? 'activé' : 'désactivé'}`, data: { id: user._id, isActive: user.isActive } });
});

app.put('/api/users/:userId/reset-password', authMiddleware, async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findById(req.params.userId);
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ success: true, message: 'Mot de passe réinitialisé' });
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Utilisateur supprimé' });
});

// ============ ROUTES D'IMPORT BATCH ============
app.post('/api/users/import-batch', authMiddleware, adminMiddleware, async (req, res) => {
  const { users } = req.body;
  const created = [], errors = [];
  
  for (const u of users) {
    try {
      if (await User.findOne({ email: u.email })) { errors.push({ email: u.email, error: 'Déjà existant' }); continue; }
      const password = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 1000);
      const token = jwt.sign({ email: u.email }, process.env.JWT_SECRET || 'secret_key_2026', { expiresIn: '7d' });
      const newUser = new User({ ...u, password: await bcrypt.hash(password, 10), validationToken: token });
      await newUser.save();
      await emailService.sendWelcomeValidationEmail(newUser, password);
      created.push({ email: u.email, matricule: newUser.matricule, temporaryPassword: password });
    } catch (err) { errors.push({ email: u.email, error: err.message }); }
  }
  res.json({ success: true, message: `${created.length} créé(s), ${errors.length} erreur(s)`, data: { created, errors } });
});

// ============ STATISTIQUES ============
app.get('/api/users/stats', authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ success: true, data: {
    total: await User.countDocuments(),
    apprenants: await User.countDocuments({ role: 'apprenant' }),
    formateurs: await User.countDocuments({ role: 'formateur', formateurType: 'formateur' }),
    enseignants: await User.countDocuments({ role: 'formateur', formateurType: 'enseignant' }),
    admins: await User.countDocuments({ role: 'admin' }),
    actifs: await User.countDocuments({ isActive: true })
  } });
});

// ============ ROUTES FORMATIONS ============
app.get('/api/formations', async (req, res) => res.json({ success: true, data: await Formation.find() }));

// ============ ROUTES CAHIER SUIVI ============
app.use("/api/cahier-suivi", authMiddleware, cahierSuiviRoutes);

// Route pour réinitialiser complètement l'admin
app.get('/api/admin/reset-admin', async (req, res) => {
  try {
    await User.deleteMany({ role: 'admin' });
    await User.deleteMany({ email: 'mounaxnadjat@gmail.com', role: { $ne: 'admin' } });
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const newAdmin = new User({
      nom: 'Administrateur',
      prenom: 'Super',
      email: 'mounaxnadjat@gmail.com',
      telephone: '021000000',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isEmailValidated: true,
      status: 'active'
    });
    
    await newAdmin.save();
    
    res.json({
      success: true,
      message: 'Admin réinitialisé avec succès',
      admin: {
        email: newAdmin.email,
        matricule: newAdmin.matricule,
        password: 'admin123'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour tester l'envoi d'email
app.post('/api/admin/test-email', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { testEmail } = req.body;
    const emailTo = testEmail || 'mounaxnadjat@gmail.com';
    
    console.log(`🧪 Test d'envoi d'email à ${emailTo}...`);
    
    const result = await emailService.sendEmail(
      emailTo,
      'Test de notification Plateforme Formation',
      `<h2>Test réussi !</h2>
       <p>Si vous recevez cet email, la configuration SMTP est correcte.</p>
       <p>Date du test: ${new Date().toLocaleString()}</p>`
    );
    
    if (result.success) {
      res.json({ success: true, message: 'Email envoyé avec succès', details: result });
    } else {
      res.status(500).json({ success: false, message: 'Échec envoi email', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour debug SMTP
app.get('/api/admin/check-smtp', authMiddleware, adminMiddleware, async (req, res) => {
  const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== '');
  
  res.json({
    success: true,
    smtp: {
      configured: smtpConfigured,
      host: process.env.SMTP_HOST || 'non défini',
      port: process.env.SMTP_PORT || 'non défini',
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '...' : 'non défini',
      hasPass: !!process.env.SMTP_PASS
    },
    frontendUrl: process.env.FRONTEND_URL,
    admins: await User.find({ role: 'admin' }).select('email nom prenom')
  });
});
// ============ ROUTES NOTIFICATIONS ============
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.userId, 
      read: false 
    });
    res.json({ 
      success: true, 
      data: notifications, 
      unreadCount 
    });
  } catch (error) {
    // Si erreur, retourner un tableau vide
    res.json({ success: true, data: [], unreadCount: 0 });
  }
});

app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});

app.put('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false }, 
      { read: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});
// ============ ROUTES PROFIL UTILISATEUR ============

// Route pour récupérer le profil de l'utilisateur connecté
app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Erreur récupération profil:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour mettre à jour le profil
app.put('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = req.body;
    
    console.log('📝 Mise à jour profil pour user:', userId);
    
    // Champs autorisés (sans email pour éviter les conflits)
    const allowedFields = ['prenom', 'nom', 'telephone', 'adresse', 'dateNaissance', 'sexe', 'avatar'];
    const cleanData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        cleanData[field] = updateData[field];
      }
    }
    
    // Vérifier l'avatar base64
    if (cleanData.avatar && cleanData.avatar.startsWith('data:image')) {
      const sizeInKB = cleanData.avatar.length / 1024;
      console.log(`📸 Avatar base64 reçu: ${sizeInKB.toFixed(2)}KB`);
      
      if (sizeInKB > 500) {
        console.log(`⚠️ Avatar trop grand: ${sizeInKB.toFixed(2)}KB, rejeté`);
        delete cleanData.avatar;
      }
    } else if (cleanData.avatar === null) {
      console.log('🗑️ Suppression de l\'avatar');
    }
    
    cleanData.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(
      userId, 
      cleanData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    console.log(`✅ Profil mis à jour: ${user.email}`);
    
    res.json({ 
      success: true, 
      message: 'Profil mis à jour avec succès',
      data: user
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la mise à jour du profil'
    });
  }
});

// Route pour uploader l'avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarDir = path.join(__dirname, 'uploads/avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.userId}-${uniqueSuffix}${ext}`);
  }
});

const uploadAvatarMiddleware = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté'), false);
    }
  }
});

app.post('/api/users/upload-avatar', authMiddleware, uploadAvatarMiddleware.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
    }
    
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: avatarUrl, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, avatarUrl, data: user });
  } catch (error) {
    console.error('❌ Erreur upload avatar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// Route pour changer le mot de passe
app.put('/api/users/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir votre mot de passe actuel et le nouveau mot de passe' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' 
      });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();
    
    // Envoyer email de confirmation
    await emailService.sendEmail(
      user.email,
      '🔐 Votre mot de passe a été modifié',
      `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Confirmation de changement de mot de passe</h2>
          <p>Bonjour ${user.prenom} ${user.nom},</p>
          <p>Votre mot de passe a été modifié avec succès.</p>
          <p>Si vous n'êtes pas à l'origine de cette modification, veuillez contacter l'administrateur immédiatement.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Plateforme AP Learning</p>
        </div>
      `
    );
    
    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// Route pour obtenir l'URL de l'avatar (pour la sidebar)
app.get('/api/users/avatar', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('avatar');
    res.json({ 
      success: true, 
      avatar: user?.avatar || null 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTES UTILISATEURS ============
// (Gardez vos routes existantes ici - ne supprimez rien)
// ============ DÉMARRAGE ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log('========================================');
  console.log('📋 COMPTES :');
  console.log(`   👑 Admin:     ADMIN001 / admin123`);
  console.log(`   📧 Email admin: mounaxnadjat@gmail.com`);
  console.log('========================================');
  console.log('📋 FLUX VALIDATION :');
  console.log(`   1️⃣ L\'utilisateur s\'inscrit → reçoit email de bienvenue avec lien`);
  console.log(`   2️⃣ L\'utilisateur clique sur le lien → EMAIL À L\'ADMIN`);
  console.log(`   3️⃣ L\'admin active le compte → EMAIL À L\'UTILISATEUR`);
  console.log('========================================\n');
});