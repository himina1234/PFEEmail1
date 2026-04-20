// src/components/Layout/Sidebar.js - Version corrigée
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  User,
  BookOpen,
  FileText,
  Award,
  Video,
  Settings,
  LogOut,
  LayoutGrid,
  Star,
  ChevronDown,
  Mail,
  ShieldCheck,
  Zap,
  TrendingUp,
  BarChart2,
  Users,
  Briefcase,
  Calendar,
  Library,
  Heart,
  MessageCircle,
  HelpCircle,
  Activity,
} from "lucide-react";

const Sidebar = () => {
  const { currentUser, updateCurrentUser, refreshUserData } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [userDataState, setUserDataState] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();

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

  // Charger les données utilisateur
  const loadUserData = () => {
    // Priorité: d'abord le contexte, puis localStorage
    let user = currentUser;
    
    if (!user || Object.keys(user).length === 0) {
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        try {
          user = JSON.parse(savedUser);
        } catch (error) {
          console.error("Erreur parsing:", error);
        }
      }
    }
    
    if (user && Object.keys(user).length > 0) {
      console.log("📋 Sidebar: Chargement utilisateur:", user.prenom, user.nom);
      setUserDataState(user);
      setAvatarError(false); // Reset error on load
    }
  };

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  // Écouter les mises à jour du profil
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log("🔄 Sidebar: Mise à jour profil reçue", event.detail);
      if (event.detail) {
        setUserDataState(event.detail);
        setAvatarError(false);
        // Mettre à jour localStorage
        localStorage.setItem("currentUser", JSON.stringify(event.detail));
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "currentUser" && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue);
          console.log("🔄 Sidebar: Storage changé", updatedUser);
          setUserDataState(updatedUser);
          setAvatarError(false);
        } catch (error) {
          console.error("Erreur storage:", error);
        }
      }
    };

    const handleLogin = () => {
      console.log("🔐 Sidebar: Événement login détecté");
      setTimeout(() => {
        loadUserData();
        if (refreshUserData) refreshUserData();
      }, 100);
    };

    const handleLogout = () => {
      console.log("🚪 Sidebar: Événement logout détecté");
      setUserDataState(null);
      setAvatarError(false);
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLogin", handleLogin);
    window.addEventListener("userLogout", handleLogout);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLogin", handleLogin);
      window.removeEventListener("userLogout", handleLogout);
    };
  }, [refreshUserData]);

  const handleLogout = () => {
    // Émettre un événement avant de nettoyer
    window.dispatchEvent(new CustomEvent("userLogout"));
    
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("favoriteFormations");
    localStorage.removeItem("users");
    
    setUserDataState(null);
    setAvatarError(false);
    
    navigate("/login");
  };

  // Configuration des menus par rôle
  const menuItems = [
    // Menu Admin
    {
      path: "/dashboard",
      name: "Tableau de bord",
      icon: LayoutGrid,
      roles: ["admin"],
      description: "Vue d'ensemble",
    },
    {
      path: "/formations",
      name: "Gestion formations",
      icon: BookOpen,
      roles: ["admin"],
      description: "CRUD formations",
    },
    {
      path: "/admin/inscriptions",
      name: "Gestion inscriptions",
      icon: Users,
      roles: ["admin"],
      description: "Gérer les demandes d'inscription",
    },
    {
      path: "/users",
      name: "Utilisateurs",
      icon: Users,
      roles: ["admin"],
      description: "Gestion des comptes",
    },
    {
      path: "/services",
      name: "Services",
      icon: Briefcase,
      roles: ["admin"],
      description: "Services postaux",
    },
    {
      path: "/statistiques",
      name: "Statistiques",
      icon: BarChart2,
      roles: ["admin"],
      description: "Analyses et rapports",
    },
    {
      path: "/examens",
      name: "Examens",
      icon: FileText,
      roles: ["admin"],
      description: "Gestion des examens",
    },
    // Menu Formateur
    {
      path: "/formateur",
      name: "Tableau de bord",
      icon: LayoutGrid,
      roles: ["formateur"],
      description: "Vue d'ensemble",
    },
    {
      path: "/mes-cours",
      name: "Mes Cours",
      icon: BookOpen,
      roles: ["formateur"],
      description: "Cours à animer",
    },
    {
      path: "/etudiants",
      name: "Mes Apprenants",
      icon: Users,
      roles: ["formateur"],
      description: "Suivi des apprenants",
    },
    {
      path: "/evaluations",
      name: "Évaluations",
      icon: Star,
      roles: ["formateur"],
      description: "Noter les apprenants",
    },
    {
      path: "/cours-direct",
      name: "Cours en direct",
      icon: Video,
      roles: ["formateur", "user"],
      description: "Classes virtuelles",
    },
    // Menu Apprenant
    {
      path: "/apprenant",
      name: "Tableau de bord",
      icon: LayoutGrid,
      roles: ["user"],
      description: "Vue d'ensemble",
    },
    {
      path: "/apprenant/formations",
      name: "Toutes les formations",
      icon: Library,
      roles: ["user"],
      description: "Catalogue complet",
    },
    {
      path: "/apprenant/mes-formations",
      name: "Mes formations",
      icon: BookOpen,
      roles: ["user"],
      description: "Mes formations suivies",
    },
    {
      path: "/apprenant/planning",
      name: "Planning",
      icon: Calendar,
      roles: ["user"],
      description: "Tests et évaluations",
    },
    {
      path: "/apprenant/cahier-suivi",
      name: "Cahier de suivi",
      icon: TrendingUp,
      roles: ["user"],
      description: "Suivi de progression",
    },
    {
      path: "/certificats",
      name: "Certificats",
      icon: Award,
      roles: ["user"],
      description: "Mes attestations",
    },
    {
      path: "/feedback",
      name: "Feedback",
      icon: MessageCircle,
      roles: ["user"],
      description: "Donner mon avis",
    },
    {
      path: "/favoris",
      name: "Mes favoris",
      icon: Heart,
      roles: ["user"],
      description: "Formations favorites",
    },
    // Menu commun à tous
    {
      path: "/profile",
      name: "Mon Profil",
      icon: User,
      roles: ["admin", "formateur", "user"],
      description: "Informations personnelles",
    },
    {
      path: "/settings",
      name: "Paramètres",
      icon: Settings,
      roles: ["admin", "formateur", "user"],
      description: "Préférences",
    },
    {
      path: "/aide",
      name: "Aide & Support",
      icon: HelpCircle,
      roles: ["admin", "formateur", "user"],
      description: "Centre d'aide",
    },
  ];

  const getFilteredMenu = () => {
    const role = userDataState?.role || currentUser?.role;
    if (!role) return [];
    return menuItems.filter((item) => item.roles && item.roles.includes(role));
  };

  const filteredMenu = getFilteredMenu();

  const getUserData = () => {
    if (userDataState) return userDataState;
    if (currentUser && Object.keys(currentUser).length > 0) return currentUser;
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        return {};
      }
    }
    return {};
  };

  const userData = getUserData();
  const userName = `${userData.prenom || ""} ${userData.nom || ""}`.trim() || "Utilisateur";
  const userMatricule = userData.matricule || "N/A";
  const userEmail = userData.email || "email@example.com";
  const role = userDataState?.role || currentUser?.role || userData?.role || "user";
  const userAvatar = userData.avatar || null;
  
  // Vérifier si l'avatar est valide
  const validAvatar = isValidAvatar(userAvatar) && !avatarError;

  const getRoleConfig = () => {
    const configs = {
      admin: {
        icon: "👑",
        color: "from-orange-500 to-red-500",
        badge: "Administrateur",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        textColor: "text-orange-400",
        gradient: "from-orange-600 to-red-600",
      },
      formateur: {
        icon: "🎓",
        color: "from-green-600 to-emerald-600",
        badge: "Formateur",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
        textColor: "text-green-400",
        gradient: "from-green-600 to-emerald-600",
      },
      user: {
        icon: "👤",
        color: "from-blue-600 to-cyan-600",
        badge: "Apprenant",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        textColor: "text-blue-400",
        gradient: "from-[#0055a2] to-[#0077e6]",
      },
    };
    return configs[role] || configs.user;
  };

  const roleConfig = getRoleConfig();

  // Si pas d'utilisateur, ne pas afficher la sidebar ou afficher un chargement
  if (!role || !userData || Object.keys(userData).length === 0) {
    return (
      <aside className="w-64 h-screen bg-white flex items-center justify-center border-r border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0055a2]"></div>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-white shadow-lg flex flex-col shrink-0 border-r border-gray-100">
      {/* LOGO */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 group cursor-pointer">
          <img
            src="/image/imag4.jpg"
            alt="Algérie Poste Logo"
            className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/64?text=AP";
            }}
          />
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tighter text-blue-950 leading-none">
              ALGÉRIE POSTE
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#FFC107]">
              Learning
            </span>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-4 border-b border-gray-100">
        <div
          className={`bg-gradient-to-br ${roleConfig.bgColor} rounded-xl p-3 border ${roleConfig.borderColor}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {validAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#0055a2]/20"
                  onError={() => {
                    console.error("Erreur chargement avatar, affichage fallback");
                    setAvatarError(true);
                  }}
                />
              ) : (
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${roleConfig.color} rounded-full flex items-center justify-center text-white text-lg shadow-md`}
                >
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
              <ChevronDown
                size={14}
                className={`transition-transform text-gray-500 ${showProfile ? "rotate-180" : ""}`}
              />
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
                <span className="capitalize text-gray-600 font-medium">
                  {roleConfig.badge}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Activity size={12} className="text-emerald-500" />
                <span className="text-gray-500">Connecté</span>
              </div>
              <button
                onClick={() => navigate("/profile")}
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
                ${
                  isActive
                    ? `bg-gradient-to-r ${roleConfig.gradient} text-white shadow-md`
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0055a2]"
                }
              `}
            >
              <item.icon size={18} strokeWidth={2} />
              <span className="flex-1">{item.name}</span>
              {item.path === "/apprenant/formations" && (
                <span className="text-[9px] px-1.5 py-0.5 bg-white/20 rounded-full">
                  NEW
                </span>
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
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <LogOut
            size={18}
            className="group-hover:rotate-180 transition-transform duration-300"
          />
          <span>Déconnexion</span>
        </button>

        <div className="mt-4 pt-2 text-center">
          <div
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${roleConfig.bgColor} ${roleConfig.textColor} text-[10px] font-medium`}
          >
            <Zap size={10} />
            <span>{roleConfig.badge}</span>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-[9px] text-gray-400 font-medium">
            © 2026 Algérie Poste
          </p>
          <p className="text-[8px] text-gray-300 mt-0.5">Version 2.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;