const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
// Modèle User
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  matricule: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'apprenant', 'formateur'], default: 'apprenant' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_utilisateurs';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté avec succès'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB:', err.message));

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API fonctionne!' });
});

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Gestion Utilisateurs',
    endpoints: {
      test: 'GET /api/test',
      setup: 'POST /api/auth/setup-admin',
      login: 'POST /api/auth/login'
    }
  });
});

// Route pour créer l'admin (une seule fois)
app.post('/api/auth/setup-admin', async (req, res) => {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return res.json({ 
        message: 'Admin déjà existant', 
        admin: {
          nom: adminExists.nom,
          matricule: adminExists.matricule,
          email: adminExists.email
        }
      });
    }
    
    // Créer l'admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      nom: 'Administrateur',
      matricule: 'ADMIN001',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });
    
    await admin.save();
    
    res.json({ 
      message: '✅ Admin créé avec succès',
      credentials: {
        matricule: 'ADMIN001',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { matricule, password } = req.body;
    
    console.log('Tentative de connexion:', matricule);
    
    // Chercher l'utilisateur
    const user = await User.findOne({ matricule });
    
    if (!user) {
      console.log('Utilisateur non trouvé:', matricule);
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('Mot de passe incorrect pour:', matricule);
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }
    
    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({ message: 'Compte désactivé' });
    }
    
    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_2026',
      { expiresIn: '7d' }
    );
    
    console.log('Connexion réussie pour:', matricule);
    
    res.json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        matricule: user.matricule,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route pour lister tous les utilisateurs (protégée)
app.get('/api/users', async (req, res) => {
  try {
    // Vérifier le token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_2026');
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    } catch (err) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Route pour voir tous les utilisateurs (sans authentification - seulement pour développement)
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Sans les mots de passe
    res.json({
      total: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Route pour lister tous les utilisateurs (protégée)
app.get('/api/users', async (req, res) => {
  try {
    // Vérifier le token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_2026');
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    } catch (err) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    
    // Récupérer tous les utilisateurs
    const users = await User.find({}).select('-__v');
    
    // Pour chaque utilisateur, ajouter un mot de passe temporaire (uniquement pour admin)
    // Normalement les mots de passe sont hashés, on ne peut pas les récupérer
    // On va générer un message indiquant que le mot de passe est hashé
    const usersWithPassword = users.map(user => {
      const userObj = user.toObject();
      // Ne pas inclure le mot de passe hashé
      delete userObj.password;
      // Ajouter un indicateur que le mot de passe est sécurisé
      userObj.passwordNote = "Mot de passe hashé (non récupérable)";
      return userObj;
    });
    
    res.json(usersWithPassword);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});



































// ========== NOUVEAU: MODÈLE POUR L'HISTORIQUE DES CHATS ==========
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

// ========== NOUVEAU: MODÈLE POUR LES FORMATIONS ==========
const formationSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  domaine: { type: String, enum: ['Services Postaux', 'Monétique & IT', 'Gestion Financière'], required: true },
  duree: { type: String, required: true },
  prerequis: { type: String },
  debouches: { type: String },
  wilayas: [{ type: String }],
  placesDisponibles: { type: Number, default: 0 },
  dateDebut: { type: Date },
  formateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Formation = mongoose.model('Formation', formationSchema);

// ========== NOUVEAU: MODÈLE POUR LES FAQ ==========
const FAQSchema = new mongoose.Schema({
  question: { type: String, required: true, unique: true },
  reponse: { type: String, required: true },
  keywords: [{ type: String }],
  categorie: { type: String, enum: ['formation', 'inscription', 'contact', 'horaire', 'general'] },
  vues: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const FAQ = mongoose.model('FAQ', FAQSchema);

// ========== ENDPOINT INTELLIGENT POUR LE CHATBOT ==========
app.post('/api/chatbot/message', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message requis" });
    }
    
    console.log(`💬 Message reçu de ${userId || 'visiteur'}: ${message}`);
    
    // Récupérer l'historique du chat (si utilisateur connecté)
    let chatHistory = null;
    if (userId) {
      chatHistory = await ChatHistory.findOne({ userId });
      if (!chatHistory) {
        chatHistory = new ChatHistory({ userId, messages: [] });
      }
    }
    
    // Analyser l'intention du message
    const intent = await analyzeIntent(message);
    console.log(`🎯 Intention détectée: ${intent.type}`);
    
    // Générer la réponse selon l'intention
    let response = await generateResponse(message, intent);
    
    // Sauvegarder dans l'historique (si utilisateur connecté)
    if (chatHistory && userId) {
      chatHistory.messages.push(
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: response, timestamp: new Date() }
      );
      chatHistory.updatedAt = new Date();
      await chatHistory.save();
    }
    
    res.json({
      success: true,
      response: response,
      intent: intent.type,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Erreur chatbot:', error);
    res.status(500).json({ 
      success: false, 
      response: "Désolé, je rencontre une difficulté technique. Veuillez réessayer dans quelques instants." 
    });
  }
});

// ========== FONCTION D'ANALYSE D'INTENTION ==========
async function analyzeIntent(message) {
  const lowerMsg = message.toLowerCase();
  
  // Détection des intentions
  const intents = {
    'formation': ['formation', 'cours', 'programme', 'apprendre', 'domaine', 'matière', 'étude', 'module'],
    'inscription': ['inscription', 'postuler', 'candidater', 'concours', 'recrutement', 'comment faire', 'procédure'],
    'disponibilite': ['disponible', '24h', 'horaire', 'quand', 'ouverture', 'fermeture', 'jour', 'nuit'],
    'contact': ['contact', 'email', 'téléphone', 'adresse', 'joindre', 'appeler', 'écrire'],
    'diplome': ['diplôme', 'certificat', 'reconnu', 'attestation', 'validation', 'certification'],
    'debouche': ['débouché', 'travail', 'emploi', 'carrière', 'après', 'profession', 'métier', 'salaire'],
    'prix': ['prix', 'coût', 'gratuit', 'payant', 'financement', 'argent', '€'],
    'duree': ['durée', 'longtemps', 'mois', 'année', 'combien de temps'],
    'statistiques': ['statistique', 'chiffre', 'nombre', 'combien', 'effectif', 'taux'],
    'utilisateur': ['mon compte', 'mon profil', 'mes infos', 'mon matricule', 'mon mot de passe']
  };
  
  for (const [intent, keywords] of Object.entries(intents)) {
    for (const keyword of keywords) {
      if (lowerMsg.includes(keyword)) {
        return { type: intent, confidence: 0.9 };
      }
    }
  }
  
  return { type: 'general', confidence: 0.5 };
}

// ========== FONCTION DE GÉNÉRATION DE RÉPONSE ==========
async function generateResponse(message, intent) {
  const lowerMsg = message.toLowerCase();
  
  switch (intent.type) {
    case 'formation':
      // Chercher dans la base FAQ d'abord
      const faqFormation = await FAQ.findOne({ 
        $or: [
          { categorie: 'formation' },
          { keywords: { $in: lowerMsg.split(' ') } }
        ]
      });
      
      if (faqFormation) {
        faqFormation.vues++;
        await faqFormation.save();
        return faqFormation.reponse;
      }
      
      // Récupérer les formations de la base
      const formations = await Formation.find().limit(3);
      if (formations.length > 0) {
        let response = "📚 **Nos formations disponibles** :\n\n";
        formations.forEach((f, i) => {
          response += `${i+1}. **${f.titre}**\n   ${f.description}\n   📍 Domaine: ${f.domaine}\n   ⏱️ Durée: ${f.duree}\n\n`;
        });
        response += "Pour plus de détails sur une formation spécifique, n'hésitez pas à demander !";
        return response;
      }
      
      return "📚 Nous proposons des formations dans 3 domaines : Services Postaux, Monétique & IT, et Gestion Financière. Toutes nos formations sont gratuites et certifiantes !";
    
    case 'inscription':
      return "📝 **Comment postuler à nos formations ?**\n\n1️⃣ Rendez-vous sur notre site web\n2️⃣ Cliquez sur 'Espace Apprenti' puis 'Postuler'\n3️⃣ Remplissez le formulaire d'inscription\n4️⃣ Un email de confirmation vous sera envoyé\n\n✨ **Important**: Les inscriptions pour 2026 sont actuellement ouvertes !";
    
    case 'disponibilite':
      return "🕐 **Disponibilité du service** :\n\n• Site web et chatbot: **24h/24, 7j/7**\n• Support téléphonique: Dim-Jeu 8h-16h\n• Réponse sous 24h pour les emails\n\nN'hésitez pas à me poser vos questions à tout moment !";
    
    case 'contact':
      const contacts = await FAQ.findOne({ categorie: 'contact' });
      if (contacts) return contacts.reponse;
      
      return "📞 **Nous contacter** :\n\n📍 **Adresse**: Alger, Bir Mourad Raïs\n📧 **Email**: formation@poste.dz\n📱 **Téléphone**: 021 XX XX XX\n💬 **Chat**: Disponible 24h/24\n\nUne question ? Je suis là pour vous aider !";
    
    case 'statistiques':
      const totalUsers = await User.countDocuments();
      const totalFormateurs = await User.countDocuments({ role: 'formateur' });
      const totalApprenants = await User.countDocuments({ role: 'apprenant' });
      const totalFormations = await Formation.countDocuments();
      
      return `📊 **Statistiques AP Learning** :\n\n👥 **Utilisateurs**: ${totalUsers}\n🎓 **Formateurs**: ${totalFormateurs}\n📚 **Apprenants**: ${totalApprenants}\n📖 **Formations**: ${totalFormations}\n✅ **Taux insertion**: 92%\n🏢 **Wilayas**: 58\n\nCes chiffres évoluent régulièrement avec l'arrivée de nouveaux apprenants !`;
    
    case 'utilisateur':
      return "👤 **Mon espace personnel** :\n\nPour accéder à vos informations :\n• Connectez-vous avec votre matricule\n• Consultez votre profil dans 'Mon compte'\n• Modifiez vos informations personnelles\n• Suivez l'avancement de votre formation\n\nBesoin d'aide pour vous connecter ? Contactez votre formateur !";
    
    default:
      // Chercher dans la FAQ générale
      const generalFAQ = await FAQ.findOne({ 
        $or: [
          { keywords: { $in: lowerMsg.split(' ') } },
          { question: { $regex: lowerMsg, $options: 'i' } }
        ]
      });
      
      if (generalFAQ) {
        generalFAQ.vues++;
        await generalFAQ.save();
        return generalFAQ.reponse;
      }
      
      return "🤔 Je comprends votre question. Voici ce que je peux vous aider à savoir :\n\n• 📚 **Formations** : Détails sur nos programmes\n• 📝 **Inscription** : Comment postuler\n• ⏰ **Horaires** : Disponibilité du service\n• 📞 **Contact** : Nos coordonnées\n• 📊 **Statistiques** : Chiffres clés\n\nPosez-moi une question sur ces sujets ou reformulez la vôtre !";
  }
}

// ========== ENDPOINT POUR AJOUTER DES FAQ ==========
app.post('/api/chatbot/faq', async (req, res) => {
  try {
    const { question, reponse, keywords, categorie } = req.body;
    
    const faq = new FAQ({
      question,
      reponse,
      keywords: keywords || question.toLowerCase().split(' '),
      categorie: categorie || 'general'
    });
    
    await faq.save();
    res.json({ success: true, message: "FAQ ajoutée", faq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ENDPOINT POUR AJOUTER UNE FORMATION ==========
app.post('/api/chatbot/formation', async (req, res) => {
  try {
    const { titre, description, domaine, duree, prerequis, debouches, wilayas, placesDisponibles } = req.body;
    
    const formation = new Formation({
      titre,
      description,
      domaine,
      duree,
      prerequis,
      debouches,
      wilayas: wilayas || ['Alger', 'Oran', 'Constantine'],
      placesDisponibles: placesDisponibles || 50
    });
    
    await formation.save();
    res.json({ success: true, message: "Formation ajoutée", formation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ENDPOINT POUR RÉCUPÉRER L'HISTORIQUE D'UN UTILISATEUR ==========
app.get('/api/chatbot/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await ChatHistory.findOne({ userId });
    res.json(history || { messages: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ENDPOINT POUR INITIALISER DES DONNÉES EXEMPLE ==========
app.post('/api/chatbot/init-data', async (req, res) => {
  try {
    // Ajouter des formations par défaut
    const formationsExist = await Formation.countDocuments();
    if (formationsExist === 0) {
      const defaultFormations = [
        {
          titre: "Agent des Services Postaux",
          description: "Formation complète pour maîtriser l'accueil client, la gestion du courrier et les opérations postales.",
          domaine: "Services Postaux",
          duree: "6 mois (3 mois théorie + 3 mois stage)",
          prerequis: "Baccalauréat",
          debouches: "Agent postal, Chef de bureau, Responsable clientèle",
          wilayas: ["Alger", "Oran", "Constantine", "Annaba", "Tizi Ouzou"],
          placesDisponibles: 120
        },
        {
          titre: "Technicien en Monétique",
          description: "Maintenance des automates bancaires, support technique et gestion des services numériques.",
          domaine: "Monétique & IT",
          duree: "8 mois (4 mois théorie + 4 mois stage)",
          prerequis: "Bac+2 en informatique",
          debouches: "Technicien maintenance, Support IT, Administrateur systèmes",
          wilayas: ["Alger", "Oran", "Constantine"],
          placesDisponibles: 60
        },
        {
          titre: "Conseiller Financier",
          description: "Maîtrise des opérations CCP, épargne postale et conseil clientèle.",
          domaine: "Gestion Financière",
          duree: "6 mois (3 mois théorie + 3 mois stage)",
          prerequis: "Bac+2 en finance/comptabilité",
          debouches: "Conseiller financier, Analyste crédit, Gestionnaire de patrimoine",
          wilayas: ["Alger", "Oran", "Constantine", "Sétif", "Blida"],
          placesDisponibles: 90
        }
      ];
      
      await Formation.insertMany(defaultFormations);
    }
    
    // Ajouter des FAQ par défaut
    const faqExist = await FAQ.countDocuments();
    if (faqExist === 0) {
      const defaultFAQs = [
        {
          question: "Quelles sont les conditions d'admission ?",
          reponse: "📋 **Conditions d'admission** :\n\n• Niveau minimum: Baccalauréat\n• Âge: 18 à 35 ans\n• Nationalité algérienne\n• Motivation pour le secteur postal\n\nAucune expérience préalable requise !",
          keywords: ["admission", "condition", "prérequis", "niveau", "bac"],
          categorie: "formation"
        },
        {
          question: "Y a-t-il des frais de formation ?",
          reponse: "✅ **Formation GRATUITE** !\n\nToutes nos formations sont entièrement gratuites car subventionnées par Algérie Poste. Aucun frais d'inscription ou de formation n'est demandé aux apprenants.",
          keywords: ["frais", "prix", "gratuit", "payant", "coût", "argent"],
          categorie: "formation"
        },
        {
          question: "Quel est le taux d'emploi après la formation ?",
          reponse: "📈 **Insertion professionnelle** :\n\n• Taux d'insertion: **92%**\n• Intégration possible chez Algérie Poste\n• Partenariats avec des entreprises du secteur\n• Accompagnement personnalisé\n\nLa majorité de nos diplômés trouvent un emploi dans les 6 mois suivant la formation.",
          keywords: ["emploi", "travail", "taux", "insertion", "débouché"],
          categorie: "debouche"
        }
      ];
      
      await FAQ.insertMany(defaultFAQs);
    }
    
    res.json({ success: true, message: "Données initialisées avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📝 Test: http://localhost:${PORT}/api/test`);
  console.log(`🔧 Setup admin: POST http://localhost:${PORT}/api/auth/setup-admin`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Users: GET http://localhost:${PORT}/api/users\n`);
});