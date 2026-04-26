// src/pages/UsersManagement.js
import React, { useState, useEffect } from 'react';
import ImportExcel from '../components/Users/ImportExcel';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  Users, UserPlus, GraduationCap, Crown, Search, 
  Trash2, Key, RefreshCw, Download, 
  ChevronLeft, ChevronRight, Eye,
  Power, PowerOff, 
  ShieldCheck, ShieldAlert,
  X, Filter, Check
} from 'lucide-react';

// ✅ FONCTION getRoleBadge DÉFINIE EN DEHORS DU COMPOSANT
const getRoleBadge = (role) => {
  const badges = {
    admin: { icon: Crown, text: 'Admin', class: 'bg-red-500' },
    formateur: { icon: GraduationCap, text: 'Formateur', class: 'bg-blue-500' },
    apprenant: { icon: Users, text: 'Apprenant', class: 'bg-emerald-500' }
  };
  return badges[role] || badges.apprenant;
};

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [validationFilter, setValidationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [resettingPassword, setResettingPassword] = useState(null);
  const [activatingUser, setActivatingUser] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    apprenants: 0,
    formateurs: 0,
    admins: 0,
    active: 0,
    inactive: 0,
    emailValidated: 0,
    pendingActivation: 0
  });

  const itemsPerPage = 10;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getAuthToken = () => localStorage.getItem('token');
  const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${getAuthToken()}` } });

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) setCurrentAdmin(JSON.parse(currentUser));
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter, validationFilter, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      setError("Vous devez être connecté");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users`, getAuthHeaders());
      if (response.data.success) {
        setUsers(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (err) {
      console.error('Erreur:', err);
      if (err.response?.status === 401) {
        setError("Session expirée");
        localStorage.removeItem('token');
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        setError(err.response?.data?.message || "Impossible de charger les utilisateurs");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    setStats({
      total: usersData.length,
      apprenants: usersData.filter(u => u.role === 'apprenant').length,
      formateurs: usersData.filter(u => u.role === 'formateur').length,
      admins: usersData.filter(u => u.role === 'admin').length,
      active: usersData.filter(u => u.isActive === true).length,
      inactive: usersData.filter(u => u.isActive === false).length,
      emailValidated: usersData.filter(u => u.isEmailValidated === true).length,
      pendingActivation: usersData.filter(u => u.isEmailValidated === true && u.isActive === false && u.role !== 'admin').length
    });
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') filtered = filtered.filter(user => user.role === roleFilter);
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => statusFilter === 'active' ? user.isActive === true : user.isActive === false);
    }
    if (validationFilter !== 'all') {
      filtered = filtered.filter(user => validationFilter === 'validated' ? user.isEmailValidated === true : user.isEmailValidated === false);
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleImportComplete = (importedData) => {
    loadUsers();
    setShowImportModal(false);
    setSuccess(`${importedData?.created?.length || 0} utilisateur(s) importé(s). Un email de validation leur a été envoyé.`);
    setTimeout(() => setSuccess(null), 5000);
  };

  // ✅ Activation du compte (admin valide le compte après validation email)
  const activateUser = async (userId) => {
    const user = users.find(u => u.id === userId || u._id === userId);
    if (!user) return;
    
    if (!user.isEmailValidated) {
      setError("Cet utilisateur n'a pas encore validé son email.");
      return;
    }
    
    setActivatingUser(userId);
    try {
      const response = await axios.put(`${API_URL}/admin/activate-user/${userId}`, {}, getAuthHeaders());
      if (response.data.success) {
        loadUsers();
        setSuccess(`✅ Compte de ${user.prenom} ${user.nom} activé avec succès. Un email lui a été envoyé.`);
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'activation");
    } finally {
      setActivatingUser(null);
    }
  };

  const toggleUserStatus = async (userId) => {
    const user = users.find(u => u.id === userId || u._id === userId);
    if (!user) return;
    if (user.role === 'admin') {
      setError("Vous ne pouvez pas modifier le statut d'un administrateur");
      return;
    }

    const newStatus = user.isActive ? 'inactif' : 'actif';
    
    setTogglingStatus(userId);
    try {
      const response = await axios.put(`${API_URL}/users/${userId}/status`, { status: newStatus }, getAuthHeaders());
      if (response.data.success) {
        loadUsers();
        setSuccess(`Compte ${newStatus === 'actif' ? 'activé' : 'désactivé'} avec succès`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du changement de statut");
    } finally {
      setTogglingStatus(null);
    }
  };

  const deleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId || u._id === userId);
    if (userToDelete?.role === 'admin') {
      setError("Vous ne pouvez pas supprimer un administrateur");
      return;
    }
    if (currentAdmin && (currentAdmin.id === userId || currentAdmin._id === userId)) {
      setError("Vous ne pouvez pas supprimer votre propre compte");
      return;
    }
    if (!window.confirm(`Supprimer ${userToDelete?.prenom} ${userToDelete?.nom} ?`)) return;

    try {
      await axios.delete(`${API_URL}/users/${userId}`, getAuthHeaders());
      setSuccess("Utilisateur supprimé avec succès");
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
    return password;
  };

  const resetPassword = async (userId) => {
    const user = users.find(u => u.id === userId || u._id === userId);
    if (!user) return;

    const newPassword = generatePassword();
    setResettingPassword(userId);
    try {
      await axios.put(`${API_URL}/users/${userId}/reset-password`, { newPassword }, getAuthHeaders());
      alert(`✅ Nouveau mot de passe pour ${user.prenom} ${user.nom}:\n\n${newPassword}`);
      setSuccess("Mot de passe réinitialisé");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Erreur lors de la réinitialisation");
    } finally {
      setResettingPassword(null);
    }
  };

  const exportUsers = () => {
    setExporting(true);
    try {
      const exportData = users.map(user => ({
        'Matricule': user.matricule,
        'Nom': user.nom,
        'Prénom': user.prenom,
        'Email': user.email || '',
        'Téléphone': user.telephone || '',
        'Rôle': user.role === 'admin' ? 'Administrateur' : user.role === 'formateur' ? (user.formateurType === 'enseignant' ? 'Enseignant' : 'Formateur') : 'Apprenant',
        'Statut': user.isActive ? 'Actif' : 'Inactif',
        'Email Validé': user.isEmailValidated ? 'Oui' : 'Non',
        'Date création': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : ''
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Utilisateurs");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([excelBuffer]), `utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccess(`${users.length} utilisateurs exportés`);
    } catch (err) {
      setError("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Utilisateurs</h1>
              <p className="text-sm text-gray-500 mt-1">Gérez les comptes et les accès</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={exportUsers}
                disabled={exporting}
                className="px-4 sm:px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50 shadow-sm"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
                ) : (
                  <Download size={16} />
                )}
                <span className="hidden sm:inline">Exporter</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Importer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-4 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <Check size={18} className="text-emerald-600 flex-shrink-0" />
            <p className="text-emerald-700 text-sm flex-1">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
              <X size={16} />
            </button>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <ShieldAlert size={18} className="text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard icon={Users} label="Total" value={stats.total} color="indigo" />
          <StatCard icon={Users} label="Apprenants" value={stats.apprenants} color="emerald" />
          <StatCard icon={GraduationCap} label="Formateurs" value={stats.formateurs} color="blue" />
          <StatCard icon={Crown} label="Admins" value={stats.admins} color="red" />
          <StatCard icon={Power} label="Actifs" value={stats.active} color="teal" />
          <StatCard icon={PowerOff} label="Inactifs" value={stats.inactive} color="gray" />
          <StatCard icon={ShieldCheck} label="Validés" value={stats.emailValidated} color="green" />
          <StatCard icon={ShieldAlert} label="À activer" value={stats.pendingActivation} color="amber" />
        </div>

        {/* Alerte utilisateurs en attente d'activation admin */}
        {stats.pendingActivation > 0 && (
          <div className="mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <ShieldAlert size={18} className="text-amber-600 flex-shrink-0" />
            <p className="text-amber-700 text-sm flex-1">
              <strong>{stats.pendingActivation} utilisateur(s)</strong> ont validé leur email et attendent votre activation.
            </p>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-6 shadow-sm">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Filter size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); setValidationFilter('all'); }}
              className="px-3 py-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100`}>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="all">Tous les rôles</option>
              <option value="apprenant">Apprenants</option>
              <option value="formateur">Formateurs</option>
              <option value="admin">Administrateurs</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="all">Tous statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            <select value={validationFilter} onChange={(e) => setValidationFilter(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="all">Validation: tous</option>
              <option value="validated">Email validé</option>
              <option value="not_validated">Email non validé</option>
            </select>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validation</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsers.map((user) => (
                  <UserRowDesktop
                    key={user.id || user._id}
                    user={user}
                    currentAdmin={currentAdmin}
                    activatingUser={activatingUser}
                    togglingStatus={togglingStatus}
                    resettingPassword={resettingPassword}
                    onActivate={activateUser}
                    onToggleStatus={toggleUserStatus}
                    onResetPassword={resetPassword}
                    onDelete={deleteUser}
                    onView={setSelectedUser}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-gray-100">
            {currentUsers.map((user) => (
              <UserCardMobile
                key={user.id || user._id}
                user={user}
                currentAdmin={currentAdmin}
                activatingUser={activatingUser}
                togglingStatus={togglingStatus}
                resettingPassword={resettingPassword}
                onActivate={activateUser}
                onToggleStatus={toggleUserStatus}
                onResetPassword={resetPassword}
                onDelete={deleteUser}
                onView={setSelectedUser}
              />
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
              <button onClick={() => setShowImportModal(true)} className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Importer des utilisateurs
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gray-500">Page {currentPage} / {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 sm:p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 sm:p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          currentAdmin={currentAdmin}
          activatingUser={activatingUser}
          onClose={() => setSelectedUser(null)}
          onActivate={activateUser}
          onResetPassword={resetPassword}
        />
      )}

      {showImportModal && (
        <ImportExcel onClose={() => setShowImportModal(false)} onImportComplete={handleImportComplete} />
      )}
    </div>
  );
};

// Composant StatCard
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    teal: 'bg-teal-50 text-teal-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    gray: 'bg-gray-50 text-gray-600'
  };

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon size={16} className="sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
};

// Composant ligne tableau desktop
const UserRowDesktop = ({ user, currentAdmin, activatingUser, togglingStatus, resettingPassword, onActivate, onToggleStatus, onResetPassword, onDelete, onView }) => {
  const roleBadge = getRoleBadge(user.role);
  const RoleIcon = roleBadge.icon;
  const isAdmin = user.role === 'admin';
  const isCurrentUser = currentAdmin && (currentAdmin.id === user.id || currentAdmin._id === user._id);
  const needsAdminActivation = user.isEmailValidated === true && user.isActive === false && !isAdmin;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-sm font-bold text-indigo-600">
            {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {user.prenom} {user.nom}
              {isCurrentUser && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Vous</span>}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-3">
        <code className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{user.matricule}</code>
      </td>
      <td className="px-6 py-3">
        <div className="text-xs text-gray-600">{user.email || '-'}</div>
      </td>
      <td className="px-6 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white ${roleBadge.class}`}>
          <RoleIcon size={12} />
          {roleBadge.text}
        </span>
      </td>
      <td className="px-6 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          {user.isActive ? 'Actif' : 'Inactif'}
        </span>
      </td>
      <td className="px-6 py-3">
        {user.isEmailValidated ? (
          <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
            <ShieldCheck size={12} />
            Validé
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs">
            <ShieldAlert size={12} />
            En attente
          </span>
        )}
      </td>
      <td className="px-6 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onView(user)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Détails">
            <Eye size={15} />
          </button>
          
          {/* 🔥 BOUTON VALIDER LE COMPTE - Pour les comptes email validé mais non activé */}
          {needsAdminActivation && (
            <button 
              onClick={() => onActivate(user.id || user._id)} 
              disabled={activatingUser === (user.id || user._id)} 
              className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1"
              title="Valider le compte"
            >
              {activatingUser === (user.id || user._id) ? 
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div> : 
                <ShieldCheck size={14} />
              }
              <span className="text-xs font-medium hidden sm:inline">Valider</span>
            </button>
          )}
          
          {!isAdmin && user.isActive && (
            <button onClick={() => onToggleStatus(user.id || user._id)} disabled={togglingStatus === (user.id || user._id)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Désactiver">
              {togglingStatus === (user.id || user._id) ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-600 border-t-transparent"></div> : <PowerOff size={14} />}
            </button>
          )}
          
          {!isAdmin && !user.isActive && !needsAdminActivation && (
            <button onClick={() => onToggleStatus(user.id || user._id)} disabled={togglingStatus === (user.id || user._id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Activer">
              {togglingStatus === (user.id || user._id) ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-600 border-t-transparent"></div> : <Power size={14} />}
            </button>
          )}
          
          {(!isAdmin || isCurrentUser) && (
            <button onClick={() => onResetPassword(user.id || user._id)} disabled={resettingPassword === (user.id || user._id)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Réinitialiser MDP">
              {resettingPassword === (user.id || user._id) ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-amber-600 border-t-transparent"></div> : <Key size={14} />}
            </button>
          )}
          
          {!isAdmin && !isCurrentUser && (
            <button onClick={() => onDelete(user.id || user._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// Composant carte mobile
const UserCardMobile = ({ user, currentAdmin, activatingUser, togglingStatus, resettingPassword, onActivate, onToggleStatus, onResetPassword, onDelete, onView }) => {
  const roleBadge = getRoleBadge(user.role);
  const RoleIcon = roleBadge.icon;
  const isAdmin = user.role === 'admin';
  const isCurrentUser = currentAdmin && (currentAdmin.id === user.id || currentAdmin._id === user._id);
  const needsAdminActivation = user.isEmailValidated === true && user.isActive === false && !isAdmin;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-base font-bold text-indigo-600">
            {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {user.prenom} {user.nom}
              {isCurrentUser && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Vous</span>}
            </p>
            <code className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{user.matricule}</code>
          </div>
        </div>
        <button onClick={() => onView(user)} className="p-2 text-gray-400 hover:text-indigo-600">
          <Eye size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-400">Email</p>
          <p className="text-gray-700 text-xs truncate">{user.email || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Rôle</p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium text-white ${roleBadge.class}`}>
            <RoleIcon size={10} />
            {roleBadge.text}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          {user.isActive ? 'Actif' : 'Inactif'}
        </span>
        {user.isEmailValidated ? (
          <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
            <ShieldCheck size={12} />
            Email validé
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs">
            <ShieldAlert size={12} />
            En attente
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        {needsAdminActivation && (
          <button onClick={() => onActivate(user.id || user._id)} disabled={activatingUser === (user.id || user._id)} className="flex-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-1">
            {activatingUser === (user.id || user._id) ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div> : <ShieldCheck size={12} />}
            Valider
          </button>
        )}
        
        {!isAdmin && (
          <button onClick={() => onToggleStatus(user.id || user._id)} disabled={togglingStatus === (user.id || user._id)} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${user.isActive ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
            {togglingStatus === (user.id || user._id) ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div> : user.isActive ? <PowerOff size={12} /> : <Power size={12} />}
            {user.isActive ? 'Désactiver' : 'Activer'}
          </button>
        )}
        
        {(!isAdmin || isCurrentUser) && (
          <button onClick={() => onResetPassword(user.id || user._id)} disabled={resettingPassword === (user.id || user._id)} className="flex-1 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs font-medium hover:bg-amber-100 disabled:opacity-50 flex items-center justify-center gap-1">
            {resettingPassword === (user.id || user._id) ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-amber-600 border-t-transparent"></div> : <Key size={12} />}
            MDP
          </button>
        )}
        
        {!isAdmin && !isCurrentUser && (
          <button onClick={() => onDelete(user.id || user._id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 flex items-center justify-center gap-1">
            <Trash2 size={12} />
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
};

// Modal détails utilisateur
const UserDetailsModal = ({ user, currentAdmin, activatingUser, onClose, onActivate, onResetPassword }) => {
  const isAdmin = user.role === 'admin';
  const needsAdminActivation = user.isEmailValidated && !user.isActive && !isAdmin;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{user.prenom} {user.nom}</h3>
              <p className="text-indigo-100 text-sm">{user.matricule}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
          <InfoRow label="Email" value={user.email || '-'} />
          <InfoRow label="Téléphone" value={user.telephone || '-'} />
          <InfoRow label="Rôle" value={user.role === 'admin' ? 'Administrateur' : user.role === 'formateur' ? (user.formateurType === 'enseignant' ? 'Enseignant' : 'Formateur') : 'Apprenant'} />
          <InfoRow label="Statut" value={user.isActive ? 'Actif' : 'Inactif'} />
          <InfoRow label="Validation email" value={user.isEmailValidated ? '✅ Validé' : '⏳ En attente'} valueClass={user.isEmailValidated ? 'text-green-600' : 'text-amber-600'} />
          <InfoRow label="Date inscription" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'} />
          <InfoRow label="Dernière connexion" value={user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'} />
        </div>

        <div className="p-5 pt-0 flex gap-3">
          {needsAdminActivation && (
            <button onClick={() => { onActivate(user.id || user._id); onClose(); }} className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 flex items-center justify-center gap-2 text-sm font-medium">
              <ShieldCheck size={16} /> Valider le compte
            </button>
          )}
          <button onClick={() => { onResetPassword(user.id || user._id); onClose(); }} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium">
            Réinitialiser MDP
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, valueClass = 'text-gray-800' }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
    <p className={`text-sm font-medium ${valueClass}`}>{value}</p>
  </div>
);

export default UsersManagement;