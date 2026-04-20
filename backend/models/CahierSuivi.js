// backend/models/CahierSuivi.js
const mongoose = require("mongoose");

const cahierSuiviSchema = new mongoose.Schema({
  apprenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  formationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Formation",
    required: true,
  },
  formationTitre: {
    type: String,
    required: true,
  },
  semaine: {
    type: Number,
    required: true,
  },
  dateDebut: {
    type: Date,
    required: true,
  },
  dateFin: {
    type: Date,
    required: true,
  },
  objectifs: {
    type: String,
    default: "",
  },
  activitesRealisees: {
    type: String,
    default: "",
  },
  difficultes: {
    type: String,
    default: "",
  },
  suggestions: {
    type: String,
    default: "",
  },
  progression: {
    type: Number,
    default: 0,
  },
  statut: {
    type: String,
    enum: ["en_cours", "valide", "a_revoir", "non_rempli"],
    default: "non_rempli",
  },
  commentaireFormateur: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CahierSuivi", cahierSuiviSchema);
