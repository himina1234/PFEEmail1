// UsersManagement.js - Version corrigée avec gestion d'erreur d'image
import React, { useState, useEffect } from 'react';
import ImportExcel from '../components/Users/ImportExcel';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  Users, UserPlus, GraduationCap, Crown, Search, 
  Mail, Phone, Calendar, 
  Trash2, Key, RefreshCw, Download, 
  ChevronLeft, ChevronRight, Eye,
  TrendingUp, Activity, AlertCircle,
  Lock, Power, PowerOff, Copy, Check, ImageOff
} from 'lucide-react';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    apprenants: 0,
    formateurs: 0,
    admins: 0,
    newThisMonth: 0,
    active: 0,
    inactive: 0
  });

  const itemsPerPage = 10;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setCurrentAdmin(JSON.parse(currentUser));
    }
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter, users]);

  // Fonction pour vérifier si l'avatar est valide
  const isValidAvatar = (avatar) => {
    if (!avatar) return false;
    if (typeof avatar !== 'string') return false;
    // Vérifier que c'est une image base64 valide et pas trop grande
    if (avatar.startsWith('data:image') && avatar.length < 150000) {
      return true;
    }
    return false;
  };

  const handleImageError = (userId) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }));
  };

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    const token = getAuthToken();
    if (!token) {
      setError("Vous devez être connecté pour voir les utilisateurs");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        let usersData = response.data.data;
        
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
          const saved = JSON.parse(savedUsers);
          const savedMap = new Map();
          saved.forEach(u => {
            savedMap.set(u.id || u._id, u.password);
          });
          
          usersData = usersData.map(user => ({
            ...user,
            password: savedMap.get(user.id || user._id) || user.password || '********'
          }));
        }
        
        setUsers(usersData);
        calculateStats(usersData);
      } else {
        throw new Error(response.data.message || "Erreur de chargement");
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setError(err.response?.data?.message || err.message || "Impossible de charger les utilisateurs");
      
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const usersData = JSON.parse(savedUsers);
        setUsers(usersData);
        calculateStats(usersData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const newThisMonth = usersData.filter(user => {
      const createdDate = new Date(user.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    const activeUsers = usersData.filter(u => u.status === 'actif' || u.status === 'active' || !u.status).length;
    const inactiveUsers = usersData.filter(u => u.status === 'inactif' || u.status === 'inactive').length;

    setStats({
      total: usersData.length,
      apprenants: usersData.filter(u => u.role === 'apprenant').length,
      formateurs: usersData.filter(u => u.role === 'formateur').length,
      admins: usersData.filter(u => u.role === 'admin').length,
      newThisMonth: newThisMonth,
      active: activeUsers,
      inactive: inactiveUsers
    });
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        const userStatus = user.status || 'actif';
        return statusFilter === 'active' 
          ? (userStatus === 'actif' || userStatus === 'active')
          : (userStatus === 'inactif' || userStatus === 'inactive');
      });
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleImportComplete = (importedData) => {
    if (importedData && importedData.created) {
      const updatedUsers = [...users];
      importedData.created.forEach(newUser => {
        const existingIndex = updatedUsers.findIndex(u => u.id === newUser.id);
        if (existingIndex >= 0) {
          updatedUsers[existingIndex] = {
            ...updatedUsers[existingIndex],
            password: newUser.temporaryPassword
          };
        } else {
          updatedUsers.push({
            ...newUser,
            password: newUser.temporaryPassword
          });
        }
      });
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
    loadUsers();
    setShowImportModal(false);
  };

  const canToggleStatus = (targetUser) => {
    if (targetUser.role === 'admin') {
      return false;
    }
    return true;
  };

  const toggleUserStatus = async (userId) => {
    const user = users.find(u => u.id === userId || u._id === userId);
    if (!user) return;

    if (!canToggleStatus(user)) {
      setError("❌ Vous ne pouvez pas modifier le statut d'un administrateur");
      return;
    }

    const currentStatus = user.status || 'actif';
    const newStatus = (currentStatus === 'actif' || currentStatus === 'active') ? 'inactif' : 'actif';
    
    const token = getAuthToken();
    if (!token) {
      setError("Vous devez être connecté");
      return;
    }

    setTogglingStatus(userId);

    try {
      const response = await axios.put(`${API_URL}/users/${userId}/status`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const updatedUsers = users.map(u => 
          (u.id === userId || u._id === userId) ? { ...u, status: newStatus } : u
        );
        setUsers(updatedUsers);
        calculateStats(updatedUsers);
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        const message = newStatus === 'actif' 
          ? 'Compte activé avec succès' 
          : 'Compte désactivé avec succès';
        setError(null);
        alert(`✅ ${message}`);
        
        await loadUsers();
      } else {
        throw new Error(response.data.message || "Erreur lors du changement de statut");
      }
    } catch (err) {
      console.error('Erreur changement statut:', err);
      setError(err.response?.data?.message || err.message || "Erreur lors du changement de statut");
      alert("❌ Erreur: Impossible de modifier le statut. Veuillez réessayer.");
    } finally {
      setTogglingStatus(null);
    }
  };

  const deleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId || u._id === userId);
    
    if (userToDelete?.role === 'admin') {
      setError("❌ Vous ne pouvez pas supprimer un administrateur");
      alert("❌ Impossible de supprimer un compte administrateur");
      return;
    }

    if (currentAdmin && (currentAdmin.id === userId || currentAdmin._id === userId)) {
      setError("❌ Vous ne pouvez pas supprimer votre propre compte");
      alert("❌ Vous ne pouvez pas supprimer votre propre compte");
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${userToDelete?.prenom} ${userToDelete?.nom} ? Cette action est irréversible.`)) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError("Vous devez être connecté");
      return;
    }

    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      await loadUsers();
      alert("✅ Utilisateur supprimé avec succès");
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      alert("❌ Erreur lors de la suppression");
    }
  };

  const resetPassword = async (userId) => {
    const user = users.find(u => u.id === userId || u._id === userId);
    
    if (user?.role === 'admin' && currentAdmin?.id !== userId && currentAdmin?._id !== userId) {
      setError("❌ Vous ne pouvez pas réinitialiser le mot de passe d'un autre administrateur");
      alert("❌ Vous ne pouvez pas réinitialiser le mot de passe d'un autre administrateur");
      return;
    }

    const generatePassword = () => {
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const specials = '!@#$%^&*';
      const allChars = uppercase + lowercase + numbers + specials;
      
      let password = '';
      password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
      password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
      password += specials.charAt(Math.floor(Math.random() * specials.length));
      
      for (let i = password.length; i < 10; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
      }
      
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };
    
    const newPassword = generatePassword();
    const token = getAuthToken();
    
    if (!token) {
      setError("Vous devez être connecté");
      return;
    }

    try {
      await axios.put(`${API_URL}/users/${userId}/reset-password`, 
        { newPassword },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const updatedUsers = users.map(u => {
        if (u.id === userId || u._id === userId) {
          return { ...u, password: newPassword };
        }
        return u;
      });
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      alert(`✅ Nouveau mot de passe pour ${user.prenom} ${user.nom}:\n\n${newPassword}\n\nVeuillez le communiquer à l'utilisateur.`);
      
      await loadUsers();
    } catch (err) {
      console.error('Erreur reset password:', err);
      alert("❌ Erreur lors de la réinitialisation du mot de passe");
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setCopiedPassword(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Composant Avatar avec gestion d'erreur
  const UserAvatar = ({ user, size = "w-10 h-10", textSize = "text-lg" }) => {
    const userId = user.id || user._id;
    const hasError = imageErrors[userId];
    const avatar = user.avatar;
    const isValid = isValidAvatar(avatar) && !hasError;
    
    const getInitial = () => {
      const prenom = user.prenom || '';
      const nom = user.nom || '';
      if (prenom && nom) return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
      if (prenom) return prenom.charAt(0).toUpperCase();
      if (nom) return nom.charAt(0).toUpperCase();
      return '?';
    };
    
    const getRoleIcon = () => {
      if (user.role === 'admin') return '👑';
      if (user.role === 'formateur') return '👨‍🏫';
      return '👨‍🎓';
    };
    
    if (isValid) {
      return (
        <img
          src={avatar}
          alt={`${user.prenom} ${user.nom}`}
          className={`${size} rounded-xl object-cover`}
          onError={() => handleImageError(userId)}
        />
      );
    }
    
    // Fallback: afficher une icône ou les initiales
    return (
      <div className={`${size} bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center ${textSize} font-bold text-indigo-600`}>
        {getInitial() || getRoleIcon()}
      </div>
    );
  };

  const exportAllUsersWithPasswords = () => {
    setExporting(true);
    
    try {
      const usersData = users;
      
      if (!usersData || usersData.length === 0) {
        alert("❌ Aucun utilisateur à exporter");
        setExporting(false);
        return;
      }
      
      const exportData = usersData.map(user => ({
        'Matricule': user.matricule,
        'Nom': user.nom,
        'Prénom': user.prenom,
        'Email': user.email || '',
        'Téléphone': user.telephone || '',
        'Rôle': user.role === 'admin' ? 'Administrateur' : user.role === 'formateur' ? 'Formateur' : 'Apprenant',
        'Mot de Passe': user.password && user.password !== '********' ? user.password : 'Non défini',
        'Statut': user.status === 'actif' || user.status === 'active' ? 'Actif' : 'Inactif',
        'Date création': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Non défini',
        'Dernière connexion': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tous_Utilisateurs");
      
      ws['!cols'] = [
        { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 30 },
        { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 12 },
        { wch: 15 }, { wch: 15 }
      ];
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `tous_utilisateurs_avec_mots_passe_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      alert(`✅ Export réussi !\n📊 ${usersData.length} utilisateurs exportés.`);
    } catch (err) {
      console.error('Erreur export:', err);
      setError("Impossible d'exporter les utilisateurs");
      alert("❌ Erreur lors de l'export: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const exportUsers = () => {
    const exportData = filteredUsers.map(user => ({
      'Matricule': user.matricule,
      'Nom': user.nom,
      'Prénom': user.prenom,
      'Email': user.email || '',
      'Téléphone': user.telephone || '',
      'Rôle': user.role === 'admin' ? 'Administrateur' : user.role === 'formateur' ? 'Formateur' : 'Apprenant',
      'Statut': user.status === 'actif' || user.status === 'active' ? 'Actif' : 'Inactif',
      'Date création': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Non défini'
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Utilisateurs");
    
    ws['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 30 },
      { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 15 }
    ];
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getRoleBadge = (role) => {
    const badges = {
      admin: { icon: Crown, text: 'Administrateur', class: 'bg-gradient-to-r from-red-500 to-pink-500' },
      formateur: { icon: GraduationCap, text: 'Formateur', class: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
      apprenant: { icon: Users, text: 'Apprenant', class: 'bg-gradient-to-r from-emerald-500 to-teal-500' }
    };
    return badges[role] || badges.apprenant;
  };

  const getStatusBadge = (status) => {
    const currentStatus = status || 'actif';
    if (currentStatus === 'actif' || currentStatus === 'active') {
      return {
        icon: Power,
        text: 'Actif',
        class: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        dotClass: 'bg-emerald-500'
      };
    } else {
      return {
        icon: PowerOff,
        text: 'Inactif',
        class: 'bg-red-50 text-red-700 border border-red-200',
        dotClass: 'bg-red-500'
      };
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                Gestion des Utilisateurs
              </h1>
              <p className="text-slate-500 mt-2 flex items-center gap-2">
                <Activity size={16} />
                Gérez et suivez l'activité de tous les utilisateurs de la plateforme
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={exportAllUsersWithPasswords}
                disabled={exporting}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 disabled:opacity-50"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Lock size={18} />
                )}
                Export Complet (MDP)
              </button>
              
              <button
                onClick={exportUsers}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm"
              >
                <Download size={18} />
                Export Simple
              </button>
              
              <button
                onClick={() => setShowImportModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105"
              >
                <UserPlus size={18} />
                Importer Excel
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {/* ... Vos cartes de stats existantes ... */}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          {/* ... Vos filtres existants ... */}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Matricule</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date d'inscription</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentUsers.map((user) => {
                  const RoleIcon = getRoleBadge(user.role).icon;
                  const StatusBadge = getStatusBadge(user.status);
                  const isAdmin = user.role === 'admin';
                  const isCurrentUser = currentAdmin && (currentAdmin.id === user.id || currentAdmin._id === user._id);
                  const canDelete = !isAdmin && !isCurrentUser;
                  const showStatusButton = !isAdmin;
                  
                  return (
                    <tr key={user.id || user._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Utilisation du composant UserAvatar corrigé */}
                          <UserAvatar user={user} size="w-10 h-10" textSize="text-lg" />
                          <div>
                            <p className="font-semibold text-slate-800">
                              {user.prenom} {user.nom}
                              {isCurrentUser && <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Vous</span>}
                            </p>
                            <p className="text-xs text-slate-400">ID: {(user.id || user._id).slice(0, 8)}</p>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                          {user.matricule}
                        </code>
                       </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {user.email && (
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <Mail size={12} />
                              <span>{user.email}</span>
                            </div>
                          )}
                          {user.telephone && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Phone size={12} />
                              <span>{user.telephone}</span>
                            </div>
                          )}
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white ${getRoleBadge(user.role).class}`}>
                          <RoleIcon size={12} />
                          {getRoleBadge(user.role).text}
                        </span>
                       </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar size={14} />
                          {new Date(user.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                       </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${StatusBadge.class}`}>
                          <div className={`w-1.5 h-1.5 ${StatusBadge.dotClass} rounded-full animate-pulse`}></div>
                          {StatusBadge.text}
                        </span>
                       </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Voir détails"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {showStatusButton && (
                            <button
                              onClick={() => toggleUserStatus(user.id || user._id)}
                              disabled={togglingStatus === (user.id || user._id)}
                              className={`p-2 rounded-lg transition-all ${
                                (user.status === 'actif' || user.status === 'active' || !user.status)
                                  ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={(user.status === 'actif' || user.status === 'active' || !user.status) ? 'Désactiver le compte' : 'Activer le compte'}
                            >
                              {togglingStatus === (user.id || user._id) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                              ) : (user.status === 'actif' || user.status === 'active' || !user.status) ? (
                                <PowerOff size={16} />
                              ) : (
                                <Power size={16} />
                              )}
                            </button>
                          )}
                          
                          {(!isAdmin || isCurrentUser) && (
                            <button
                              onClick={() => resetPassword(user.id || user._id)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Réinitialiser mot de passe"
                            >
                              <Key size={16} />
                            </button>
                          )}
                          
                          {canDelete && (
                            <button
                              onClick={() => deleteUser(user.id || user._id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                       </td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Aucun utilisateur trouvé</p>
              <p className="text-slate-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
              <button
                onClick={() => setShowImportModal(true)}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
              >
                <UserPlus size={18} />
                Importer des utilisateurs
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <UserAvatar user={selectedUser} size="w-16 h-16" textSize="text-2xl" />
                  <div>
                    <h3 className="text-2xl font-bold">{selectedUser.prenom} {selectedUser.nom}</h3>
                    <p className="text-indigo-100 text-sm">{selectedUser.matricule}</p>
                  </div>
                </div>
                <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto max-h-[55vh]">
              {/* ... Reste du modal inchangé ... */}
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <ImportExcel 
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
};

export default UsersManagement;