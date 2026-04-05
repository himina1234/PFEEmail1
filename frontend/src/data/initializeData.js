// data/initializeData.js
export const initializeUsers = () => {
  // Vérifier si les utilisateurs existent déjà
  const existingUsers = localStorage.getItem('users');
  if (existingUsers) return; // Déjà initialisé
  
  const users = [
    // Apprenants
    {
      id: "apprenant1",
      matricule: "2026DUJE8894",
      password: "NV!K$ZWL",
      nom: "Dupont",
      prenom: "Jean",
      role: "user",
      email: "jean.dupont@example.com",
      telephone: "06 12 34 56 78",
      avatar: "👤",
      fullName: "Jean Dupont",
      formateurId: "formateur1"
    },
    {
      id: "apprenant2",
      matricule: "2026MART5678",
      password: "password123",
      nom: "Martin",
      prenom: "Sophie",
      role: "user",
      email: "sophie.martin@example.com",
      telephone: "06 23 45 67 89",
      avatar: "👤",
      fullName: "Sophie Martin",
      formateurId: "formateur1"
    },
    {
      id: "apprenant3",
      matricule: "2026BERN9012",
      password: "password456",
      nom: "Bernard",
      prenom: "Lucas",
      role: "user",
      email: "lucas.bernard@example.com",
      telephone: "06 34 56 78 90",
      avatar: "👤",
      fullName: "Lucas Bernard",
      formateurId: "formateur2"
    },
    // Formateurs
    {
      id: "formateur1",
      matricule: "2026MAMA3572",
      password: "2dJg#GJP",
      nom: "Laplace",
      prenom: "Pierre",
      role: "formateur",
      email: "pierre.laplace@ap.com",
      telephone: "06 45 67 89 01",
      avatar: "🎓",
      fullName: "Pierre Laplace",
      specialite: "Développement Web",
      apprenants: ["apprenant1", "apprenant2"]
    },
    {
      id: "formateur2",
      matricule: "2026FORM5678",
      password: "formateur123",
      nom: "Moreau",
      prenom: "Isabelle",
      role: "formateur",
      email: "isabelle.moreau@ap.com",
      telephone: "06 56 78 90 12",
      avatar: "🎓",
      fullName: "Isabelle Moreau",
      specialite: "Gestion et Logistique",
      apprenants: ["apprenant3"]
    },
    // Admin
    {
      id: "admin1",
      matricule: "ADMIN001",
      password: "HU0DbK4v",
      nom: "Admin",
      prenom: "System",
      role: "admin",
      email: "admin@ap.com",
      telephone: "06 67 89 01 23",
      avatar: "👑",
      fullName: "System Admin"
    }
  ];
  
  localStorage.setItem('users', JSON.stringify(users));
  
  // Initialiser des messages d'exemple
  initializeSampleMessages();
};

const initializeSampleMessages = () => {
  // Messages entre Jean (apprenant1) et Pierre (formateur1)
  const messages1 = [
    {
      id: "msg1",
      senderId: "apprenant1",
      receiverId: "formateur1",
      message: "Bonjour Monsieur Laplace, j'ai une question sur le cours React. Je n'arrive pas à comprendre les hooks personnalisés.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
      senderRole: "user"
    },
    {
      id: "msg2",
      senderId: "formateur1",
      receiverId: "apprenant1",
      message: "Bonjour Jean, bien sûr ! Les hooks personnalisés permettent de réutiliser la logique avec état. Voulez-vous qu'on organise une session en visio pour en discuter ?",
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      read: true,
      senderRole: "formateur"
    },
    {
      id: "msg3",
      senderId: "apprenant1",
      receiverId: "formateur1",
      message: "Oui ce serait super ! Quand seriez-vous disponible ?",
      timestamp: new Date(Date.now() - 3400000).toISOString(),
      read: false,
      senderRole: "user"
    }
  ];
  
  // Messages entre Sophie (apprenant2) et Pierre (formateur1)
  const messages2 = [
    {
      id: "msg4",
      senderId: "apprenant2",
      receiverId: "formateur1",
      message: "Bonjour, pour le module Service Client, j'aimerais avoir des ressources supplémentaires.",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      senderRole: "user"
    }
  ];
  
  localStorage.setItem('chat_apprenant1_formateur1', JSON.stringify(messages1));
  localStorage.setItem('chat_apprenant2_formateur1', JSON.stringify(messages2));
};