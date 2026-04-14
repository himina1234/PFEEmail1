// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const XLSX = require('xlsx');

dotenv.config();

const app = express();

// ============ MIDDLEWARES ============
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ MODÈLES ============

// Modèle User - Version corrigée sans validation stricte sur sexe
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, default: '' },
  matricule: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'apprenant', 'formateur'], default: 'apprenant' },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: null },
  dateNaissance: { type: Date, default: null },
  sexe: { type: String, default: null }, // Plus de validation enum
  adresse: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Modèle ChatHistory
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

// Modèle Formation
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

// Modèle FAQ
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

// Configuration multer pour l'upload
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_utilisateurs';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté avec succès'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB:', err.message));

// ============ ROUTES DE TEST ============

app.get('/', (req, res) => {
  res.json({ 
    name: 'AP Learning API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      test: 'GET /api/test',
      setup: 'POST /api/auth/setup-admin',
      login: 'POST /api/auth/login',
      users: 'GET /api/users',
      import: 'POST /api/users/import',
      importBatch: 'POST /api/users/import-batch',
      stats: 'GET /api/users/stats',
      chatbot: 'POST /api/chatbot/message'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionne!', timestamp: new Date().toISOString() });
});

// ============ ROUTES D'AUTHENTIFICATION ============

// Création de l'admin par défaut
app.post('/api/auth/setup-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return res.json({ 
        success: true,
        message: 'Admin déjà existant', 
        admin: {
          nom: adminExists.nom,
          matricule: adminExists.matricule,
          email: adminExists.email
        }
      });
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
      isActive: true
    });
    
    await admin.save();
    
    res.json({ 
      success: true,
      message: '✅ Admin créé avec succès',
      credentials: {
        matricule: 'ADMIN001',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { matricule, password } = req.body;
    
    console.log('🔐 Tentative de connexion:', matricule);
    
    const user = await User.findOne({ matricule });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', matricule);
      return res.status(401).json({ success: false, message: 'Matricule ou mot de passe incorrect' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect pour:', matricule);
      return res.status(401).json({ success: false, message: 'Matricule ou mot de passe incorrect' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Compte désactivé. Contactez l\'administrateur.' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_2026',
      { expiresIn: '7d' }
    );
    
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
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTES UTILISATEURS ============

// Récupérer tous les utilisateurs
app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users, total: users.length });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer un utilisateur par ID
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mettre à jour un utilisateur
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    delete updateData.password;
    delete updateData.matricule;
    delete updateData._id;
    
    updateData.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, data: user, message: 'Utilisateur mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Supprimer un utilisateur
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

// ============ ROUTE D'IMPORT BATCH (POUR EXCEL ET FORMULAIRE MANUEL) ============

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
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ 
          $or: [
            { email: userData.email },
            { nom: userData.nom, prenom: userData.prenom }
          ] 
        });
        
        if (existingUser) {
          errors.push({ email: userData.email, error: 'Utilisateur déjà existant' });
          continue;
        }
        
        // Générer matricule unique
        const prefix = userData.role === 'formateur' ? 'F' : 'A';
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const matricule = `${prefix}${year}${random}`;
        
        // Générer mot de passe temporaire
        const plainPassword = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 1000);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        const newUser = new User({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          telephone: userData.telephone || '',
          matricule: matricule,
          password: hashedPassword,
          role: userData.role,
          isActive: true,
          createdAt: new Date()
        });
        
        await newUser.save();
        
        createdUsers.push({
          id: newUser._id,
          nom: newUser.nom,
          prenom: newUser.prenom,
          email: newUser.email,
          matricule: newUser.matricule,
          role: newUser.role,
          temporaryPassword: plainPassword
        });
        
        console.log(`✅ Utilisateur créé: ${userData.nom} ${userData.prenom} (${userData.role}) -> ${matricule}`);
        
      } catch (error) {
        console.error(`❌ Erreur création ${userData.email}:`, error.message);
        errors.push({ email: userData.email, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `${createdUsers.length} utilisateur(s) créé(s), ${errors.length} erreur(s)`,
      data: { created: createdUsers, errors }
    });
    
  } catch (error) {
    console.error('Erreur import batch:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ ROUTE D'IMPORT EXCEL (FICHIER) ============

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
    
    // Transformer les données Excel
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
        // Normaliser le rôle
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
        
        const newUser = new User({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          telephone: userData.telephone,
          matricule: matricule,
          password: hashedPassword,
          role: role,
          isActive: true,
          createdAt: new Date()
        });
        
        await newUser.save();
        
        createdUsers.push({
          id: newUser._id,
          nom: newUser.nom,
          prenom: newUser.prenom,
          email: newUser.email,
          matricule: newUser.matricule,
          role: newUser.role,
          temporaryPassword: plainPassword
        });
        
      } catch (error) {
        errors.push({ email: userData.email, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `${createdUsers.length} utilisateur(s) créé(s), ${errors.length} erreur(s)`,
      data: { created: createdUsers, errors, totalProcessed: usersToImport.length }
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
    
    res.json({
      success: true,
      data: {
        total: totalUsers,
        apprenants: totalApprenants,
        formateurs: totalFormateurs,
        admins: totalAdmins,
        actifs: activeUsers,
        inactifs: totalUsers - activeUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route debug
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ total: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ ROUTES CHATBOT ============

async function analyzeIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  const intents = {
    'formation': ['formation', 'cours', 'programme', 'apprendre', 'domaine'],
    'inscription': ['inscription', 'postuler', 'candidater', 'concours'],
    'contact': ['contact', 'email', 'téléphone', 'adresse'],
    'statistiques': ['statistique', 'chiffre', 'nombre', 'combien']
  };
  
  for (const [intent, keywords] of Object.entries(intents)) {
    for (const keyword of keywords) {
      if (lowerMsg.includes(keyword)) {
        return { type: intent };
      }
    }
  }
  
  return { type: 'general' };
}

async function generateResponse(message, intent) {
  switch (intent.type) {
    case 'formation':
      const formations = await Formation.find().limit(3);
      if (formations.length > 0) {
        let response = "📚 **Nos formations disponibles** :\n\n";
        formations.forEach((f, i) => {
          response += `${i+1}. **${f.titre}**\n   ${f.description.substring(0, 100)}...\n   📍 Domaine: ${f.domaine}\n   ⏱️ Durée: ${f.duree}\n\n`;
        });
        return response;
      }
      return "📚 Nous proposons des formations dans 3 domaines : Services Postaux, Monétique & IT, et Gestion Financière.";
    
    case 'inscription':
      return "📝 **Comment postuler ?**\n\n1️⃣ Créez votre compte\n2️⃣ Complétez votre profil\n3️⃣ Sélectionnez votre formation\n4️⃣ Soumettez votre candidature";
    
    case 'contact':
      return "📞 **Nous contacter** :\n📍 Alger, Bir Mourad Raïs\n📧 formation@poste.dz\n📱 021 XX XX XX";
    
    case 'statistiques':
      const totalUsers = await User.countDocuments();
      const totalFormateurs = await User.countDocuments({ role: 'formateur' });
      const totalApprenants = await User.countDocuments({ role: 'apprenant' });
      return `📊 **Statistiques** :\n👥 Utilisateurs: ${totalUsers}\n🎓 Formateurs: ${totalFormateurs}\n📚 Apprenants: ${totalApprenants}`;
    
    default:
      return "🤔 Je suis là pour vous aider !\n\n• 📚 **Formations** : Détails sur nos programmes\n• 📝 **Inscription** : Comment postuler\n• 📞 **Contact** : Nos coordonnées\n• 📊 **Statistiques** : Chiffres clés\n\nPosez-moi une question sur ces sujets !";
  }
}

app.post('/api/chatbot/message', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: "Message requis" });
    }
    
    const intent = await analyzeIntent(message);
    const response = await generateResponse(message, intent);
    
    if (userId) {
      let chatHistory = await ChatHistory.findOne({ userId });
      if (!chatHistory) {
        chatHistory = new ChatHistory({ userId, messages: [] });
      }
      
      chatHistory.messages.push(
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: response, timestamp: new Date() }
      );
      chatHistory.updatedAt = new Date();
      await chatHistory.save();
    }
    
    res.json({ success: true, response: response, intent: intent.type });
    
  } catch (error) {
    console.error('Erreur chatbot:', error);
    res.status(500).json({ success: false, response: "Erreur technique" });
  }
});

