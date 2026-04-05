// Sidebar.js - Version corrigée
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  LayoutDashboard, Users, Settings, LogOut, User, 
  ChevronDown, Mail, ShieldCheck, GraduationCap, Zap,
  BookOpen, Award, Briefcase, BarChart2, Star, Calendar,
  FileText, Video, MessageCircle, HelpCircle, TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const { currentUser } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer l'utilisateur depuis localStorage si nécessaire
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserRole(user.role);
      } catch (error) {
        console.error('Erreur lors du parsing du user:', error);
      }
    } else if (currentUser) {
      setUserRole(currentUser.role);
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Configuration des menus par rôle - CHAQUE ITEM DOIT AVOIR LA PROPRIETE 'roles'
  const menuItems = [
    // Menu Admin
    { path: '/dashboard', name: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin'] },
    { path: '/formations', name: 'Formations', icon: BookOpen, roles: ['admin'] },
    { path: '/users', name: 'Utilisateurs', icon: Users, roles: ['admin'] },
    { path: '/services', name: 'Services', icon: Briefcase, roles: ['admin'] },
    { path: '/statistiques', name: 'Statistiques', icon: BarChart2, roles: ['admin'] },
    
    // Menu Formateur
    { path: '/formateur', name: 'Tableau de bord', icon: LayoutDashboard, roles: ['formateur'] },
    { path: '/cours', name: 'Mes Cours', icon: BookOpen, roles: ['formateur'] },
    { path: '/etudiants', name: 'Mes Apprenants', icon: Users, roles: ['formateur'] },
    { path: '/evaluations', name: 'Évaluations', icon: Star, roles: ['formateur'] },
    
    // Menu Apprenant
    { path: '/apprenant', name: 'Tableau de bord', icon: LayoutDashboard, roles: ['user'] },
    { path: '/mes-cours', name: 'Mes Formations', icon: BookOpen, roles: ['user'] },
    { path: '/progres', name: 'Ma Progression', icon: TrendingUp, roles: ['user'] },
    { path: '/certificats', name: 'Certificats', icon: Award, roles: ['user'] },
    
    // Menu commun à tous
    { path: '/profile', name: 'Mon Profil', icon: User, roles: ['admin', 'formateur', 'user'] },
    { path: '/settings', name: 'Paramètres', icon: Settings, roles: ['admin'] }
  ];

  // Filtrer les menus selon le rôle de l'utilisateur
  const getFilteredMenu = () => {
    const role = userRole || currentUser?.role;
    if (!role) return [];
    return menuItems.filter(item => item.roles && item.roles.includes(role));
  };

  const filteredMenu = getFilteredMenu();

  // Récupérer les infos utilisateur
  const getUserData = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        return currentUser || {};
      }
    }
    return currentUser || {};
  };

  const userData = getUserData();
  const userName = userData.fullName || `${userData.prenom || ''} ${userData.nom || ''}`.trim() || 'Utilisateur';
  const userMatricule = userData.matricule || 'N/A';
  const userEmail = userData.email || 'email@example.com';
  const role = userRole || currentUser?.role;

  // Configuration des couleurs par rôle
  const getRoleConfig = () => {
    const configs = {
      admin: { icon: '👑', color: 'from-purple-500 to-pink-500', badge: 'Administrateur', bgColor: 'bg-purple-500/10' },
      formateur: { icon: '🎓', color: 'from-blue-500 to-cyan-500', badge: 'Formateur', bgColor: 'bg-blue-500/10' },
      user: { icon: '👤', color: 'from-emerald-500 to-teal-500', badge: 'Apprenant', bgColor: 'bg-emerald-500/10' }
    };
    return configs[role] || configs.user;
  };

  const roleConfig = getRoleConfig();

  // Afficher un message de chargement
  if (!role) {
    return (
      <aside className="w-72 h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </aside>
    );
  }

  return (
    <aside className="w-72 h-screen bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800">
      
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${roleConfig.color} rounded-xl flex items-center justify-center`}>
            <Zap className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AP Learning</h1>
            <p className="text-[10px] text-slate-500 uppercase">{roleConfig.badge}</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 mb-6">
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${roleConfig.color} rounded-xl flex items-center justify-center text-xl`}>
              {roleConfig.icon}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-bold text-sm text-white truncate">
                {userName}
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                {userMatricule}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-700/50 transition-all"
          >
            <span className="text-xs text-slate-400">Détails</span>
            <ChevronDown size={14} className={`transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {showProfile && (
            <div className="mt-3 space-y-2 pt-3 border-t border-slate-700">
              <div className="flex items-center space-x-2 text-[11px]">
                <Mail size={12} className="text-cyan-400" />
                <span className="truncate">{userEmail}</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px]">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="capitalize">{role}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">
          Menu Principal
        </p>
        
        {filteredMenu.length > 0 ? (
          filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-2.5 rounded-xl transition-all
                ${isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'hover:bg-slate-800/50 hover:text-white'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            </NavLink>
          ))
        ) : (
          <div className="text-center text-slate-500 text-sm py-4">
            Aucun menu disponible
          </div>
        )}
      </div>

      {/* Footer / Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-[9px] text-slate-500">Algérie Poste Learning © 2026</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;