// UserList.js - Page de gestion des utilisateurs avec affichage MongoDB
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Search, Filter, Plus, Edit, Trash2, 
  UserCheck, UserX, Mail, Phone, Calendar, 
  Shield, MoreVertical, Download, Upload, 
  Loader2, CheckCircle, XCircle, Eye, 
  GraduationCap, User as UserIcon, RefreshCw,
  ChevronLeft, ChevronRight, FileSpreadsheet,
  Database, AlertCircle, UserPlus
} from 'lucide-react';
import ImportExcel from './ImportExcel';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [newlyAddedUsers, setNewlyAddedUsers] = useState([]);
  const [highlightTimeout, setHighlightTimeout] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Récupérer tous les utilisateurs
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    const token = getAuthToken();
    if (!token) {
      setError("Vous devez être connecté");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success && response.data.users) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        throw new Error("Format de données invalide");
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setError(err.response?.data?.message || "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un nouvel utilisateur à la liste avec highlight
  const addNewUserToList = (newUser) => {
    // Ajouter le nouvel utilisateur au début de la liste
    setUsers(prevUsers => [newUser, ...prevUsers]);
    setFilteredUsers(prevFiltered => [newUser, ...prevFiltered]);
    
    // Ajouter à la liste des nouveaux utilisateurs pour le highlight
    setNewlyAddedUsers(prev => [...prev, newUser._id]);
    
    // Afficher une notification
    showNotification(`${newUser.prenom} ${newUser.nom} a été ajouté avec succès!`, 'success');
    
    // Retirer le highlight après 5 secondes
    if (highlightTimeout) clearTimeout(highlightTimeout);
    const timeout = setTimeout(() => {
      setNewlyAddedUsers([]);
    }, 5000);
    setHighlightTimeout(timeout);
  };

  // Mettre à jour plusieurs utilisateurs (après import)
  const addMultipleUsersToList = (newUsers) => {
    setUsers(prevUsers => [...newUsers, ...prevUsers]);
    setFilteredUsers(prevFiltered => [...newUsers, ...prevFiltered]);
    
    // Ajouter tous les nouveaux IDs pour highlight
    const newIds = newUsers.map(u => u.id || u._id);
    setNewlyAddedUsers(prev => [...prev, ...newIds]);
    
    showNotification(`${newUsers.length} utilisateur(s) importé(s) avec succès!`, 'success');
    
    setTimeout(() => {
      setNewlyAddedUsers([]);
    }, 5000);
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUsers(users.filter(u => u._id !== userId));
      setFilteredUsers(filteredUsers.filter(u => u._id !== userId));
      showNotification('Utilisateur supprimé avec succès', 'success');
      setShowDeleteConfirm(null);
    } catch (err) {
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  // Afficher une notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtrer les utilisateurs
  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => 
        selectedStatus === 'active' ? user.isActive : !user.isActive
      );
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus, users]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Statistiques
  const stats = {
    total: users.length,
    apprenants: users.filter(u => u.role === 'apprenant').length,
    formateurs: users.filter(u => u.role === 'formateur').length,
    actifs: users.filter(u => u.isActive).length
  };

  // Charger les utilisateurs au montage
  useEffect(() => {
    fetchUsers();
  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtenir le badge de rôle
  const getRoleBadge = (role) => {
    if (role === 'formateur') {
      return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold flex items-center gap-1"><GraduationCap size={12} /> Formateur</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1"><UserIcon size={12} /> Apprenant</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                <Database className="text-indigo-600" size={32} />
                Gestion des Utilisateurs
                <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                  MongoDB
                </span>
              </h1>
              <p className="text-slate-500 mt-2">Centralisation des données utilisateurs</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={fetchUsers}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Rafraîchir
              </button>
              <button 
                onClick={() => setShowImportModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <FileSpreadsheet size={18} />
                Importer Excel
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Total</p>
                <p className="text-2xl font-black text-slate-800">{stats.total}</p>
              </div>
              <Users size={32} className="text-indigo-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Apprenants</p>
                <p className="text-2xl font-black text-blue-600">{stats.apprenants}</p>
              </div>
              <UserIcon size={32} className="text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Formateurs</p>
                <p className="text-2xl font-black text-amber-600">{stats.formateurs}</p>
              </div>
              <GraduationCap size={32} className="text-amber-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Actifs</p>
                <p className="text-2xl font-black text-emerald-600">{stats.actifs}</p>
              </div>
              <UserCheck size={32} className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou matricule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 bg-white"
            >
              <option value="all">Tous les rôles</option>
              <option value="apprenant">Apprenants</option>
              <option value="formateur">Formateurs</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={fetchUsers} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
              Réessayer
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-100">
            <Users size={64} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Aucun utilisateur trouvé</p>
            <button 
              onClick={() => setShowImportModal(true)}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg inline-flex items-center gap-2"
            >
              <UserPlus size={18} />
              Importer des utilisateurs
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Matricule</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Rôle</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Date création</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentUsers.map((user) => {
                      const isNewlyAdded = newlyAddedUsers.includes(user._id);
                      return (
                        <tr 
                          key={user._id} 
                          className={`hover:bg-slate-50 transition-colors ${
                            isNewlyAdded ? 'animate-highlight bg-emerald-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">
                                  {user.prenom} {user.nom}
                                </p>
                                {isNewlyAdded && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
                                    <CheckCircle size={10} /> Nouveau
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                              {user.matricule || 'N/A'}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail size={14} /> {user.email}
                              </div>
                              {user.telephone && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Phone size={14} /> {user.telephone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                              user.isActive 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {user.isActive ? <UserCheck size={12} /> : <UserX size={12} />}
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {/* Voir détails */}}
                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                title="Voir détails"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => {/* Modifier */}}
                                className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                                title="Modifier"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => setShowDeleteConfirm(user)}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-slate-500">
                  Affichage de {indexOfFirstUser + 1} à {Math.min(indexOfLastUser, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal d'import */}
      {showImportModal && (
        <ImportExcel 
          onClose={() => {
            setShowImportModal(false);
            fetchUsers(); // Recharger la liste après fermeture
          }}
          onImportComplete={(newUsers) => {
            if (newUsers && newUsers.length > 0) {
              addMultipleUsersToList(newUsers);
            }
            fetchUsers(); // Recharger pour être sûr
          }}
        />
      )}

      {/* Modal de confirmation suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Confirmer la suppression</h3>
              <p className="text-slate-500 mt-2">
                Êtes-vous sûr de vouloir supprimer <strong>{showDeleteConfirm.prenom} {showDeleteConfirm.nom}</strong> ?
              </p>
              <p className="text-xs text-red-500 mt-2">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
              >
                Annuler
              </button>
              <button 
                onClick={() => deleteUser(showDeleteConfirm._id)}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes highlight {
          0% { background-color: rgb(209, 250, 229); }
          100% { background-color: transparent; }
        }
        .animate-highlight {
          animation: highlight 1s ease-out;
        }
        @keyframes slide-in-from-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-in.slide-in-from-right {
          animation: slide-in-from-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserList;