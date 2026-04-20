// backend/routes/cahierSuiviRoutes.js
const express = require("express");
const router = express.Router();
const CahierSuivi = require("../models/CahierSuivi");

// POST - Créer ou mettre à jour une entrée du cahier de suivi
router.post("/save", async (req, res) => {
  try {
    console.log("📝 Body reçu:", req.body);
    console.log("👤 Utilisateur:", req.userId);

    const apprenantId = req.userId;
    const {
      formationId,
      formationTitre,
      semaine,
      dateDebut,
      dateFin,
      objectifs,
      activitesRealisees,
      difficultes,
      suggestions,
      progression,
    } = req.body;

    // Validation des champs requis
    if (!formationId || !formationTitre || !semaine) {
      return res.status(400).json({
        success: false,
        message:
          "Champs requis manquants: formationId, formationTitre, semaine",
      });
    }

    let suivi = await CahierSuivi.findOne({
      apprenantId,
      formationId,
      semaine,
    });

    if (suivi) {
      // Mettre à jour
      suivi.objectifs = objectifs || suivi.objectifs;
      suivi.activitesRealisees = activitesRealisees || suivi.activitesRealisees;
      suivi.difficultes = difficultes || suivi.difficultes;
      suivi.suggestions = suggestions || suivi.suggestions;
      suivi.progression = progression || suivi.progression;
      suivi.dateDebut = dateDebut || suivi.dateDebut;
      suivi.dateFin = dateFin || suivi.dateFin;
      suivi.updatedAt = new Date();
      await suivi.save();
      console.log("✅ Cahier de suivi mis à jour");
    } else {
      // Créer
      suivi = new CahierSuivi({
        apprenantId,
        formationId,
        formationTitre,
        semaine,
        dateDebut: dateDebut || new Date(),
        dateFin: dateFin || new Date(),
        objectifs: objectifs || "",
        activitesRealisees: activitesRealisees || "",
        difficultes: difficultes || "",
        suggestions: suggestions || "",
        progression: progression || 0,
        statut: "en_cours",
      });
      await suivi.save();
      console.log("✅ Nouveau cahier de suivi créé");
    }

    res.json({
      success: true,
      data: suivi,
      message: "Cahier de suivi enregistré",
    });
  } catch (error) {
    console.error("❌ Erreur sauvegarde cahier suivi:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET - Récupérer le cahier de suivi d'un apprenant pour une formation
router.get("/apprenant/:formationId", async (req, res) => {
  try {
    const apprenantId = req.userId;
    const { formationId } = req.params;

    const suivis = await CahierSuivi.find({
      apprenantId,
      formationId,
    }).sort({ semaine: 1 });

    res.json({ success: true, data: suivis });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET - Récupérer les statistiques
router.get("/stats/:formationId", async (req, res) => {
  try {
    const apprenantId = req.userId;
    const { formationId } = req.params;

    const suivis = await CahierSuivi.find({ apprenantId, formationId });

    const totalSemaines = suivis.length;
    const semainesRemplies = suivis.filter(
      (s) => s.statut !== "non_rempli",
    ).length;
    const progressionMoyenne =
      suivis.reduce((acc, s) => acc + (s.progression || 0), 0) /
      (totalSemaines || 1);

    res.json({
      success: true,
      data: {
        totalSemaines,
        semainesRemplies,
        progressionMoyenne: Math.round(progressionMoyenne),
      },
    });
  } catch (error) {
    console.error("Erreur stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
