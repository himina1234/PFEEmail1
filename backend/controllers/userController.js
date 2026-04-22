// backend/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const XLSX = require('xlsx');

// Générer un mot de passe temporaire
const generateTemporaryPassword = () => {
  const length = 10;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specials = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + specials;
  
  let password = '';
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specials.charAt(Math.floor(Math.random() * specials.length));
  
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Importer des utilisateurs depuis Excel avec envoi d'emails
exports.importUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const createdUsers = [];
    const emailResults = [];

    for (const row of data) {
      // Valider les données
      if (!row.matricule || !row.nom || !row.prenom || !row.email) {
        console.log('Données manquantes pour:', row);
        continue;
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ 
        $or: [{ matricule: row.matricule }, { email: row.email }] 
      });

      if (existingUser) {
        console.log(`Utilisateur ${row.matricule} existe déjà`);
        continue;
      }

      // Générer mot de passe temporaire
      const temporaryPassword = generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      // Déterminer le rôle
      let role = 'apprenant';
      if (row.rôle && (row.rôle.toLowerCase() === 'admin' || row.rôle.toLowerCase() === 'administrateur')) {
        role = 'admin';
      } else if (row.rôle && (row.rôle.toLowerCase() === 'formateur' || row.rôle.toLowerCase() === 'professeur')) {
        role = 'formateur';
      }

      // Créer l'utilisateur
      const user = new User({
        matricule: row.matricule.toString(),
        nom: row.nom,
        prenom: row.prenom,
        email: row.email,
        telephone: row.téléphone || row.telephone || '',
        role: role,
        password: hashedPassword,
        status: 'actif',
        createdAt: new Date()
      });

      await user.save();

      // Préparer les données pour l'email
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;

      createdUsers.push({
        ...userWithoutPassword,
        temporaryPassword
      });

      // Envoyer l'email de bienvenue
      const emailResult = await emailService.sendWelcomeEmail(user, temporaryPassword);
      emailResults.push({
        email: user.email,
        matricule: user.matricule,
        success: emailResult.success,
        error: emailResult.error
      });
    }

    res.json({
      success: true,
      message: `${createdUsers.length} utilisateurs importés avec succès`,
      data: {
        created: createdUsers,
        emailResults: emailResults,
        stats: {
          total: createdUsers.length,
          emailsSent: emailResults.filter(r => r.success).length,
          emailsFailed: emailResults.filter(r => !r.success).length
        }
      }
    });

  } catch (error) {
    console.error('Erreur importUsers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Erreur updateUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Réinitialiser le mot de passe avec envoi d'email
exports.resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetAt = new Date();
    await user.save();
    
    // Envoyer l'email
    const emailResult = await emailService.sendPasswordResetEmail(user, newPassword);
    
    if (!emailResult.success) {
      console.error('Erreur envoi email:', emailResult.error);
      return res.json({ 
        success: true, 
        warning: 'Mot de passe changé mais email non envoyé',
        emailError: emailResult.error,
        data: { ...user.toObject(), password: newPassword }
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Mot de passe réinitialisé et email envoyé',
      data: { ...user.toObject(), password: newPassword }
    });
    
  } catch (error) {
    console.error('Erreur resetPassword:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Changer le statut d'un utilisateur
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { status: status },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Erreur toggleUserStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};