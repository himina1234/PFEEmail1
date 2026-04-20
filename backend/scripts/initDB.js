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

// SCHÉMA FORMATION MODIFIÉ AVEC IMAGE
const formationSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  domaine: { type: String, enum: ['Services Postaux', 'Monétique & IT', 'Gestion Financière', 'Développement Web', 'Soft Skills', 'Marketing Digital', 'Gestion de Projet', 'Langues', 'Informatique', 'Finance'], required: true },
  duree: { type: String, required: true },
  prix: { type: String, default: 'Gratuit' },
  prerequis: { type: String, default: '' },
  debouches: { type: String, default: '' },
  wilayas: [{ type: String }],
  placesDisponibles: { type: Number, default: 0 },
  inscrits: { type: Number, default: 0 },
  dateDebut: { type: Date },
  formateur: { type: String, default: '' },
  formateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  objectifs: [{ type: String }],
  contenu: [{ type: String }],
  image: { type: String, default: '' }, // NOUVEAU CHAMP POUR L'IMAGE
  niveau: { type: String, enum: ['debutant', 'intermediaire', 'avance'], default: 'debutant' },
  statut: { type: String, enum: ['actif', 'inactif'], default: 'actif' },
  certificat: { type: Boolean, default: true },
  tags: [{ type: String }],
  note: { type: Number, default: 4.5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
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

// URLs d'images par défaut pour les formations
const FORMATION_IMAGES = {
  'Services Postaux': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop',
  'Monétique & IT': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
  'Gestion Financière': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
  'Développement Web': 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop',
  'Soft Skills': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
  'Marketing Digital': 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop',
  'Gestion de Projet': 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop',
  'Langues': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
  'Informatique': 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=400&h=300&fit=crop',
  'Finance': 'https://images.unsplash.com/photo-1554224154-26032ffc0f07?w=400&h=300&fit=crop'
};

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
    await Formation.collection.createIndex({ statut: 1 });
    
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

    // Création de formations par défaut AVEC IMAGES
    console.log('📚 Création des formations par défaut...');
    const formationsCount = await Formation.countDocuments();
    
    if (formationsCount === 0) {
      const defaultFormations = [
        {
          titre: "Agent des Services Postaux",
          description: "Formation complète pour maîtriser l'accueil client, la gestion du courrier, les opérations postales et la relation client.",
          domaine: "Services Postaux",
          duree: "6 mois (3 mois théorie + 3 mois stage pratique)",
          prix: "Gratuit",
          prerequis: "Baccalauréat toutes séries confondues",
          debouches: "Agent postal, Chef de bureau postal, Responsable clientèle, Superviseur",
          wilayas: ["Alger", "Oran", "Constantine", "Annaba", "Tizi Ouzou", "Sétif", "Blida", "Béjaïa"],
          placesDisponibles: 120,
          inscrits: 0,
          dateDebut: new Date(2026, 0, 15),
          formateur: "M. Karim Benali",
          objectifs: [
            "Maîtriser les techniques d'accueil client",
            "Gérer efficacement le courrier et les colis",
            "Utiliser les outils informatiques postaux"
          ],
          contenu: [
            "Module 1: Introduction aux services postaux",
            "Module 2: Accueil et relation client",
            "Module 3: Gestion du courrier"
          ],
          image: FORMATION_IMAGES['Services Postaux'],
          niveau: "debutant",
          statut: "actif",
          certificat: true,
          tags: ["services postaux", "agent", "clientèle"],
          note: 4.7
        },
        {
          titre: "Technicien en Monétique",
          description: "Formation spécialisée dans la maintenance des automates bancaires, le support technique et la gestion des services numériques.",
          domaine: "Monétique & IT",
          duree: "8 mois (4 mois théorie + 4 mois stage)",
          prix: "Gratuit",
          prerequis: "Bac+2 en informatique, électronique ou télécommunications",
          debouches: "Technicien maintenance DAB, Support IT, Administrateur systèmes, Technicien réseau",
          wilayas: ["Alger", "Oran", "Constantine", "Annaba"],
          placesDisponibles: 60,
          inscrits: 0,
          dateDebut: new Date(2026, 1, 1),
          formateur: "Mme. Nadia Boudiaf",
          objectifs: [
            "Diagnostiquer et réparer les automates bancaires",
            "Gérer le parc informatique",
            "Assurer la sécurité des transactions"
          ],
          contenu: [
            "Module 1: Architecture des systèmes monétiques",
            "Module 2: Maintenance des DAB/GAB",
            "Module 3: Sécurité des transactions"
          ],
          image: FORMATION_IMAGES['Monétique & IT'],
          niveau: "intermediaire",
          statut: "actif",
          certificat: true,
          tags: ["monétique", "IT", "maintenance"],
          note: 4.8
        },
        {
          titre: "Conseiller Financier",
          description: "Maîtrise des opérations CCP, épargne postale, produits financiers et conseil clientèle.",
          domaine: "Gestion Financière",
          duree: "6 mois (3 mois théorie + 3 mois stage)",
          prix: "Gratuit",
          prerequis: "Bac+2 en finance, comptabilité ou gestion",
          debouches: "Conseiller financier, Analyste crédit, Gestionnaire de patrimoine, Chargé de clientèle",
          wilayas: ["Alger", "Oran", "Constantine", "Sétif", "Blida", "Tlemcen"],
          placesDisponibles: 90,
          inscrits: 0,
          dateDebut: new Date(2026, 2, 1),
          formateur: "M. Sofiane Merabet",
          objectifs: [
            "Maîtriser les produits d'épargne postale",
            "Analyser les demandes de crédit",
            "Conseiller les clients sur les placements"
          ],
          contenu: [
            "Module 1: Introduction aux produits financiers",
            "Module 2: Opérations CCP avancées",
            "Module 3: Épargne et placements"
          ],
          image: FORMATION_IMAGES['Gestion Financière'],
          niveau: "intermediaire",
          statut: "actif",
          certificat: true,
          tags: ["finance", "conseil", "épargne"],
          note: 4.6
        },
        {
          titre: "Manager de Projet Digital",
          description: "Formation aux méthodes agiles, gestion de projets digitaux et transformation numérique.",
          domaine: "Monétique & IT",
          duree: "4 mois (2 mois théorie + 2 mois stage)",
          prix: "Gratuit",
          prerequis: "Bac+3 en management ou informatique",
          debouches: "Chef de projet digital, Product Owner, Scrum Master",
          wilayas: ["Alger", "Oran"],
          placesDisponibles: 40,
          inscrits: 0,
          dateDebut: new Date(2026, 3, 1),
          formateur: "Mme. Leila Bouaziz",
          objectifs: [
            "Maîtriser les méthodes agiles",
            "Piloter des projets digitaux",
            "Manager des équipes techniques"
          ],
          contenu: [
            "Module 1: Fondamentaux du management de projet",
            "Module 2: Méthodologies agiles (Scrum, Kanban)",
            "Module 3: Outils de gestion de projet"
          ],
          image: FORMATION_IMAGES['Gestion de Projet'],
          niveau: "avance",
          statut: "actif",
          certificat: true,
          tags: ["gestion projet", "agile", "digital"],
          note: 4.9
        }
      ];
      
      await Formation.insertMany(defaultFormations);
      console.log(`✅ ${defaultFormations.length} formations créées avec images\n`);
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
    
    // Afficher les formations avec leurs images
    const formations = await Formation.find();
    console.log('\n🖼️ Formations avec images:');
    formations.forEach(f => {
      console.log(`   - ${f.titre}: ${f.image || 'Pas d\'image'}`);
    });
    
    console.log('\n✅ Initialisation de la base terminée !');
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