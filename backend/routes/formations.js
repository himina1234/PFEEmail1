// backend/routes/formations.js
const express = require('express');
const router = express.Router();
const Formation = require('../models/Formation');

// GET - Récupérer toutes les formations
router.get('/', async (req, res) => {
  try {
    const formations = await Formation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: formations });
  } catch (error) {
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
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Créer une nouvelle formation
router.post('/', async (req, res) => {
  try {
    const formation = new Formation(req.body);
    await formation.save();
    res.status(201).json({ success: true, data: formation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT - Mettre à jour une formation
router.put('/:id', async (req, res) => {
  try {
    const formation = await Formation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!formation) {
      return res.status(404).json({ success: false, message: 'Formation non trouvée' });
    }
    res.json({ success: true, data: formation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE - Supprimer une formation
router.delete('/:id', async (req, res) => {
  try {
    const formation = await Formation.findByIdAndDelete(req.params.id);
    if (!formation) {
      return res.status(404).json({ success: false, message: 'Formation non trouvée' });
    }
    res.json({ success: true, message: 'Formation supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET - Filtrer par catégorie
router.get('/categorie/:categorie', async (req, res) => {
  try {
    const formations = await Formation.find({ domaine: req.params.categorie });
    res.json({ success: true, data: formations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;