// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();

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
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"Plateforme Formation" <noreply@plateforme.com>',
        to,
        subject,
        html,
      };
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email envoyé à ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur envoi email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeValidationEmail(user, temporaryPassword) {
    const validationLink = `http://localhost:5000/api/auth/validate-account?email=${encodeURIComponent(user.email)}&token=${user.validationToken}`;
    
    const subject = '🎉 Bienvenue - Validez votre compte';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .password-box { background: #f0f0f0; font-family: monospace; font-size: 20px; padding: 12px; text-align: center; border-radius: 6px; margin: 15px 0; font-weight: bold; }
          .validation-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Bienvenue ${user.prenom} ${user.nom} !</h2>
          </div>
          <div class="content">
            <p>Un compte a été créé pour vous sur la plateforme de formation.</p>
            <div class="credentials">
              <p><strong>📧 Email :</strong> ${user.email}</p>
              <p><strong>🆔 Matricule :</strong> ${user.matricule}</p>
              <p><strong>👤 Rôle :</strong> ${user.role === 'admin' ? 'Administrateur' : user.role === 'formateur' ? 'Formateur' : 'Apprenant'}</p>
              <p><strong>🔑 Mot de passe temporaire :</strong></p>
              <div class="password-box">${temporaryPassword}</div>
            </div>
            <div class="warning">
              <strong>⚠️ IMPORTANT :</strong> Pour activer votre compte, vous devez d'abord valider votre email.
            </div>
            <div style="text-align: center;">
              <a href="${validationLink}" class="validation-btn">✅ Valider mon inscription</a>
            </div>
            <p>Après validation, un administrateur devra activer votre compte.</p>
            <p>Pour toute question, contactez l'administrateur.</p>
          </div>
          <div class="footer">
            <p>© 2024 Plateforme de Formation</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return await this.sendEmail(user.email, subject, html);
  }

  async sendAccountActivatedEmail(user) {
    const subject = '✅ Votre compte a été activé';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Compte activé !</h2>
          </div>
          <div class="content">
            <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
            <p>Un administrateur a activé votre compte. Vous pouvez maintenant vous connecter.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">🔐 Se connecter</a>
            </div>
            <p><strong>Informations :</strong><br>📧 Email: ${user.email}<br>🆔 Matricule: ${user.matricule}</p>
            <p><strong>Mot de passe :</strong> Celui que vous avez reçu dans l'email de bienvenue.</p>
          </div>
          <div class="footer">
            <p>© 2024 Plateforme de Formation</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return await this.sendEmail(user.email, subject, html);
  }
}

const emailService = new EmailService();

// ============ MODÈLES ============

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, default: '' },
  matricule: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'apprenant', 'formateur'], default: 'apprenant' },
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

const User = mongoose.model('User', userSchema);

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

const formationSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  domaine: { type: String, enum: ['Services Postaux', 'Monétique & IT', 'Gestion Financière'], required: true },
  duree: { type: String, required: true },
  prerequis: { type: String, default: '' },
  debouches: { type: String, default: '' },
  wilayas: [{ type: String }],
  placesDisponibles: { type: Number, default: 0 },
  dateDebut: { type: Date },
  formateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Formation = mongoose.model('Formation', formationSchema);

const inscriptionSchema = new mongoose.Schema({
  apprenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  formationId: { type: mongoose.Schema.Types.ObjectId, ref: "Formation", required: true },
  formationTitre: { type: String, required: true },
  formationDomaine: { type: String, required: true },
  statut: { type: String, enum: ["en_attente", "confirmee", "refusee", "annulee"], default: "en_attente" },
  demandeEnvoyeeLe: { type: Date, default: Date.now },
  reponseLe: { type: Date },
  messageApprenant: { type: String, default: "" },
  messageAdmin: { type: String, default: "" },
}, { timestamps: true });

const Inscription = mongoose.model('Inscription', inscriptionSchema);

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["message", "call", "inscription", "system", "user_approval"], default: "system" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, unique: true },
  reponse: { type: String, required: true },
  keywords: [{ type: String }],
  categorie: { type: String, enum: ['formation', 'inscription', 'contact', 'horaire', 'general', 'statistiques'], default: 'general' },
  vues: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const FAQ = mongoose.model('FAQ', faqSchema);

