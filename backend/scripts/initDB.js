// backend/scripts/initDB.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_utilisateurs';

// Définition des schémas
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
  sexe: { type: String, enum: ['M', 'F'], default: null },
  adresse: { type: String, default: '' },
  formateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  apprenantsIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

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

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, unique: true },
  reponse: { type: String, required: true },
  keywords: [{ type: String }],
  categorie: { type: String, enum: ['formation', 'inscription', 'contact', 'horaire', 'general', 'statistiques'], default: 'general' },
  vues: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
    senderRole: String,
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiverName: String,
    message: String,
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  }],
  lastMessage: String,
  lastMessageTime: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const inscriptionSchema = new mongoose.Schema({
  apprenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  formationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation', required: true },
  dateInscription: { type: Date, default: Date.now },
  statut: { type: String, enum: ['en_attente', 'confirme', 'termine', 'annule'], default: 'en_attente' },
  progression: { type: Number, default: 0 },
  dateDebut: Date,
  dateFin: Date,
  note: { type: Number, min: 0, max: 20, default: null }
});

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre: String,
  message: String,
  type: { type: String, enum: ['info', 'success', 'warning', 'error'] },
  lu: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Création des modèles
const User = mongoose.model('User', userSchema);
const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
const Formation = mongoose.model('Formation', formationSchema);
const FAQ = mongoose.model('FAQ', faqSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const Inscription = mongoose.model('Inscription', inscriptionSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// Fonction principale d'initialisation
async function initDatabase() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

   
    console.log('📝 Création des index...');
    
    // Index pour User
    await User.collection.createIndex({ matricule: 1 }, { unique: true });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    
    // Index pour Formation
    await Formation.collection.createIndex({ titre: 1 });
    await Formation.collection.createIndex({ domaine: 1 });
    
    // Index pour FAQ
    await FAQ.collection.createIndex({ question: 1 }, { unique: true });
    await FAQ.collection.createIndex({ keywords: 1 });
    await FAQ.collection.createIndex({ categorie: 1 });
    
    // Index pour Conversation
    await Conversation.collection.createIndex({ participants: 1 });
    await Conversation.collection.createIndex({ lastMessageTime: -1 });
    
    // Index pour Inscription
    await Inscription.collection.createIndex({ apprenantId: 1, formationId: 1 }, { unique: true });
    await Inscription.collection.createIndex({ statut: 1 });
    
    // Index pour Notification
    await Notification.collection.createIndex({ userId: 1, lu: 1 });
    await Notification.collection.createIndex({ createdAt: -1 });
    
    console.log('✅ Index créés\n');

    // Création de l'administrateur par défaut
    console.log('👤 Création de l\'administrateur...');
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
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
        createdAt: new Date()
      });
      
      await admin.save();
      console.log('✅ Administrateur créé:');
      console.log('   📝 Matricule: ADMIN001');
      console.log('   🔑 Mot de passe: admin123\n');
    } else {
      console.log('✅ Administrateur déjà existant\n');
    }

    // Création de formations par défaut
    console.log('📚 Création des formations par défaut...');
    const formationsCount = await Formation.countDocuments();
    
    if (formationsCount === 0) {
      const defaultFormations = [
        {
          titre: "Agent des Services Postaux",
          description: "Formation complète pour maîtriser l'accueil client, la gestion du courrier, les opérations postales et la relation client.",
          domaine: "Services Postaux",
          duree: "6 mois (3 mois théorie + 3 mois stage pratique)",
          prerequis: "Baccalauréat toutes séries confondues",
          debouches: "Agent postal, Chef de bureau postal, Responsable clientèle, Superviseur",
          wilayas: ["Alger", "Oran", "Constantine", "Annaba", "Tizi Ouzou", "Sétif", "Blida", "Béjaïa"],
          placesDisponibles: 120,
          dateDebut: new Date(2026, 0, 15)
        },
        {
          titre: "Technicien en Monétique",
          description: "Formation spécialisée dans la maintenance des automates bancaires, le support technique et la gestion des services numériques.",
          domaine: "Monétique & IT",
          duree: "8 mois (4 mois théorie + 4 mois stage)",
          prerequis: "Bac+2 en informatique, électronique ou télécommunications",
          debouches: "Technicien maintenance DAB, Support IT, Administrateur systèmes, Technicien réseau",
          wilayas: ["Alger", "Oran", "Constantine", "Annaba"],
          placesDisponibles: 60,
          dateDebut: new Date(2026, 1, 1)
        },
        {
          titre: "Conseiller Financier",
          description: "Maîtrise des opérations CCP, épargne postale, produits financiers et conseil clientèle.",
          domaine: "Gestion Financière",
          duree: "6 mois (3 mois théorie + 3 mois stage)",
          prerequis: "Bac+2 en finance, comptabilité ou gestion",
          debouches: "Conseiller financier, Analyste crédit, Gestionnaire de patrimoine, Chargé de clientèle",
          wilayas: ["Alger", "Oran", "Constantine", "Sétif", "Blida", "Tlemcen"],
          placesDisponibles: 90,
          dateDebut: new Date(2026, 2, 1)
        },
        {
          titre: "Manager de Projet Digital",
          description: "Formation aux méthodes agiles, gestion de projets digitaux et transformation numérique.",
          domaine: "Monétique & IT",
          duree: "4 mois (2 mois théorie + 2 mois stage)",
          prerequis: "Bac+3 en management ou informatique",
          debouches: "Chef de projet digital, Product Owner, Scrum Master",
          wilayas: ["Alger", "Oran"],
          placesDisponibles: 40,
          dateDebut: new Date(2026, 3, 1)
        }
      ];
      
      await Formation.insertMany(defaultFormations);
      console.log(`✅ ${defaultFormations.length} formations créées\n`);
    } else {
      console.log(`✅ ${formationsCount} formations déjà existantes\n`);
    }

    // Création des FAQ par défaut
    console.log('❓ Création des FAQ par défaut...');
    const faqCount = await FAQ.countDocuments();
    
    if (faqCount === 0) {
      const defaultFAQs = [
        {
          question: "Quelles sont les conditions d'admission ?",
          reponse: "📋 **Conditions d'admission** :\n\n• Niveau minimum: Baccalauréat\n• Âge: 18 à 35 ans\n• Nationalité algérienne\n• Motivation pour le secteur postal\n\nAucune expérience préalable requise !",
          keywords: ["admission", "condition", "prérequis", "niveau", "bac", "age"],
          categorie: "formation",
          vues: 0
        },
        {
          question: "Y a-t-il des frais de formation ?",
          reponse: "✅ **Formation GRATUITE** !\n\nToutes nos formations sont entièrement gratuites car subventionnées par Algérie Poste. Aucun frais d'inscription ou de formation n'est demandé aux apprenants.",
          keywords: ["frais", "prix", "gratuit", "payant", "coût", "argent", "financement"],
          categorie: "formation",
          vues: 0
        },
        {
          question: "Quel est le taux d'emploi après la formation ?",
          reponse: "📈 **Insertion professionnelle** :\n\n• Taux d'insertion: **92%**\n• Intégration possible chez Algérie Poste\n• Partenariats avec des entreprises du secteur\n• Accompagnement personnalisé\n\nLa majorité de nos diplômés trouvent un emploi dans les 6 mois suivant la formation.",
          keywords: ["emploi", "travail", "taux", "insertion", "débouché", "carriere"],
          categorie: "statistiques",
          vues: 0
        },
        {
          question: "Comment postuler à une formation ?",
          reponse: "📝 **Procédure d'inscription** :\n\n1️⃣ Créez votre compte sur notre plateforme\n2️⃣ Complétez votre profil\n3️⃣ Sélectionnez la formation souhaitée\n4️⃣ Téléchargez les documents requis\n5️⃣ Soumettez votre candidature\n\nVous recevrez une réponse sous 48h.",
          keywords: ["postuler", "inscription", "candidater", "comment faire", "procedure"],
          categorie: "inscription",
          vues: 0
        },
        {
          question: "Quels sont les horaires du support ?",
          reponse: "🕐 **Horaires du support** :\n\n• Chatbot: 24h/24, 7j/7\n• Support téléphonique: Dimanche - Jeudi, 8h - 16h\n• Email: réponse sous 24h\n• Assistance technique: 24h/24 pour les urgences",
          keywords: ["horaire", "disponible", "quand", "ouverture", "support"],
          categorie: "horaire",
          vues: 0
        },
        {
          question: "Comment contacter le service formation ?",
          reponse: "📞 **Nous contacter** :\n\n📍 **Adresse**: Siège d'Algérie Poste, Bir Mourad Raïs, Alger\n📧 **Email**: formation@poste.dz\n📱 **Téléphone**: 021 XX XX XX\n💬 **Chat en ligne**: Disponible 24h/24\n\nUne question ? Notre équipe est à votre disposition !",
          keywords: ["contact", "email", "telephone", "adresse", "joindre", "appeler"],
          categorie: "contact",
          vues: 0
        }
      ];
      
      await FAQ.insertMany(defaultFAQs);
      console.log(`✅ ${defaultFAQs.length} FAQ créées\n`);
    } else {
      console.log(`✅ ${faqCount} FAQ déjà existantes\n`);
    }

    // Affichage des statistiques
    console.log('========================================');
    console.log('📊 STATISTIQUES DE LA BASE DE DONNÉES');
    console.log('========================================');
    
    const stats = {
      Utilisateurs: await User.countDocuments(),
      Admins: await User.countDocuments({ role: 'admin' }),
      Formateurs: await User.countDocuments({ role: 'formateur' }),
      Apprenants: await User.countDocuments({ role: 'apprenant' }),
      Formations: await Formation.countDocuments(),
      FAQs: await FAQ.countDocuments(),
      Conversations: await Conversation.countDocuments(),
      Inscriptions: await Inscription.countDocuments(),
      Notifications: await Notification.countDocuments()
    };
    
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log('========================================');
    console.log('✅ Initialisation de la base terminée !');
    console.log('========================================\n');
    
    // Fermer la connexion
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// Exécuter l'initialisation
initDatabase();