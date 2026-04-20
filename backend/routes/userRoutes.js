const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');
const { authMiddleware, checkRole } = require('../middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Routes admin seulement
router.get('/', checkRole('admin'), userController.getAllUsers);
router.post('/import', checkRole('admin'), upload.single('file'), userController.importUsers);
router.put('/:id', checkRole('admin'), userController.updateUser);
// routes/userRoutes.js ou dans votre server.js
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // ou req.user._id selon votre auth
    const { prenom, nom, email, telephone, adresse, dateNaissance, sexe, avatar } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        prenom,
        nom,
        email,
        telephone,
        adresse,
        dateNaissance,
        sexe,
        avatar,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password'); // Exclure le mot de passe
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ 
      success: true, 
      message: 'Profil mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Route pour récupérer le profil
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});
module.exports = router;