// backend/routes/formationRoutes.js
const express = require('express');
const router = express.Router();
const Formation = require('../models/Formation');

// Middleware d'authentification (à importer depuis server.js)
// Pour l'instant, nous les passerons en paramètres

module.exports = (authMiddleware, adminMiddleware) => {
  
  // GET - Récupérer toutes les formations
  router.get('/', async (req, res) => {
    try {
      const formations = await Formation.find().sort({ createdAt: -1 });
      res.json({ success: true, data: formations });
    } catch (error) {
      console.error('❌ Erreur GET formations:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // GET - Récupérer une formation par ID
  router.get('/:id', async (req, res) => {
    try {
      const formation = await Formation.findById(req.params.id);
      if (!formation) {
        return res.status(404).json({ success: false, message: 'Formation non trouvée' });
      }
      res.json({ success: true, data: formation });
    } catch (error) {
      console.error('❌ Erreur GET formation:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // POST - Créer une formation (admin uniquement)
  router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      console.log('📝 Création formation:', req.body.titre);
      const formation = new Formation(req.body);
      await formation.save();
      console.log('✅ Formation créée:', formation._id);
      res.json({ success: true, data: formation, message: 'Formation créée avec succès' });
    } catch (error) {
      console.error('❌ Erreur POST formation:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // PUT - Mettre à jour une formation
  router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      console.log('📝 Mise à jour formation:', req.params.id);
      const formation = await Formation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!formation) {
        return res.status(404).json({ success: false, message: 'Formation non trouvée' });
      }
      console.log('✅ Formation mise à jour:', formation._id);
      res.json({ success: true, data: formation, message: 'Formation mise à jour avec succès' });
    } catch (error) {
      console.error('❌ Erreur PUT formation:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // DELETE - Supprimer une formation
  router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
      console.log('🗑️ Suppression formation:', req.params.id);
      const formation = await Formation.findByIdAndDelete(req.params.id);
      if (!formation) {
        return res.status(404).json({ success: false, message: 'Formation non trouvée' });
      }
      console.log('✅ Formation supprimée:', formation._id);
      res.json({ success: true, message: 'Formation supprimée avec succès' });
    } catch (error) {
      console.error('❌ Erreur DELETE formation:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
};