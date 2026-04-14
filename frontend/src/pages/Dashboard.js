import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, GraduationCap, BookOpen, Crown, TrendingUp, Calendar, 
  Activity, Award, UserPlus, FileText, Settings, Bell, 
  ChevronRight, Clock, CheckCircle, AlertCircle, Download, 
  RefreshCw, MoreVertical, ArrowUpRight, ArrowDownRight,
  Sparkles, Zap, Shield, Target, BarChart3, PieChart,
  Mail, Phone, MapPin, Globe, Database, Cloud, Server
} from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Dashboard = () => {
  const { currentUser, list: users, isLoading } = useSelector((state) => state.users);
  const [stats, setStats] = useState({
    totalUsers: 0,
    apprenants: 0,
    formateurs: 0,
    admins: 0,
    activeUsers: 0,
    newThisMonth: 0,
    formationsCount: 0,
    activeFormations: 0
  });
  const [formations, setFormations] = useState([]);
  const [loadingFormations, setLoadingFormations] = useState(false);
  const [recentUsers, setRecentUsers] = useState([]);

  // Récupérer les formations depuis MongoDB
  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    setLoadingFormations(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/formations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFormations(data.data || []);
        const activeCount = data.data.filter(f => f.statut === 'actif').length;
        setStats(prev => ({
          ...prev,
          formationsCount: data.data.length,
          activeFormations: activeCount
        }));
      }
    } catch (error) {
      console.error('Erreur chargement formations:', error);
    } finally {
      setLoadingFormations(false);
    }
  };

  useEffect(() => {
    if (users && users.length > 0) {
      // Filtrer les utilisateurs par rôle
      const apprenants = users.filter(u => u.role === 'apprenant' || u.role === 'user');
      const formateurs = users.filter(u => u.role === 'formateur');
      const admins = users.filter(u => u.role === 'admin');
      const activeUsers = users.filter(u => u.isActive !== false);
      
      // Nouveaux utilisateurs ce mois
      const now = new Date();
      const newThisMonth = users.filter(u => {
        const createdAt = new Date(u.createdAt);
        return createdAt.getMonth() === now.getMonth() && 
               createdAt.getFullYear() === now.getFullYear();
      }).length;
      
      // 5 derniers utilisateurs
      const recent = [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setStats({
        totalUsers: users.length,
        apprenants: apprenants.length,
        formateurs: formateurs.length,
        admins: admins.length,
        activeUsers: activeUsers.length,
        newThisMonth: newThisMonth,
        formationsCount: stats.formationsCount,
        activeFormations: stats.activeFormations
      });
      
      setRecentUsers(recent);
    }
  }, [users]);

  if (isLoading) return <LoadingSpinner />;

  // Calcul des pourcentages
  const activityRate = stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;
  const apprenantRate = stats.totalUsers > 0 ? Math.round((stats.apprenants / stats.totalUsers) * 100) : 0;
  const formateurRate = stats.totalUsers > 0 ? Math.round((stats.formateurs / stats.totalUsers) * 100) : 0;

  const statsCards = [
    { 
      title: 'Total Utilisateurs', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
      trend: `+${stats.newThisMonth}`,
      trendLabel: 'ce mois',
      up: true 
    },
    { 
      title: 'Apprenants', 
      value: stats.apprenants, 
      icon: GraduationCap, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      gradient: 'from-emerald-500 to-emerald-600',
      trend: `${apprenantRate}%`,
      trendLabel: 'des utilisateurs',
      up: true 
    },
    { 
      title: 'Formateurs', 
      value: stats.formateurs, 
      icon: BookOpen, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50',
      gradient: 'from-orange-500 to-orange-600',
      trend: `${formateurRate}%`,
      trendLabel: 'des utilisateurs',
      up: true 
    },
    { 
      title: 'Formations', 
      value: stats.formationsCount, 
      icon: Target, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600',
      trend: `${stats.activeFormations} actives`,
      trendLabel: 'en cours',
      up: null 
    },
  ];

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: Crown },
      formateur: { label: 'Formateur', color: 'bg-orange-100 text-orange-700', icon: BookOpen },
      apprenant: { label: 'Apprenant', color: 'bg-emerald-100 text-emerald-700', icon: GraduationCap },
      user: { label: 'Apprenant', color: 'bg-emerald-100 text-emerald-700', icon: GraduationCap }
    };
    return badges[role] || badges.apprenant;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8 space-y-8">
        
        {/* --- TOP HEADER / WELCOME SECTION --- */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl">
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45"></div>
          
          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-3xl">{currentUser?.avatar || '👨‍💼'}</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
                    Ravi de vous revoir, {currentUser?.prenom || currentUser?.nom || 'Admin'} !
                    <Sparkles className="text-yellow-400" size={24} />
                  </h1>
                  <p className="text-slate-400 flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    AP Learning • Algérie Poste • Dashboard Administrateur
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Date</p>
                    <p className="text-sm font-bold text-white">
                      {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Statut</p>
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      Connecté
                    </span>
                  </div>
                </div>
                <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all">
                  <Bell size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- STATS CARDS MODERNES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon size={24} />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${stat.up === true ? 'text-emerald-600' : stat.up === false ? 'text-red-600' : 'text-slate-500'}`}>
                      {stat.up === true && <ArrowUpRight size={14} />}
                      {stat.up === false && <ArrowDownRight size={14} />}
                      <span>{stat.trend}</span>
                      {stat.trendLabel && <span className="text-slate-400 font-normal ml-1">{stat.trendLabel}</span>}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                  <p className="text-slate-500 font-medium text-sm mt-1">{stat.title}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Taux d'occupation</span>
                    <span className="font-semibold text-slate-700">
                      {stat.title === 'Total Utilisateurs' ? activityRate : 
                       stat.title === 'Apprenants' ? apprenantRate :
                       stat.title === 'Formateurs' ? formateurRate : '100'}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-500`}
                      style={{ 
                        width: `${stat.title === 'Total Utilisateurs' ? activityRate : 
                                 stat.title === 'Apprenants' ? apprenantRate :
                                 stat.title === 'Formateurs' ? formateurRate : 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- SECTION CENTRALE: PERFORMANCE & ACTIVITÉ --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Graphique de répartition */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={22} className="text-emerald-500" />
                  Répartition des utilisateurs
                </h2>
                <p className="text-slate-400 text-sm mt-1">Visualisation des effectifs par rôle</p>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <RefreshCw size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Graphique circulaire */}
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke="#3b82f6" strokeWidth="10" 
                    strokeDasharray={`${(stats.apprenants / stats.totalUsers) * 283} 283`}
                    strokeLinecap="round"
                  />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke="#f97316" strokeWidth="10" 
                    strokeDasharray={`${(stats.formateurs / stats.totalUsers) * 283} 283`}
                    strokeDashoffset={`-${(stats.apprenants / stats.totalUsers) * 283}`}
                    strokeLinecap="round"
                  />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke="#a855f7" strokeWidth="10" 
                    strokeDasharray={`${(stats.admins / stats.totalUsers) * 283} 283`}
                    strokeDashoffset={`-${((stats.apprenants + stats.formateurs) / stats.totalUsers) * 283}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-800">{stats.totalUsers}</p>
                    <p className="text-xs text-slate-400">Total</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span className="text-sm font-medium text-slate-700">Apprenants</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-slate-800">{stats.apprenants}</span>
                    <span className="text-xs text-emerald-600 font-semibold">{apprenantRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span className="text-sm font-medium text-slate-700">Formateurs</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-slate-800">{stats.formateurs}</span>
                    <span className="text-xs text-emerald-600 font-semibold">{formateurRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span className="text-sm font-medium text-slate-700">Administrateurs</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-slate-800">{stats.admins}</span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {stats.totalUsers > 0 ? Math.round((stats.admins / stats.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de progression globale */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Taux d'activité global</span>
                <span className="font-bold text-emerald-600">{activityRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${activityRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {stats.activeUsers} utilisateurs actifs sur {stats.totalUsers} au total
              </p>
            </div>
          </div>

          {/* Notifications récentes */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Bell size={20} className="text-orange-500" />
                    Activités récentes
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Dernières actions sur la plateforme</p>
                </div>
                <span className="bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1 rounded-full">
                  {stats.newThisMonth} nouvelles
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {recentUsers.map((user, i) => {
                const RoleIcon = getRoleBadge(user.role).icon;
                return (
                  <div key={i} className="group p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getRoleBadge(user.role).color}`}>
                        <RoleIcon size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {user.prenom} {user.nom}
                        </p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(user.role).color}`}>
                          {getRoleBadge(user.role).label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {recentUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-400">Aucun utilisateur récent</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button className="w-full text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Voir tous les utilisateurs →
              </button>
            </div>
          </div>
        </div>

        {/* --- QUICK ACTIONS & STATUT SYSTÈME --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap size={22} className="text-yellow-300" />
                  Actions rapides
                </h2>
                <p className="text-emerald-100 text-sm opacity-90 mt-1">Gérez votre plateforme en un clic</p>
              </div>
              <Database size={28} className="text-white/20" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all backdrop-blur-sm">
                <UserPlus size={18} />
                <span className="text-sm font-semibold">Ajouter</span>
              </button>
              <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all backdrop-blur-sm">
                <FileText size={18} />
                <span className="text-sm font-semibold">Importer</span>
              </button>
              <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all backdrop-blur-sm">
                <Download size={18} />
                <span className="text-sm font-semibold">Exporter</span>
              </button>
              <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all backdrop-blur-sm">
                <Settings size={18} />
                <span className="text-sm font-semibold">Paramètres</span>
              </button>
            </div>
          </div>

          {/* Système Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Server size={20} className="text-blue-500" />
                  Statut du système
                </h2>
                <p className="text-slate-400 text-sm mt-1">Connectivité et performances</p>
              </div>
              <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Opérationnel
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Database size={16} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">MongoDB</span>
                </div>
                <span className="text-xs text-emerald-600 font-semibold">Connecté</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Cloud size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">API Server</span>
                </div>
                <span className="text-xs text-emerald-600 font-semibold">En ligne</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-purple-500" />
                  <span className="text-sm font-medium text-slate-700">Authentification</span>
                </div>
                <span className="text-xs text-emerald-600 font-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- STATISTIQUES SUPPLÉMENTAIRES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Croissance mensuelle</p>
                <p className="text-lg font-bold text-slate-800">+{stats.newThisMonth}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Taux d'activité</p>
                <p className="text-lg font-bold text-slate-800">{activityRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Target size={18} className="text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Formations actives</p>
                <p className="text-lg font-bold text-slate-800">{stats.activeFormations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Award size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Taux complétion</p>
                <p className="text-lg font-bold text-slate-800">78%</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;