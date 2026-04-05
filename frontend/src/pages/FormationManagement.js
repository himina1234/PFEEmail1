// FormationManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, CheckCircle, AlertCircle,
  BookOpen, Clock, DollarSign, Users, Star, Calendar,
  Search, Filter, Download, Upload, Eye, Copy,
  Video, FileText, Link, Image, Save, RefreshCw
} from 'lucide-react';

const FormationManagement = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetails, setShowDetails] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    duree: '',
    prix: '',
    categorie: '',
    niveau: 'debutant',
    statut: 'actif',
    image: '',
    formateur: '',
    objectifs: [],
    prerequis: [],
    contenu: [],
    certificat: true,
    places: '',
    inscrits: 0,
    dateDebut: '',
    dateFin: '',
    horaire: '',
    tags: []
  });

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = () => {
    const savedFormations = localStorage.getItem('formations');
    if (savedFormations) {
      setFormations(JSON.parse(savedFormations));
    } else {
      // Données par défaut
      const defaultFormations = [
        {
          id: '1',
          titre: 'Administration des Services Postaux',
          description: 'Formation complète sur la gestion des services postaux et la relation client.',
          duree: '40 heures',
          prix: '15 000 DZD',
          categorie: 'Administration',
          niveau: 'intermediaire',
          statut: 'actif',
          image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
          formateur: 'Mohamed Kaci',
          objectifs: [
            'Maîtriser les procédures administratives',
            'Gérer les réclamations clients',
            'Utiliser les outils de gestion'
          ],
          prerequis: ['Bases de l\'administration', 'Connaissances informatiques'],
          contenu: [
            'Module 1: Introduction aux services postaux',
            'Module 2: Gestion des documents',
            'Module 3: Relation client',
            'Module 4: Outils de gestion'
          ],
          certificat: true,
          places: 25,
          inscrits: 18,
          dateDebut: '2026-04-15',
          dateFin: '2026-05-20',
          horaire: 'Lun-Mer-Ven 14h-17h',
          tags: ['administration', 'service client', 'gestion'],
          note: 4.8,
          avis: 24
        },
        {
          id: '2',
          titre: 'Formation JavaScript Avancé',
          description: 'Maîtrisez les concepts avancés de JavaScript pour le développement web.',
          duree: '30 heures',
          prix: '12 000 DZD',
          categorie: 'Développement Web',
          niveau: 'avance',
          statut: 'actif',
          image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=300&fit=crop',
          formateur: 'Fatima Zohra',
          objectifs: [
            'Comprendre les closures et le scope',
            'Maîtriser les promesses et async/await',
            'Développer avec les design patterns'
          ],
          prerequis: ['Bases de JavaScript', 'HTML/CSS'],
          contenu: [
            'Module 1: Fonctions avancées',
            'Module 2: Programmation asynchrone',
            'Module 3: Design Patterns',
            'Module 4: Performance et optimisation'
          ],
          certificat: true,
          places: 20,
          inscrits: 15,
          dateDebut: '2026-04-10',
          dateFin: '2026-05-15',
          horaire: 'Mar-Jeu 18h-21h',
          tags: ['javascript', 'web', 'programmation'],
          note: 4.9,
          avis: 32
        },
        {
          id: '3',
          titre: 'Communication Professionnelle',
          description: 'Développez vos compétences en communication orale et écrite.',
          duree: '20 heures',
          prix: '8 000 DZD',
          categorie: 'Soft Skills',
          niveau: 'debutant',
          statut: 'actif',
          image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=400&h=300&fit=crop',
          formateur: 'Karim Benali',
          objectifs: [
            'Améliorer la communication orale',
            'Rédiger des documents professionnels',
            'Gérer les conflits'
          ],
          prerequis: ['Aucun'],
          contenu: [
            'Module 1: Bases de la communication',
            'Module 2: Communication écrite',
            'Module 3: Communication orale',
            'Module 4: Gestion des conflits'
          ],
          certificat: true,
          places: 30,
          inscrits: 22,
          dateDebut: '2026-05-01',
          dateFin: '2026-05-25',
          horaire: 'Sam-Dim 09h-12h',
          tags: ['communication', 'soft skills', 'professionnel'],
          note: 4.7,
          avis: 18
        }
      ];
      localStorage.setItem('formations', JSON.stringify(defaultFormations));
      setFormations(defaultFormations);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleArrayChange = (field, value) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData({ ...formData, [field]: items });
  };

  const handleTagsChange = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags });
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      duree: '',
      prix: '',
      categorie: '',
      niveau: 'debutant',
      statut: 'actif',
      image: '',
      formateur: '',
      objectifs: [],
      prerequis: [],
      contenu: [],
      certificat: true,
      places: '',
      inscrits: 0,
      dateDebut: '',
      dateFin: '',
      horaire: '',
      tags: []
    });
    setEditingFormation(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titre || !formData.description || !formData.duree || !formData.prix || !formData.categorie) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let updatedFormations;
      
      if (editingFormation) {
        updatedFormations = formations.map(f =>
          f.id === editingFormation.id
            ? { ...f, ...formData, updatedAt: new Date().toISOString() }
            : f
        );
        setSuccess('Formation modifiée avec succès !');
      } else {
        const newFormation = {
          id: Date.now().toString(),
          ...formData,
          inscrits: 0,
          note: 0,
          avis: 0,
          createdAt: new Date().toISOString()
        };
        updatedFormations = [...formations, newFormation];
        setSuccess('Formation ajoutée avec succès !');
      }
      
      localStorage.setItem('formations', JSON.stringify(updatedFormations));
      setFormations(updatedFormations);
      resetForm();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Erreur lors de l\'opération: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      const updatedFormations = formations.filter(f => f.id !== id);
      localStorage.setItem('formations', JSON.stringify(updatedFormations));
      setFormations(updatedFormations);
      setSuccess('Formation supprimée avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleEdit = (formation) => {
    setEditingFormation(formation);
    setFormData({
      titre: formation.titre,
      description: formation.description,
      duree: formation.duree,
      prix: formation.prix,
      categorie: formation.categorie,
      niveau: formation.niveau,
      statut: formation.statut,
      image: formation.image || '',
      formateur: formation.formateur,
      objectifs: formation.objectifs || [],
      prerequis: formation.prerequis || [],
      contenu: formation.contenu || [],
      certificat: formation.certificat,
      places: formation.places || '',
      inscrits: formation.inscrits || 0,
      dateDebut: formation.dateDebut || '',
      dateFin: formation.dateFin || '',
      horaire: formation.horaire || '',
      tags: formation.tags || []
    });
    setShowForm(true);
  };

  const duplicateFormation = (formation) => {
    const newFormation = {
      ...formation,
      id: Date.now().toString(),
      titre: `${formation.titre} (Copie)`,
      inscrits: 0,
      createdAt: new Date().toISOString()
    };
    const updatedFormations = [...formations, newFormation];
    localStorage.setItem('formations', JSON.stringify(updatedFormations));
    setFormations(updatedFormations);
    setSuccess('Formation dupliquée avec succès !');
    setTimeout(() => setSuccess(null), 3000);
  };

  const toggleStatut = (id) => {
    const updatedFormations = formations.map(f =>
      f.id === id ? { ...f, statut: f.statut === 'actif' ? 'inactif' : 'actif' } : f
    );
    localStorage.setItem('formations', JSON.stringify(updatedFormations));
    setFormations(updatedFormations);
  };

  const filteredFormations = formations.filter(f => {
    const matchesSearch = f.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || f.categorie === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || f.statut === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    'Administration',
    'Développement Web',
    'Soft Skills',
    'Marketing Digital',
    'Gestion de Projet',
    'Langues',
    'Informatique',
    'Finance'
  ];

  const niveaux = [
    { value: 'debutant', label: 'Débutant', color: 'bg-green-100 text-green-800' },
    { value: 'intermediaire', label: 'Intermédiaire', color: 'bg-blue-100 text-blue-800' },
    { value: 'avance', label: 'Avancé', color: 'bg-purple-100 text-purple-800' }
  ];

  const getStatutBadge = (statut) => {
    if (statut === 'actif') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Actif</span>;
    }
    return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Inactif</span>;
  };

  const getNiveauBadge = (niveau) => {
    const n = niveaux.find(n => n.value === niveau);
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${n?.color || 'bg-gray-100 text-gray-800'}`}>{n?.label || niveau}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                  <BookOpen size={32} />
                  Gestion des Formations
                </h1>
                <p className="text-blue-100">
                  Créez, modifiez et gérez toutes les formations de la plateforme
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gray-50">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total formations</p>
                  <p className="text-3xl font-bold text-gray-800">{formations.length}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Formations actives</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formations.filter(f => f.statut === 'actif').length}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total inscrits</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {formations.reduce((acc, f) => acc + (f.inscrits || 0), 0)}
                  </p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <Users className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Note moyenne</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {(formations.reduce((acc, f) => acc + (f.note || 0), 0) / formations.length || 0).toFixed(1)}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Star className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 shadow-md"
              >
                <Plus size={20} />
                Ajouter une formation
              </button>
              
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher une formation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes catégories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous statuts</option>
                  <option value="actif">Actifs</option>
                  <option value="inactif">Inactifs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-green-800">{success}</span>
            </div>
          )}
          
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Formulaire d'ajout/modification */}
          {showForm && (
            <div className="m-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                {editingFormation ? '✏️ Modifier la formation' : '➕ Ajouter une formation'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la formation *</label>
                    <input
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Formation JavaScript Avancé"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Description détaillée de la formation..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                    <select
                      name="categorie"
                      value={formData.categorie}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Niveau *</label>
                    <select
                      name="niveau"
                      value={formData.niveau}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {niveaux.map(n => (
                        <option key={n.value} value={n.value}>{n.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durée *</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="duree"
                        value={formData.duree}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="40 heures"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="prix"
                        value={formData.prix}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="15 000 DZD"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Formateur</label>
                    <input
                      type="text"
                      name="formateur"
                      value={formData.formateur}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom du formateur"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de places</label>
                    <input
                      type="number"
                      name="places"
                      value={formData.places}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="25"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                    <input
                      type="date"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horaire</label>
                    <input
                      type="text"
                      name="horaire"
                      value={formData.horaire}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Lun-Mer-Ven 14h-17h"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      name="statut"
                      value={formData.statut}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="certificat"
                        checked={formData.certificat}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Certificat de fin de formation</span>
                    </label>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Objectifs (un par ligne)</label>
                    <textarea
                      value={formData.objectifs.join('\n')}
                      onChange={(e) => handleArrayChange('objectifs', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Maîtriser les concepts avancés&#10;Développer des applications complexes&#10;Optimiser les performances"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prérequis (un par ligne)</label>
                    <textarea
                      value={formData.prerequis.join('\n')}
                      onChange={(e) => handleArrayChange('prerequis', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Bases de JavaScript&#10;Connaissances HTML/CSS"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contenu du cours (un par ligne)</label>
                    <textarea
                      value={formData.contenu.join('\n')}
                      onChange={(e) => handleArrayChange('contenu', e.target.value)}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Module 1: Introduction&#10;Module 2: Concepts avancés&#10;Module 3: Projet pratique"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (séparés par des virgules)</label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="javascript, web, programmation"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Traitement...' : (editingFormation ? 'Mettre à jour' : 'Ajouter')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des formations */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              📚 Liste des formations ({filteredFormations.length})
            </h3>
            
            {filteredFormations.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Aucune formation trouvée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFormations.map(formation => (
                  <div key={formation.id} className="bg-white border border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={formation.image || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop'} 
                        alt={formation.titre}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {getStatutBadge(formation.statut)}
                      </div>
                      <div className="absolute bottom-4 left-4">
                        {getNiveauBadge(formation.niveau)}
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-gray-800 flex-1">{formation.titre}</h4>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star size={14} className="fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-700">{formation.note || 4.5}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{formation.description}</p>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {formation.duree}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} className="text-green-600" />
                          <span className="text-green-600 font-medium">{formation.prix}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Users size={14} />
                          {formation.inscrits}/{formation.places || '∞'} inscrits
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar size={14} />
                          {formation.dateDebut ? new Date(formation.dateDebut).toLocaleDateString() : 'À venir'}
                        </span>
                      </div>
                      
                      {formation.formateur && (
                        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                          <Users size={12} />
                          Formateur: {formation.formateur}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {formation.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                        {formation.tags?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{formation.tags.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => setShowDetails(formation)}
                          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <Eye size={14} />
                          Détails
                        </button>
                        <button
                          onClick={() => duplicateFormation(formation)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Dupliquer"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => toggleStatut(formation.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            formation.statut === 'actif' 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={formation.statut === 'actif' ? 'Désactiver' : 'Activer'}
                        >
                          {formation.statut === 'actif' ? <X size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button
                          onClick={() => handleEdit(formation)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(formation.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Détails */}
      {showDetails && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Détails de la formation</h3>
                <button onClick={() => setShowDetails(null)} className="hover:bg-white/20 p-2 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={showDetails.image || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop'} 
                    alt={showDetails.titre}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">{showDetails.titre}</h4>
                  <div className="flex gap-2 mb-4">
                    {getStatutBadge(showDetails.statut)}
                    {getNiveauBadge(showDetails.niveau)}
                  </div>
                  <p className="text-gray-600 mb-4">{showDetails.description}</p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2"><Clock size={16} /> Durée: {showDetails.duree}</p>
                    <p className="flex items-center gap-2"><DollarSign size={16} /> Prix: {showDetails.prix}</p>
                    <p className="flex items-center gap-2"><Users size={16} /> Formateur: {showDetails.formateur}</p>
                    <p className="flex items-center gap-2"><Calendar size={16} /> Dates: {showDetails.dateDebut} → {showDetails.dateFin}</p>
                    <p className="flex items-center gap-2"><Clock size={16} /> Horaire: {showDetails.horaire}</p>
                    <p className="flex items-center gap-2"><Users size={16} /> Places: {showDetails.inscrits}/{showDetails.places}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h5 className="font-bold text-gray-800 mb-2">Objectifs</h5>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  {showDetails.objectifs?.map((obj, i) => (
                    <li key={i} className="text-gray-600 text-sm">{obj}</li>
                  ))}
                </ul>
                
                <h5 className="font-bold text-gray-800 mb-2">Prérequis</h5>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  {showDetails.prerequis?.map((pre, i) => (
                    <li key={i} className="text-gray-600 text-sm">{pre}</li>
                  ))}
                </ul>
                
                <h5 className="font-bold text-gray-800 mb-2">Contenu du cours</h5>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  {showDetails.contenu?.map((cont, i) => (
                    <li key={i} className="text-gray-600 text-sm">{cont}</li>
                  ))}
                </ul>
                
                <div className="flex flex-wrap gap-2">
                  {showDetails.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormationManagement;