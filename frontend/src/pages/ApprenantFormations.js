// src/pages/ApprenantFormations.js
import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, MapPin, Users, Clock, 
  BookOpen, Star, ChevronRight, Award, Target, Briefcase,
  CheckCircle, X, ChevronLeft, ChevronRight as ChevronRightIcon,
  Layers, Sparkles, Heart, Filter, GraduationCap, AlertCircle
} from 'lucide-react';

const ApprenantFormations = () => {
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState('all');
  const [showDetails, setShowDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 6;

  // Données par défaut (fallback) - Formations Algérie Poste
  const defaultFormations = [
    {
      _id: '1',
      titre: 'Agent des Services Postaux',
      description: 'Formation complète pour maîtriser l\'accueil client, la gestion du courrier et les opérations postales.',
      domaine: 'Services Postaux',
      duree: '6 mois (3 mois théorie + 3 mois stage pratique)',
      prerequis: 'Baccalauréat toutes séries confondues',
      debouches: 'Agent postal, Chef de bureau postal, Responsable clientèle, Superviseur d\'agence',
      wilayas: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Sétif', 'Tizi Ouzou', 'Blida', 'Béjaïa'],
      placesDisponibles: 120,
      dateDebut: '2026-01-15',
      statut: 'actif',
      tags: ['services postaux', 'agent', 'clientèle'],
      objectifs: [
        'Maîtriser l\'accueil client',
        'Gérer le courrier et les colis',
        'Utiliser les outils postaux',
        'Assurer la relation client'
      ],
      contenu: [
        'Module 1: Introduction aux services postaux',
        'Module 2: Gestion du courrier',
        'Module 3: Accueil et relation client',
        'Module 4: Opérations postales',
        'Module 5: Stage pratique'
      ]
    },
    {
      _id: '2',
      titre: 'Technicien en Monétique',
      description: 'Formation spécialisée dans la maintenance des automates bancaires, le support technique et la sécurisation des transactions.',
      domaine: 'Monétique & IT',
      duree: '8 mois (4 mois théorie + 4 mois stage)',
      prerequis: 'Bac+2 en informatique, électronique ou télécommunications',
      debouches: 'Technicien maintenance DAB, Support IT, Administrateur systèmes, Technicien réseau',
      wilayas: ['Alger', 'Oran', 'Constantine', 'Annaba'],
      placesDisponibles: 60,
      dateDebut: '2026-02-01',
      statut: 'actif',
      tags: ['monétique', 'technicien', 'maintenance', 'DAB'],
      objectifs: [
        'Maintenir les automates bancaires',
        'Assurer le support technique',
        'Sécuriser les transactions',
        'Gérer les incidents'
      ],
      contenu: [
        'Module 1: Architecture des DAB',
        'Module 2: Maintenance préventive',
        'Module 3: Support technique',
        'Module 4: Sécurité des transactions',
        'Module 5: Stage pratique'
      ]
    },
    {
      _id: '3',
      titre: 'Conseiller Financier',
      description: 'Maîtrise des opérations CCP, épargne postale, produits financiers et conseil client.',
      domaine: 'Gestion Financière',
      duree: '6 mois (3 mois théorie + 3 mois stage)',
      prerequis: 'Bac+2 en finance, comptabilité ou gestion',
      debouches: 'Conseiller financier, Analyste crédit, Gestionnaire de patrimoine, Chargé clientèle',
      wilayas: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Sétif', 'Blida'],
      placesDisponibles: 90,
      dateDebut: '2026-03-01',
      statut: 'actif',
      tags: ['finance', 'conseiller', 'CCP', 'épargne'],
      objectifs: [
        'Maîtriser les opérations CCP',
        'Gérer l\'épargne postale',
        'Conseiller les clients',
        'Analyser les produits financiers'
      ],
      contenu: [
        'Module 1: Opérations CCP',
        'Module 2: Produits d\'épargne',
        'Module 3: Conseil client',
        'Module 4: Analyse financière',
        'Module 5: Stage pratique'
      ]
    },
    {
      _id: '4',
      titre: 'Manager de Projet Digital',
      description: 'Formation aux méthodes agiles, gestion de projets digitaux et transformation numérique.',
      domaine: 'Monétique & IT',
      duree: '4 mois (2 mois théorie + 2 mois stage)',
      prerequis: 'Bac+3 en management ou informatique',
      debouches: 'Chef de projet digital, Product Owner, Scrum Master',
      wilayas: ['Alger', 'Oran'],
      placesDisponibles: 40,
      dateDebut: '2026-04-01',
      statut: 'actif',
      tags: ['digital', 'agile', 'projet', 'management'],
      objectifs: [
        'Maîtriser les méthodes agiles',
        'Gérer des projets digitaux',
        'Piloter la transformation numérique',
        'Manager des équipes projet'
      ],
      contenu: [
        'Module 1: Méthodes agiles',
        'Module 2: Gestion de projet digital',
        'Module 3: Transformation numérique',
        'Module 4: Management d\'équipe',
        'Module 5: Stage pratique'
      ]
    }
  ];

  // Récupérer les formations
  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Tentative de chargement des formations...');
      
      const token = localStorage.getItem('token');
      console.log('Token présent:', !!token);
      
      const response = await fetch('http://localhost:5000/api/formations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      console.log('Status réponse:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Données reçues:', data);
        
        if (data.success && data.data && data.data.length > 0) {
          const activeFormations = data.data.filter(f => f.statut === 'actif');
          console.log(`${activeFormations.length} formations actives trouvées`);
          setFormations(activeFormations);
          setFilteredFormations(activeFormations);
        } else {
          console.log('Aucune donnée de l\'API, utilisation des données par défaut');
          setFormations(defaultFormations);
          setFilteredFormations(defaultFormations);
        }
      } else {
        console.log('Erreur API, utilisation des données par défaut');
        setFormations(defaultFormations);
        setFilteredFormations(defaultFormations);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      setError('Erreur de connexion au serveur. Affichage des formations par défaut.');
      setFormations(defaultFormations);
      setFilteredFormations(defaultFormations);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les formations
  useEffect(() => {
    let filtered = formations;
    
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.domaine?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDomaine !== 'all') {
      filtered = filtered.filter(f => f.domaine === selectedDomaine);
    }
    
    setFilteredFormations(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDomaine, formations]);

  const totalPages = Math.ceil(filteredFormations.length / itemsPerPage);
  const paginatedFormations = filteredFormations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const domaines = [...new Set(formations.map(f => f.domaine).filter(Boolean))];

  const getDomaineIcon = (domaine) => {
    const icons = {
      'Services Postaux': '📮',
      'Monétique & IT': '💻',
      'Gestion Financière': '💰'
    };
    return icons[domaine] || '📚';
  };

  const getDomaineColor = (domaine) => {
    const colors = {
      'Services Postaux': 'bg-blue-100 text-blue-700',
      'Monétique & IT': 'bg-purple-100 text-purple-700',
      'Gestion Financière': 'bg-emerald-100 text-emerald-700'
    };
    return colors[domaine] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0055a2] border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-500">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0055a2] to-[#0077e6] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              📚 Catalogue des formations
            </h1>
            <p className="text-white/80 text-lg">
              Découvrez toutes nos formations certifiantes
            </p>
          </div>
          
          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white shadow-lg focus:ring-2 focus:ring-[#0055a2] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Message d'erreur éventuel */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-yellow-700">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter size={18} className="text-slate-400" />
            <select
              value={selectedDomaine}
              onChange={(e) => setSelectedDomaine(e.target.value)}
              className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200 transition-colors"
            >
              <option value="all">📚 Tous les domaines</option>
              {domaines.map(domaine => (
                <option key={domaine} value={domaine}>
                  {getDomaineIcon(domaine)} {domaine}
                </option>
              ))}
            </select>
            
            <div className="ml-auto text-sm text-slate-500">
              {filteredFormations.length} formation(s)
            </div>
          </div>
        </div>
      </div>

      {/* Liste des formations */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filteredFormations.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Aucune formation trouvée</h3>
            <p className="text-slate-500">Essayez de modifier votre recherche</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedFormations.map((formation) => (
                <div 
                  key={formation._id} 
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getDomaineColor(formation.domaine)}`}>
                        {getDomaineIcon(formation.domaine)} {formation.domaine}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                      {formation.titre}
                    </h3>
                    
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                      {formation.description}
                    </p>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={16} className="text-[#0055a2]" />
                        <span>{formation.duree}</span>
                      </div>
                      
                      {formation.wilayas && formation.wilayas.length > 0 && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin size={16} className="text-[#0055a2]" />
                          <span>{formation.wilayas[0]}{formation.wilayas.length > 1 ? ` +${formation.wilayas.length - 1}` : ''}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users size={16} className="text-[#0055a2]" />
                        <span>{formation.placesDisponibles} places disponibles</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowDetails(formation)}
                      className="w-full py-2.5 bg-[#0055a2] text-white font-semibold rounded-lg hover:bg-[#004080] transition-colors flex items-center justify-center gap-2"
                    >
                      Voir les détails
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRightIcon size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Détails */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Détails de la formation</h3>
              <button onClick={() => setShowDetails(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{showDetails.titre}</h2>
              <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold mb-4 ${getDomaineColor(showDetails.domaine)}`}>
                {getDomaineIcon(showDetails.domaine)} {showDetails.domaine}
              </span>
              
              <p className="text-slate-600 mb-6">{showDetails.description}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#0055a2]" />
                  <span className="font-medium">Durée:</span> {showDetails.duree}
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#0055a2]" />
                  <span className="font-medium">Prérequis:</span> {showDetails.prerequis}
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-[#0055a2]" />
                  <span className="font-medium">Débouchés:</span> {showDetails.debouches}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#0055a2]" />
                  <span className="font-medium">Wilayas:</span> {showDetails.wilayas?.join(', ')}
                </div>
              </div>
              
              {showDetails.objectifs && (
                <div className="mb-6">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Target size={18} /> Objectifs
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {showDetails.objectifs.map((obj, i) => (
                      <li key={i} className="text-slate-600 text-sm">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {showDetails.contenu && (
                <div className="mb-6">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Layers size={18} /> Programme
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {showDetails.contenu.map((item, i) => (
                      <li key={i} className="text-slate-600 text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button className="w-full py-3 bg-[#0055a2] text-white font-semibold rounded-lg hover:bg-[#004080] transition-colors">
                Postuler à cette formation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprenantFormations;