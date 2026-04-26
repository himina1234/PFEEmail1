// backend/models/Formation.js
const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
  titre: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  domaine: { 
    type: String, 
    required: true 
  },
  duree: { 
    type: String, 
    required: true 
  },
  prix: { 
    type: String, 
    default: 'Gratuit' 
  },
  prerequis: { 
    type: String, 
    default: '' 
  },
  debouches: { 
    type: String, 
    default: '' 
  },
  wilayas: [{ 
    type: String 
  }],
  placesDisponibles: { 
    type: Number, 
    default: 0 
  },
  dateDebut: { 
    type: Date 
  },
  formateur: { 
    type: String, 
    default: '' 
  },
  formateurId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  objectifs: [{ 
    type: String 
  }],
  contenu: [{ 
    type: String 
  }],
  image: { 
    type: String, 
    default: '' 
  },
  niveau: { 
    type: String, 
    enum: ['debutant', 'intermediaire', 'avance'], 
    default: 'debutant' 
  },
  statut: { 
    type: String, 
    enum: ['actif', 'inactif'], 
    default: 'actif' 
  },
  certificat: { 
    type: Boolean, 
    default: true 
  },
  tags: [{ 
    type: String 
  }],
  inscrits: { 
    type: Number, 
    default: 0 
  },
  note: { 
    type: Number, 
    default: 4.5 
  }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

module.exports = mongoose.model('Formation', formationSchema);