// src/components/Layout/Sidebar.js
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  User, BookOpen, FileText, Award, Video, 
  Settings, LogOut, LayoutGrid, Star, ChevronDown,
  Mail, ShieldCheck, Zap, TrendingUp, BarChart2,
  Users, Briefcase, Calendar, Library, Heart,
  MessageCircle, HelpCircle, Home, Activity
} from 'lucide-react';

const Sidebar = () => {
  const { currentUser, updateCurrentUser } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userDataState, setUserDataState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    
    // Écouter les mises à jour du profil
    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setUserDataState(event.detail);
        setUserRole(event.detail.role);
      }
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('storage', loadUserData);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', loadUserData);
    };
  }, [currentUser]);

  const loadUserData = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserDataState(user);
        setUserRole(user.role);
      } catch (error) {
        console.error('Erreur lors du parsing du user:', error);
        if (currentUser) {
          setUserDataState(currentUser);
          setUserRole(currentUser.role);
        }
      }
    } else if (currentUser) {
      setUserDataState(currentUser);
      setUserRole(currentUser.role);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('favoriteFormations');
    navigate('/login');
  };

  // Configuration des menus par rôle
  const menuItems = [
    // Menu Admin
    { 
      path: '/dashboard', 
      name: 'Tableau de bord', 
      icon: LayoutGrid, 
      roles: ['admin'],
      description: 'Vue d\'ensemble'
    },
    { 
      path: '/formations', 
      name: 'Gestion formations', 
      icon: BookOpen, 
      roles: ['admin'],
      description: 'CRUD formations'
    },
    { 
      path: '/users', 
      name: 'Utilisateurs', 
      icon: Users, 
      roles: ['admin'],
      description: 'Gestion des comptes'
    },
    { 
      path: '/services', 
      name: 'Services', 
      icon: Briefcase, 
      roles: ['admin'],
      description: 'Services postaux'
    },
    { 
      path: '/statistiques', 
      name: 'Statistiques', 
      icon: BarChart2, 
      roles: ['admin'],
      description: 'Analyses et rapports'
    },
    { 
      path: '/examens', 
      name: 'Examens', 
      icon: FileText, 
      roles: ['admin'],
      description: 'Gestion des examens'
    },
    
    // Menu Formateur
    { 
      path: '/formateur', 
      name: 'Tableau de bord', 
      icon: LayoutGrid, 
      roles: ['formateur'],
      description: 'Vue d\'ensemble'
    },
    { 
      path: '/mes-cours', 
      name: 'Mes Cours', 
      icon: BookOpen, 
      roles: ['formateur'],
      description: 'Cours à animer'
    },
    { 
      path: '/etudiants', 
      name: 'Mes Apprenants', 
      icon: Users, 
      roles: ['formateur'],
      description: 'Suivi des apprenants'
    },
    { 
      path: '/evaluations', 
      name: 'Évaluations', 
      icon: Star, 
      roles: ['formateur'],
      description: 'Noter les apprenants'
    },
    { 
      path: '/cours-direct', 
      name: 'Cours en direct', 
      icon: Video, 
      roles: ['formateur'],
      description: 'Classes virtuelles'
    },
    
    // Menu Apprenant
    { 
      path: '/apprenant', 
      name: 'Tableau de bord', 
      icon: LayoutGrid, 
      roles: ['user'],
      description: 'Vue d\'ensemble'
    },
    { 
      path: '/apprenant/formations', 
      name: 'Toutes les formations', 
      icon: Library, 
      roles: ['user'],
      description: 'Catalogue complet'
    },
    { 
      path: '/mes-cours', 
      name: 'Mes Formations', 
      icon: BookOpen, 
      roles: ['user'],
      description: 'Mes inscriptions'
    },
    { 
      path: '/examens', 
      name: 'Mes examens', 
      icon: FileText, 
      roles: ['user'],
      description: 'Tests et évaluations'
    },
    { 
      path: '/progres', 
      name: 'Ma Progression', 
      icon: TrendingUp, 
      roles: ['user'],
      description: 'Suivi de progression'
    },
    { 
      path: '/certificats', 
      name: 'Certificats', 
      icon: Award, 
      roles: ['user'],
      description: 'Mes attestations'
    },
    { 
      path: '/cours-direct', 
      name: 'Cours en direct', 
      icon: Video, 
      roles: ['user'],
      description: 'Classes virtuelles'
    },
    { 
      path: '/feedback', 
      name: 'Feedback', 
      icon: MessageCircle, 
      roles: ['user'],
      description: 'Donner mon avis'
    },
    { 
      path: '/favoris', 
      name: 'Mes favoris', 
      icon: Heart, 
      roles: ['user'],
      description: 'Formations favorites'
    },
    
    // Menu commun à tous
    { 
      path: '/profile', 
      name: 'Mon Profil', 
      icon: User, 
      roles: ['admin', 'formateur', 'user'],
      description: 'Informations personnelles'
    },
    { 
      path: '/settings', 
      name: 'Paramètres', 
      icon: Settings, 
      roles: ['admin', 'formateur', 'user'],
      description: 'Préférences'
    },
    { 
      path: '/aide', 
      name: 'Aide & Support', 
      icon: HelpCircle, 
      roles: ['admin', 'formateur', 'user'],
      description: 'Centre d\'aide'
    }
  ];

  const getFilteredMenu = () => {
    const role = userRole || userDataState?.role;
    if (!role) return [];
    return menuItems.filter(item => item.roles && item.roles.includes(role));
  };

  const filteredMenu = getFilteredMenu();

  const getUserData = () => {
    if (userDataState) return userDataState;
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
  const userMatricule = userData.matricule || userData.email?.split('@')[0] || 'N/A';
  const userEmail = userData.email || 'email@example.com';
  const role = userRole || userData?.role || 'user';
  const userAvatar = userData.avatar || null;

  const getRoleConfig = () => {
    const configs = {
      admin: { 
        icon: '👑', 
        color: 'from-orange-500 to-red-500', 
        badge: 'Administrateur', 
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        textColor: 'text-orange-400',
        gradient: 'from-orange-600 to-red-600'
      },
      formateur: { 
        icon: '🎓', 
        color: 'from-green-600 to-emerald-600', 
        badge: 'Formateur', 
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        textColor: 'text-green-400',
        gradient: 'from-green-600 to-emerald-600'
      },
      user: { 
        icon: '👤', 
        color: 'from-blue-600 to-cyan-600', 
        badge: 'Apprenant', 
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        textColor: 'text-blue-400',
        gradient: 'from-[#0055a2] to-[#0077e6]'
      }
    };
    return configs[role] || configs.user;
  };

  const roleConfig = getRoleConfig();

  if (!role) {
    return (
      <aside className="w-64 h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0055a2]"></div>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-white shadow-lg flex flex-col shrink-0 border-r border-gray-100">
      
      {/* LOGO - Algérie Poste */}
      
<div className="p-6 pb-4 border-b border-gray-100">
  <div className="flex items-center gap-3 group cursor-pointer">
    <img 
      src="../image/imag4.jpg"  // Chemin vers votre logo
      alt="Algérie Poste Logo" 
      className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
    />
    <div className="flex flex-col">
      <span className="font-black text-sm tracking-tighter text-blue-950 leading-none">ALGÉRIE POSTE</span>
      <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#FFC107]">Learning</span>
    </div>
  </div>
</div>

      {/* User Profile Card */}
      <div className="p-4 border-b border-gray-100">
        <div className={`bg-gradient-to-br ${roleConfig.bgColor} rounded-xl p-3 border ${roleConfig.borderColor}`}>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#0055a2]/20"
                />
              ) : (
                <div className={`w-10 h-10 bg-gradient-to-br ${roleConfig.color} rounded-full flex items-center justify-center text-white text-lg shadow-md`}>
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-800 truncate">
                {userName}
              </h3>
              <p className="text-[10px] text-gray-500 truncate">
                {userMatricule}
              </p>
            </div>

            <button
              onClick={() => setShowProfile(!showProfile)}
              className="p-1 hover:bg-gray-200 rounded-lg transition-all"
            >
              <ChevronDown size={14} className={`transition-transform text-gray-500 ${showProfile ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showProfile && (
            <div className="mt-3 space-y-2 pt-3 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 text-[11px]">
                <Mail size={12} className="text-[#0055a2]" />
                <span className="truncate text-gray-600">{userEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <ShieldCheck size={12} className={roleConfig.textColor} />
                <span className="capitalize text-gray-600 font-medium">{roleConfig.badge}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Activity size={12} className="text-emerald-500" />
                <span className="text-gray-500">Connecté</span>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="mt-2 w-full text-center text-xs font-semibold text-[#0055a2] hover:underline"
              >
                Voir mon profil →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION PRINCIPALE */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredMenu.length > 0 ? (
          filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.description}
              className={({ isActive }) => `
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? `bg-gradient-to-r ${roleConfig.gradient} text-white shadow-md` 
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#0055a2]"
                }
              `}
            >
              <item.icon size={18} strokeWidth={2} />
              <span className="flex-1">{item.name}</span>
              {item.path === '/apprenant/formations' && (
                <span className="text-[9px] px-1.5 py-0.5 bg-white/20 rounded-full">NEW</span>
              )}
            </NavLink>
          ))
        ) : (
          <div className="text-center text-gray-400 text-sm py-4">
            <div className="animate-pulse">Chargement...</div>
          </div>
        )}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <NavLink
          to="/aide"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
            ${isActive 
              ? `bg-gradient-to-r ${roleConfig.gradient} text-white` 
              : "text-gray-600 hover:bg-gray-50 hover:text-[#0055a2]"
            }
          `}
        >
          <HelpCircle size={18} />
          <span>Aide & Support</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
            ${isActive 
              ? `bg-gradient-to-r ${roleConfig.gradient} text-white` 
              : "text-gray-600 hover:bg-gray-50 hover:text-[#0055a2]"
            }
          `}
        >
          <Settings size={18} />
          <span>Paramètres</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-300" />
          <span>Déconnexion</span>
        </button>

        {/* Badge de rôle */}
        <div className="mt-4 pt-2 text-center">
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${roleConfig.bgColor} ${roleConfig.textColor} text-[10px] font-medium`}>
            <Zap size={10} />
            <span>{roleConfig.badge}</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-3 text-center">
          <p className="text-[9px] text-gray-400 font-medium">
            © 2026 Algérie Poste
          </p>
          <p className="text-[8px] text-gray-300 mt-0.5">
            Version 2.0.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;