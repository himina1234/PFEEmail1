// backend/models/Inscription.js
const mongoose = require("mongoose");

const inscriptionSchema = new mongoose.Schema(
  {
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
    formationDomaine: {
      type: String,
      required: true,
    },
    statut: {
      type: String,
      enum: ["en_attente", "confirmee", "refusee", "annulee"],
      default: "en_attente",
    },
    demandeEnvoyeeLe: {
      type: Date,
      default: Date.now,
    },
    reponseLe: {
      type: Date,
    },
    messageApprenant: {
      type: String,
      default: "",
    },
    messageAdmin: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Inscription", inscriptionSchema);