// ============ MIDDLEWARES D'AUTHENTIFICATION ============

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant', success: false });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_2026');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide', success: false });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Accès non autorisé. Administrateur requis.', success: false });
  }
  next();
};

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez .xlsx ou .xls'));
    }
  }
});

// ============ CONNEXION MONGODB ============

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gestion_utilisateurs';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté avec succès'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB:', err.message));

// ============ ROUTES DE TEST ============

app.get('/', (req, res) => {
  res.json({ name: 'AP Learning API', version: '1.0.0', status: 'online' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionne!', timestamp: new Date().toISOString() });
});

// ============ ROUTES D'AUTHENTIFICATION ============

app.post('/api/auth/setup-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return res.json({ success: true, message: 'Admin déjà existant' });
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      nom: 'Administrateur',
      prenom: 'Super',
      matricule: 'ADMIN001',
      email: 'admin@algerieposte.dz',
      telephone: '021000000',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isEmailValidated: true,
      status: 'active'
    });
    
    await admin.save();
    
    res.json({ success: true, message: '✅ Admin créé', credentials: { matricule: 'ADMIN001', password: 'admin123' } });
  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { matricule, password } = req.body;
    console.log('🔐 Tentative de connexion:', matricule);
    
    const user = await User.findOne({ matricule });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Matricule ou mot de passe incorrect' });
    }
    
    // Vérifier si l'email a été validé
    if (!user.isEmailValidated) {
      return res.status(403).json({ 
        success: false, 
        message: '❌ Veuillez d\'abord valider votre email via le lien reçu.',
        code: 'EMAIL_NOT_VALIDATED'
      });
    }
    
    // Vérifier si le compte est activé par l'admin
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: '⏳ Votre compte est en attente d\'activation par un administrateur.',
        code: 'PENDING_APPROVAL'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Matricule ou mot de passe incorrect' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_2026',
      { expiresIn: '7d' }
    );
    
    user.lastLogin = new Date();
    await user.save();
    
    console.log('✅ Connexion réussie pour:', matricule);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        matricule: user.matricule,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        status: user.status,
        isActive: user.isActive,
        isEmailValidated: user.isEmailValidated,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion' });
  }
});

// ============ ROUTE DE VALIDATION D'EMAIL (Lien dans l'email) ============
app.get('/api/auth/validate-account', async (req, res) => {
  try {
    const { email, token } = req.query;
    
    console.log('========================================');
    console.log('📧 VALIDATION D\'EMAIL PAR L\'UTILISATEUR');
    console.log('Email:', email);
    console.log('========================================');
    
    if (!email || !token) {
      return res.send(`
        <html><body style="text-align:center;padding:50px;font-family:Arial">
          <h1 style="color:red;">❌ Lien invalide</h1>
          <a href="http://localhost:3000/login">Retour à la connexion</a>
        </body></html>
      `);
    }
    
    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_2026');
      console.log('✅ Token valide');
    } catch (err) {
      return res.send(`
        <html><body style="text-align:center;padding:50px;font-family:Arial">
          <h1 style="color:red;">❌ Lien expiré ou invalide</h1>
          <a href="http://localhost:3000/login">Retour à la connexion</a>
        </body></html>
      `);
    }
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email: email, validationToken: token });
    
    if (!user) {
      return res.send(`
        <html><body style="text-align:center;padding:50px;font-family:Arial">
          <h1 style="color:red;">❌ Utilisateur non trouvé</h1>
          <a href="http://localhost:3000/login">Retour à la connexion</a>
        </body></html>
      `);
    }
    
    // Si déjà validé
    if (user.isEmailValidated) {
      return res.send(`
        <html><body style="text-align:center;padding:50px;font-family:Arial">
          <h1 style="color:orange;">⚠️ Email déjà validé</h1>
          <p>Votre email a déjà été validé. En attente d'activation par l'administrateur.</p>
          <a href="http://localhost:3000/login">Retour à la connexion</a>
        </body></html>
      `);
    }
    
    // ✅ VALIDER L'EMAIL
    user.isEmailValidated = true;
    user.status = 'pending_approval';
    user.validationToken = null;
    await user.save();
    
    console.log('✅ Email validé pour:', user.email);
    console.log('   - Statut: en attente d\'approbation admin');
    
    // 🔔 Notifier l'admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        type: 'user_approval',
        title: '👤 Nouvel utilisateur à approuver',
        message: `${user.prenom} ${user.nom} (${user.matricule}) a validé son email et attend votre approbation.`,
        data: { 
          userId: user._id,
          userMatricule: user.matricule,
          userName: `${user.prenom} ${user.nom}`,
          userEmail: user.email
        },
        read: false
      });
    }
    
    // Afficher une page de confirmation
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>✅ Email validé</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; display: flex; justify-content: center; align-items: center; }
          .container { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 500px; }
          h1 { color: #28a745; margin-bottom: 20px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Email validé avec succès !</h1>
          <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
          <p>Votre email a été validé.</p>
          <p>Un administrateur doit maintenant <strong>activer votre compte</strong>.</p>
          <p>Vous recevrez un email dès que votre compte sera activé.</p>
          <a href="http://localhost:3000/login" class="button">🔐 Retour à la connexion</a>
          <hr>
          <p style="font-size: 12px; color: #999;">© 2024 Plateforme de Formation</p>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.send(`
      <html><body style="text-align:center;padding:50px">
        <h1 style="color:red;">❌ Erreur: ${error.message}</h1>
        <a href="http://localhost:3000/login">Retour à la connexion</a>
      </body></html>
    `);
  }
});

