import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertCircle,
  Package,
  Tag,
  Clock,
  DollarSign,
  Layers,
  TrendingUp,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

const ServiceManagement = ({ onClose }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    duree: '',
    categorie: '',
    disponible: true
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    const savedServices = localStorage.getItem('services');
    if (savedServices) {
      setServices(JSON.parse(savedServices));
    } else {
      const defaultServices = [
        {
          id: '1',
          nom: 'Carte d\'identité nationale',
          description: 'Demande de carte d\'identité nationale algérienne',
          prix: '2500 DZD',
          duree: '7 jours',
          categorie: 'Documents d\'identité',
          disponible: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          nom: 'Passeport biométrique',
          description: 'Demande de passeport algérien',
          prix: '5000 DZD',
          duree: '15 jours',
          categorie: 'Documents d\'identité',
          disponible: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          nom: 'Extrait de naissance',
          description: 'Demande d\'extrait de naissance en ligne',
          prix: '500 DZD',
          duree: '3 jours',
          categorie: 'Documents d\'état civil',
          disponible: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          nom: 'Certificat de résidence',
          description: 'Attestation de résidence',
          prix: '800 DZD',
          duree: '5 jours',
          categorie: 'Documents administratifs',
          disponible: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          nom: 'Permis de conduire',
          description: 'Demande de permis de conduire',
          prix: '3500 DZD',
          duree: '10 jours',
          categorie: 'Permis',
          disponible: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '6',
          nom: 'Carte grise',
          description: 'Certificat d\'immatriculation du véhicule',
          prix: '4000 DZD',
          duree: '7 jours',
          categorie: 'Véhicules',
          disponible: true,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('services', JSON.stringify(defaultServices));
      setServices(defaultServices);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      prix: '',
      duree: '',
      categorie: '',
      disponible: true
    });
    setEditingService(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.description || !formData.prix || !formData.duree || !formData.categorie) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let updatedServices;
      
      if (editingService) {
        updatedServices = services.map(service =>
          service.id === editingService.id
            ? { ...service, ...formData, updatedAt: new Date().toISOString() }
            : service
        );
        setSuccess('Service modifié avec succès !');
      } else {
        const newService = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          disponible: true
        };
        updatedServices = [...services, newService];
        setSuccess('Service ajouté avec succès !');
      }
      
      localStorage.setItem('services', JSON.stringify(updatedServices));
      setServices(updatedServices);
      resetForm();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Erreur lors de l\'opération: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (serviceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      const updatedServices = services.filter(service => service.id !== serviceId);
      localStorage.setItem('services', JSON.stringify(updatedServices));
      setServices(updatedServices);
      setSuccess('Service supprimé avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      nom: service.nom,
      description: service.description,
      prix: service.prix,
      duree: service.duree,
      categorie: service.categorie,
      disponible: service.disponible
    });
    setShowForm(true);
  };

  const toggleDisponibilite = (serviceId) => {
    const updatedServices = services.map(service =>
      service.id === serviceId
        ? { ...service, disponible: !service.disponible }
        : service
    );
    localStorage.setItem('services', JSON.stringify(updatedServices));
    setServices(updatedServices);
  };

  // Filtrer les services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || service.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'Documents d\'identité',
    'Documents d\'état civil',
    'Documents administratifs',
    'Permis',
    'Véhicules',
    'Immobilier',
    'Santé',
    'Éducation',
    'Autres'
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'Documents d\'identité': 'bg-blue-100 text-blue-800',
      'Documents d\'état civil': 'bg-green-100 text-green-800',
      'Documents administratifs': 'bg-purple-100 text-purple-800',
      'Permis': 'bg-yellow-100 text-yellow-800',
      'Véhicules': 'bg-red-100 text-red-800',
      'Immobilier': 'bg-indigo-100 text-indigo-800',
      'Santé': 'bg-pink-100 text-pink-800',
      'Éducation': 'bg-orange-100 text-orange-800',
      'Autres': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  🛠️ Gestion des services administratifs
                </h1>
                <p className="text-blue-100">
                  Gérez les services disponibles pour les citoyens algériens
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-gray-50">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total services</p>
                  <p className="text-3xl font-bold text-gray-800">{services.length}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Package className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Services disponibles</p>
                  <p className="text-3xl font-bold text-green-600">
                    {services.filter(s => s.disponible).length}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Catégories</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {new Set(services.map(s => s.categorie)).size}
                  </p>
                </div>
                <div className="bg-orange-100 rounded-full p-3">
                  <Layers className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Revenus potentiels</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {services.reduce((total, s) => {
                      const price = parseInt(s.prix) || 0;
                      return total + price;
                    }, 0).toLocaleString()} DZD
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <TrendingUp className="text-purple-600" size={24} />
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
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                Ajouter un service
              </button>
              
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher un service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
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

          {/* Formulaire */}
          {showForm && (
            <div className="m-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                {editingService ? '✏️ Modifier le service' : '➕ Ajouter un service'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du service *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Carte d'identité nationale"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="prix"
                        value={formData.prix}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="2500 DZD"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée de traitement *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="duree"
                        value={formData.duree}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="7 jours"
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Description détaillée du service..."
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="disponible"
                        checked={formData.disponible}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Service disponible</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Traitement...' : (editingService ? 'Mettre à jour' : 'Ajouter')}
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

          {/* Liste des services */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              📋 Liste des services ({filteredServices.length})
            </h3>
            
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Aucun service trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                  <div key={service.id} className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold text-gray-800 flex-1">{service.nom}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.categorie)}`}>
                          {service.categorie}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="text-green-600" size={16} />
                          <span className="text-green-600 font-bold">{service.prix}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="text-blue-600" size={16} />
                          <span className="text-gray-600 text-sm">{service.duree}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button
                          onClick={() => toggleDisponibilite(service.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            service.disponible 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {service.disponible ? '✓ Disponible' : '✗ Indisponible'}
                        </button>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;