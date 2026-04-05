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

module.exports = router;