// ============ ROUTES PROFIL ============

app.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    delete updateData.password;
    delete updateData.matricule;
    delete updateData.role;
    delete updateData.isActive;
    delete updateData.isEmailValidated;
    
    updateData.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(req.userId, { $set: updateData }, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, message: 'Profil mis à jour', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTES UTILISATEURS (ADMIN) ============

app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users, total: users.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    delete updateData.password;
    delete updateData.matricule;
    
    updateData.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, data: user, message: 'Utilisateur mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTE D'ACTIVATION PAR ADMIN ============
app.put('/api/users/:userId/activate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier que l'email a été validé
    if (!user.isEmailValidated) {
      return res.status(400).json({ success: false, message: 'L\'utilisateur n\'a pas encore validé son email' });
    }
    
    if (user.isActive) {
      return res.status(400).json({ success: false, message: 'Compte déjà activé' });
    }
    
    // Activer le compte
    user.isActive = true;
    user.status = 'active';
    await user.save();
    
    // Envoyer email d'activation
    await emailService.sendAccountActivatedEmail(user);
    
    console.log(`✅ Compte activé par admin: ${user.matricule} - ${user.email}`);
    
    res.json({ 
      success: true, 
      message: 'Compte activé avec succès',
      data: { id: user._id, matricule: user.matricule, isActive: user.isActive }
    });
    
  } catch (error) {
    console.error('❌ Erreur activation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTE POUR CHANGER LE STATUT (ACTIVER/DÉSACTIVER) ============
app.put('/api/users/:userId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    const isActive = status === 'actif' || status === 'active' || status === true;
    const statusString = isActive ? 'active' : 'inactive';
    
    const user = await User.findByIdAndUpdate(userId, { isActive: isActive, status: statusString, updatedAt: new Date() }, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Si on active le compte, envoyer un email
    if (isActive && user.isEmailValidated) {
      await emailService.sendAccountActivatedEmail(user);
    }
    
    res.json({ success: true, message: `Compte ${isActive ? 'activé' : 'désactivé'}`, data: { id: user._id, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTE DE RÉINITIALISATION MOT DE PASSE ============

app.put('/api/users/:userId/reset-password', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();
    
    console.log('✅ Mot de passe réinitialisé pour:', user.email);
    
    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('❌ Erreur reset password:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTES D'IMPORT ============

app.post('/api/users/import-batch', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à importer' });
    }
    
    const createdUsers = [];
    const errors = [];
    
    for (const userData of users) {
      try {
        const existingUser = await User.findOne({ $or: [{ email: userData.email }] });
        
        if (existingUser) {
          errors.push({ email: userData.email, error: 'Utilisateur déjà existant' });
          continue;
        }
        
        const prefix = userData.role === 'formateur' ? 'F' : 'A';
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const matricule = `${prefix}${year}${random}`;
        
        const plainPassword = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 1000);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        const validationToken = jwt.sign(
          { email: userData.email, matricule: matricule },
          process.env.JWT_SECRET || 'secret_key_2026',
          { expiresIn: '7d' }
        );
        
        const newUser = new User({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          telephone: userData.telephone || '',
          matricule: matricule,
          password: hashedPassword,
          role: userData.role,
          isActive: false,
          isEmailValidated: false,
          validationToken: validationToken,
          status: 'pending',
          createdAt: new Date()
        });
        
        await newUser.save();
        
        const emailResult = await emailService.sendWelcomeValidationEmail(newUser, plainPassword);
        
        createdUsers.push({
          id: newUser._id,
          nom: newUser.nom,
          prenom: newUser.prenom,
          email: newUser.email,
          matricule: newUser.matricule,
          role: newUser.role,
          temporaryPassword: plainPassword,
          emailSent: emailResult.success
        });
        
        console.log(`✅ Utilisateur créé: ${userData.nom} ${userData.prenom}`);
      } catch (error) {
        errors.push({ email: userData.email, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `${createdUsers.length} utilisateur(s) créé(s), ${errors.length} erreur(s)`,
      data: { created: createdUsers, errors, emailsSent: createdUsers.filter(u => u.emailSent).length }
    });
  } catch (error) {
    console.error('Erreur import batch:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/users/import', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }
    
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Le fichier est vide' });
    }
    
    const usersToImport = data.map(row => ({
      nom: (row.nom || row.Nom || row.NAME || row.name || '').toString().trim(),
      prenom: (row.prenom || row.Prenom || row.FirstName || '').toString().trim(),
      email: (row.email || row.Email || row.mail || row.Mail || '').toString().trim(),
      telephone: (row.telephone || row.Telephone || row.Phone || '').toString().trim(),
      role: (row.role || row.Role || 'apprenant').toString().toLowerCase()
    })).filter(u => u.nom && u.email);
    
    if (usersToImport.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée valide dans le fichier' });
    }
    
    const createdUsers = [];
    const errors = [];
    
    for (const userData of usersToImport) {
      try {
        let role = userData.role;
        if (role === 'formateur' || role === 'professeur') role = 'formateur';
        else if (role === 'admin' || role === 'administrateur') role = 'admin';
        else role = 'apprenant';
        
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          errors.push({ email: userData.email, error: 'Utilisateur déjà existant' });
          continue;
        }
        
        const prefix = role === 'formateur' ? 'F' : 'A';
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const matricule = `${prefix}${year}${random}`;
        
        const plainPassword = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 1000);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        const validationToken = jwt.sign(
          { email: userData.email, matricule: matricule },
          process.env.JWT_SECRET || 'secret_key_2026',
          { expiresIn: '7d' }
        );
        
        const newUser = new User({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          telephone: userData.telephone,
          matricule: matricule,
          password: hashedPassword,
          role: role,
          isActive: false,
          isEmailValidated: false,
          validationToken: validationToken,
          status: 'pending',
          createdAt: new Date()
        });
        
        await newUser.save();
        
        const emailResult = await emailService.sendWelcomeValidationEmail(newUser, plainPassword);
        
        createdUsers.push({
          id: newUser._id,
          nom: newUser.nom,
          prenom: newUser.prenom,
          email: newUser.email,
          matricule: newUser.matricule,
          role: newUser.role,
          temporaryPassword: plainPassword,
          emailSent: emailResult.success
        });
        
        console.log(`✅ Utilisateur créé: ${userData.nom} ${userData.prenom}`);
      } catch (error) {
        errors.push({ email: userData.email, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `${createdUsers.length} utilisateur(s) créé(s), ${errors.length} erreur(s)`,
      data: { created: createdUsers, errors, totalProcessed: usersToImport.length, emailsSent: createdUsers.filter(u => u.emailSent).length }
    });
    
  } catch (error) {
    console.error('Erreur import Excel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ STATISTIQUES ============

app.get('/api/users/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalApprenants = await User.countDocuments({ role: 'apprenant' });
    const totalFormateurs = await User.countDocuments({ role: 'formateur' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const emailValidated = await User.countDocuments({ isEmailValidated: true });
    const pendingApproval = await User.countDocuments({ isEmailValidated: true, isActive: false });
    
    res.json({
      success: true,
      data: {
        total: totalUsers,
        apprenants: totalApprenants,
        formateurs: totalFormateurs,
        admins: totalAdmins,
        actifs: activeUsers,
        inactifs: totalUsers - activeUsers,
        emailValidated: emailValidated,
        pendingApproval: pendingApproval
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTES FORMATIONS ============

app.get('/api/formations', async (req, res) => {
  try {
    const formations = await Formation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: formations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/formations', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const formation = new Formation(req.body);
    await formation.save();
    res.status(201).json({ success: true, data: formation, message: 'Formation créée' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put('/api/formations/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const formation = await Formation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!formation) {
      return res.status(404).json({ success: false, message: 'Formation non trouvée' });
    }
    res.json({ success: true, data: formation, message: 'Formation mise à jour' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete('/api/formations/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const formation = await Formation.findByIdAndDelete(req.params.id);
    if (!formation) {
      return res.status(404).json({ success: false, message: 'Formation non trouvée' });
    }
    res.json({ success: true, message: 'Formation supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTES INSCRIPTIONS ============

app.post("/api/formations/inscrire", authMiddleware, async (req, res) => {
  try {
    const { formationId, formationTitre, formationDomaine, message } = req.body;
    const apprenantId = req.userId;
    
    if (req.userRole !== "apprenant") {
      return res.status(403).json({ success: false, message: "Seuls les apprenants peuvent s'inscrire" });
    }
    
    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(404).json({ success: false, message: "Formation non trouvée" });
    }
    
    const existingInscription = await Inscription.findOne({ apprenantId, formationId, statut: { $in: ["en_attente", "confirmee"] } });
    
    if (existingInscription) {
      return res.status(400).json({ success: false, message: "Vous avez déjà une demande en cours" });
    }
    
    const inscription = new Inscription({
      apprenantId,
      formationId,
      formationTitre: formationTitre || formation.titre,
      formationDomaine: formationDomaine || formation.domaine,
      messageApprenant: message || "",
      statut: "en_attente",
      demandeEnvoyeeLe: new Date()
    });
    
    await inscription.save();
    
    const admins = await User.find({ role: "admin" });
    const apprenant = await User.findById(apprenantId);
    
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        type: "inscription",
        title: "Nouvelle demande d'inscription",
        message: `${apprenant.prenom} ${apprenant.nom} souhaite s'inscrire à "${formation.titre}"`,
        data: { inscriptionId: inscription._id, formationId, formationTitre: formation.titre },
        read: false
      });
    }
    
    res.status(201).json({ success: true, message: "Demande envoyée", data: inscription });
  } catch (error) {
    console.error("Erreur inscription:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/formations/mes-inscriptions", authMiddleware, async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ apprenantId: req.userId }).sort({ demandeEnvoyeeLe: -1 });
    res.json({ success: true, data: inscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/formations/admin/inscriptions", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const inscriptions = await Inscription.find().sort({ demandeEnvoyeeLe: -1 }).populate("apprenantId", "nom prenom matricule email");
    res.json({ success: true, data: inscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/formations/inscription/:id/repondre", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { statut, message } = req.body;
    const inscription = await Inscription.findById(req.params.id);
    
    if (!inscription) {
      return res.status(404).json({ success: false, message: "Inscription non trouvée" });
    }
    
    inscription.statut = statut;
    inscription.messageAdmin = message || "";
    inscription.reponseLe = new Date();
    await inscription.save();
    
    await Notification.create({
      userId: inscription.apprenantId,
      type: "inscription",
      title: statut === "confirmee" ? "✅ Inscription acceptée" : "❌ Inscription refusée",
      message: statut === "confirmee" ? `Votre inscription à "${inscription.formationTitre}" a été acceptée` : `Votre inscription à "${inscription.formationTitre}" a été refusée`,
      data: { inscriptionId: inscription._id, statut },
      read: false
    });
    
    res.json({ success: true, message: `Inscription ${statut === "confirmee" ? "acceptée" : "refusée"}`, data: inscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTES CHATBOT ============

app.post('/api/chatbot/message', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, response: "Message requis" });
    }
    
    let response = "Je suis là pour vous aider ! Posez-moi une question sur les formations, les inscriptions ou les statistiques.";
    
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('formation') || lowerMsg.includes('cours')) {
      const formations = await Formation.find().limit(3);
      if (formations.length > 0) {
        response = "📚 **Nos formations** :\n";
        formations.forEach((f, i) => {
          response += `${i+1}. **${f.titre}** - ${f.description.substring(0, 100)}...\n`;
        });
      } else {
        response = "📚 Nous proposons des formations dans 3 domaines : Services Postaux, Monétique & IT, et Gestion Financière.";
      }
    } else if (lowerMsg.includes('inscription') || lowerMsg.includes('postuler')) {
      response = "📝 **Comment postuler ?**\n1️⃣ Créez votre compte\n2️⃣ Complétez votre profil\n3️⃣ Sélectionnez votre formation\n4️⃣ Soumettez votre candidature";
    } else if (lowerMsg.includes('contact') || lowerMsg.includes('email')) {
      response = "📞 **Nous contacter** :\n📍 Alger\n📧 formation@poste.dz\n📱 021 XX XX XX";
    } else if (lowerMsg.includes('statistique') || lowerMsg.includes('nombre')) {
      const totalUsers = await User.countDocuments();
      response = `📊 **Statistiques** :\n👥 Utilisateurs: ${totalUsers}`;
    }
    
    if (userId) {
      let chatHistory = await ChatHistory.findOne({ userId });
      if (!chatHistory) {
        chatHistory = new ChatHistory({ userId, messages: [] });
      }
      chatHistory.messages.push({ role: 'user', content: message }, { role: 'assistant', content: response });
      chatHistory.updatedAt = new Date();
      await chatHistory.save();
    }
    
    res.json({ success: true, response: response });
  } catch (error) {
    console.error('Erreur chatbot:', error);
    res.status(500).json({ success: false, response: "Erreur technique" });
  }
});

// ============ CAHIER SUIVI ROUTES ============
app.use("/api/cahier-suivi", authMiddleware, cahierSuiviRoutes);
app.get('/api/debug/user/:matricule', async (req, res) => {
  try {
    const user = await User.findOne({ matricule: req.params.matricule });
    if (!user) return res.json({ error: 'User not found' });
    res.json({
      matricule: user.matricule,
      role: user.role,
      isActive: user.isActive,
      isEmailValidated: user.isEmailValidated,
      status: user.status
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});
// ============ DÉMARRAGE ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log('========================================');
  console.log('📋 ENDPOINTS DISPONIBLES :');
  console.log(`   🔧 Setup Admin:    POST /api/auth/setup-admin`);
  console.log(`   🔐 Login:          POST /api/auth/login`);
  console.log(`   ✅ Validate Email: GET  /api/auth/validate-account`);
  console.log(`   ✅ Activate User:   PUT  /api/users/:userId/activate`);
  console.log(`   👥 Users:          GET  /api/users`);
  console.log(`   🔑 Reset MDP:      PUT  /api/users/:userId/reset-password`);
  console.log(`   📥 Import:         POST /api/users/import`);
  console.log(`   📊 Stats:          GET  /api/users/stats`);
  console.log(`   📚 Formations:     GET  /api/formations`);
  console.log(`   📝 Inscriptions:   POST /api/formations/inscrire`);
  console.log(`   👤 Profile:        GET  /api/users/profile`);
  console.log('========================================\n');
});