// Initialisation des données par défaut
app.post('/api/chatbot/init-data', async (req, res) => {
  try {
    const formationsExist = await Formation.countDocuments();
    if (formationsExist === 0) {
      const defaultFormations = [
        {
          titre: "Agent des Services Postaux",
          description: "Formation complète pour maîtriser l'accueil client, la gestion du courrier et les opérations postales.",
          domaine: "Services Postaux",
          duree: "6 mois",
          wilayas: ["Alger", "Oran", "Constantine"],
          placesDisponibles: 120
        },
        {
          titre: "Technicien en Monétique",
          description: "Maintenance des automates bancaires, support technique et gestion des services numériques.",
          domaine: "Monétique & IT",
          duree: "8 mois",
          wilayas: ["Alger", "Oran"],
          placesDisponibles: 60
        }
      ];
      await Formation.insertMany(defaultFormations);
      console.log('✅ Formations par défaut ajoutées');
    }
    
    res.json({ success: true, message: "Données initialisées" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ ROUTES FORMATIONS ============

// GET - Récupérer toutes les formations
app.get('/api/formations', async (req, res) => {
  try {
    console.log('📚 Récupération des formations...');
    
    const formations = await Formation.find().sort({ createdAt: -1 });
    
    console.log(`✅ ${formations.length} formations trouvées`);
    
    res.status(200).json({ 
      success: true, 
      data: formations 
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST - Créer une formation
app.post('/api/formations', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('📝 Création formation:', req.body.titre);
    
    const formationData = {
      titre: req.body.titre,
      description: req.body.description,
      domaine: req.body.domaine,
      duree: req.body.duree,
      prerequis: req.body.prerequis || '',
      debouches: req.body.debouches || '',
      wilayas: req.body.wilayas || [],
      placesDisponibles: req.body.placesDisponibles || 0,
      dateDebut: req.body.dateDebut || null,
      formateurId: req.body.formateurId || null,
      createdAt: new Date()
    };
    
    const formation = new Formation(formationData);
    await formation.save();
    
    console.log('✅ Formation créée:', formation._id);
    
    res.status(201).json({ 
      success: true, 
      data: formation, 
      message: 'Formation créée avec succès' 
    });
  } catch (error) {
    console.error('❌ Erreur création:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// PUT - Mettre à jour une formation
app.put('/api/formations/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('✏️ Mise à jour formation:', req.params.id);
    
    const updateData = {
      titre: req.body.titre,
      description: req.body.description,
      domaine: req.body.domaine,
      duree: req.body.duree,
      prerequis: req.body.prerequis,
      debouches: req.body.debouches,
      wilayas: req.body.wilayas,
      placesDisponibles: req.body.placesDisponibles,
      dateDebut: req.body.dateDebut,
      formateurId: req.body.formateurId,
      updatedAt: new Date()
    };
    
    const formation = await Formation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!formation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Formation non trouvée' 
      });
    }
    
    console.log('✅ Formation mise à jour');
    
    res.json({ 
      success: true, 
      data: formation, 
      message: 'Formation mise à jour' 
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// DELETE - Supprimer une formation
app.delete('/api/formations/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('🗑️ Suppression formation:', req.params.id);
    
    const formation = await Formation.findByIdAndDelete(req.params.id);
    
    if (!formation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Formation non trouvée' 
      });
    }
    
    console.log('✅ Formation supprimée');
    
    res.json({ 
      success: true, 
      message: 'Formation supprimée avec succès' 
    });
  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});






// Dans server.js - Route GET /api/formations (sans auth pour les apprenants)
app.get('/api/formations', async (req, res) => {
  try {
    console.log('📚 Récupération des formations...');
    
    const formations = await Formation.find().sort({ createdAt: -1 });
    
    console.log(`✅ ${formations.length} formations trouvées`);
    
    res.status(200).json({ 
      success: true, 
      data: formations 
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ============ DÉMARRAGE DU SERVEUR ============

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log('========================================');
  console.log('📋 ENDPOINTS DISPONIBLES :');
  console.log(`   🔧 Setup Admin: POST /api/auth/setup-admin`);
  console.log(`   🔐 Login:       POST /api/auth/login`);
  console.log(`   👥 Users:       GET  /api/users`);
  console.log(`   📥 Import:      POST /api/users/import`);
  console.log(`   📥 Import Batch: POST /api/users/import-batch`);
  console.log(`   📊 Stats:       GET  /api/users/stats`);
  console.log(`   💬 Chatbot:     POST /api/chatbot/message`);
  console.log('========================================\n');
});