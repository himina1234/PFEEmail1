// src/components/Layout/Sidebar.js
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ isOpen = true, onToggle }) => {
  const { currentUser } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(isOpen);
  const [userInfo, setUserInfo] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    email: "",
    role: "",
    avatar: null
  });
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const getAuthToken = () => localStorage.getItem("token");

  // Charger les données utilisateur
  const loadUserInfo = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        // Fallback sur localStorage
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setUserInfo({
            nom: user.nom || "",
            prenom: user.prenom || "",
            matricule: user.matricule || "",
            email: user.email || "",
            role: user.role || "user",
            avatar: user.avatar || null
          });
        }
        return;
      }

      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        const user = response.data.data;
        setUserInfo({
          nom: user.nom || "",
          prenom: user.prenom || "",
          matricule: user.matricule || "",
          email: user.email || "",
          role: user.role || "user",
          avatar: user.avatar || null
        });
        
        // Mettre à jour localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));
        setImageError(false);
      }
    } catch (error) {
      console.error("Erreur chargement user info:", error);
      // Fallback sur localStorage
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUserInfo({
          nom: user.nom || "",
          prenom: user.prenom || "",
          matricule: user.matricule || "",
          email: user.email || "",
          role: user.role || "user",
          avatar: user.avatar || null
        });
      }
    }
  };

  useEffect(() => {
    loadUserInfo();

    // Écouter les mises à jour
    const handleProfileUpdate = () => {
      loadUserInfo();
    };

    const handleAvatarUpdate = (event) => {
      if (event.detail?.avatar) {
        setUserInfo(prev => ({ ...prev, avatar: event.detail.avatar }));
        setImageError(false);
      } else {
        loadUserInfo();
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "currentUser" && e.newValue) {
        try {
          const user = JSON.parse(e.newValue);
          setUserInfo({
            nom: user.nom || "",
            prenom: user.prenom || "",
            matricule: user.matricule || "",
            email: user.email || "",
            role: user.role || "user",
            avatar: user.avatar || null
          });
          setImageError(false);
        } catch (error) {}
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("avatarUpdated", handleAvatarUpdate);
    window.addEventListener("userDataChanged", handleProfileUpdate);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("loginSuccess", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
      window.removeEventListener("userDataChanged", handleProfileUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loginSuccess", handleProfileUpdate);
    };
  }, []);

  const handleToggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    if (onToggle) onToggle(newState);
    localStorage.setItem("sidebarOpen", newState);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("favoriteFormations");
    navigate("/login");
  };

  const userName = `${userInfo.prenom} ${userInfo.nom}`.trim() || "Utilisateur";
  const userInitial = userName.charAt(0).toUpperCase();

  const getRoleConfig = () => {
    const role = userInfo.role;
    const configs = {
      admin: {
        color: "from-blue-600 to-indigo-600",
        badge: "Administrateur",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-700",
        gradient: "from-blue-700 to-indigo-700",
        hoverColor: "hover:bg-blue-50",
      },
      formateur: {
        color: "from-emerald-600 to-teal-600",
        badge: "Formateur",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        textColor: "text-emerald-700",
        gradient: "from-emerald-700 to-teal-700",
        hoverColor: "hover:bg-emerald-50",
      },
      user: {
        color: "from-[#0055a2] to-[#0077e6]",
        badge: "Apprenant",
        bgColor: "bg-[#0055a2]/5",
        borderColor: "border-[#0055a2]/20",
        textColor: "text-[#0055a2]",
        gradient: "from-[#0055a2] to-[#0077e6]",
        hoverColor: "hover:bg-[#0055a2]/5",
      },
      apprenant: {
        color: "from-[#0055a2] to-[#0077e6]",
        badge: "Apprenant",
        bgColor: "bg-[#0055a2]/5",
        borderColor: "border-[#0055a2]/20",
        textColor: "text-[#0055a2]",
        gradient: "from-[#0055a2] to-[#0077e6]",
        hoverColor: "hover:bg-[#0055a2]/5",
      },
    };
    return configs[role] || configs.user;
  };

  const roleConfig = getRoleConfig();
  const isSidebarOpen = sidebarOpen;

  // Menu items (gardez votre configuration existante)
  const menuItems = [
    { path: "/dashboard", name: "Tableau de bord", icon: LayoutGrid, roles: ["admin"] },
    { path: "/formations", name: "Gestion formations", icon: BookOpen, roles: ["admin"] },
    { path: "/users", name: "Utilisateurs", icon: Users, roles: ["admin"] },
    { path: "/formateur", name: "Tableau de bord", icon: LayoutGrid, roles: ["formateur"] },
    { path: "/mes-cours", name: "Mes Cours", icon: BookOpen, roles: ["formateur"] },
    { path: "/apprenant", name: "Tableau de bord", icon: LayoutGrid, roles: ["user", "apprenant"] },
    { path: "/apprenant/formations", name: "Toutes les formations", icon: Library, roles: ["user", "apprenant"] },
    { path: "/apprenant/mes-formations", name: "Mes formations", icon: BookOpen, roles: ["user", "apprenant"] },
    { path: "/profile", name: "Mon Profil", icon: User, roles: ["admin", "formateur", "user", "apprenant"] },
    { path: "/settings", name: "Paramètres", icon: Settings, roles: ["admin", "formateur", "user", "apprenant"] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(userInfo.role || "user")
  );

  return (
    <>
      <button
        onClick={handleToggleSidebar}
        className="fixed top-20 left-0 z-50 bg-white border border-gray-200 rounded-r-xl p-1.5 shadow-md hover:bg-gray-50 transition-all duration-300"
        style={{ left: isSidebarOpen ? "248px" : "72px" }}
      >
        {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      <aside className={`bg-gradient-to-b from-white to-gray-50 shadow-xl flex flex-col border-r border-gray-200 transition-all duration-300 relative ${isSidebarOpen ? "w-64" : "w-20"}`}>
        {/* Logo */}
        <div className={`p-6 pb-4 border-b border-gray-200 ${!isSidebarOpen ? "flex justify-center" : ""}`}>
          <div className="flex items-center gap-3">
            {isSidebarOpen ? (
              <>
                <img src="/image/imag4.jpg" alt="Logo" className="h-16 w-auto object-contain" />
                <div className="flex flex-col">
                  <span className="font-black text-sm text-[#003366]">ALGÉRIE POSTE</span>
                  <span className="text-[9px] uppercase font-bold text-[#FFC107]">Learning</span>
                </div>
              </>
            ) : (
              <img src="/image/imag4.jpg" alt="Logo" className="h-10 w-auto object-contain" />
            )}
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-b border-gray-200">
          <div className={`bg-gradient-to-br from-white to-gray-100 rounded-xl p-3 border ${roleConfig.borderColor} shadow-sm`}>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {userInfo.avatar && !imageError ? (
                  <img
                    src={userInfo.avatar}
                    alt={userName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#0055a2]/20"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className={`w-10 h-10 bg-gradient-to-br ${roleConfig.color} rounded-full flex items-center justify-center text-white text-lg shadow-md`}>
                    {userInitial}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>

              {isSidebarOpen && (
                <>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-800 truncate">{userName}</h3>
                    <p className="text-[10px] text-gray-500 truncate">{userInfo.matricule}</p>
                  </div>
                  <button onClick={() => setShowProfile(!showProfile)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <ChevronDown size={14} className={`transition-transform ${showProfile ? "rotate-180" : ""}`} />
                  </button>
                </>
              )}
            </div>

            {showProfile && isSidebarOpen && (
              <div className="mt-3 space-y-2 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-[11px]">
                  <Mail size={12} className="text-[#0055a2]" />
                  <span className="truncate text-gray-600">{userInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <ShieldCheck size={12} className={roleConfig.textColor} />
                  <span className="capitalize text-gray-600">{roleConfig.badge}</span>
                </div>
                <button onClick={() => navigate("/profile")} className="mt-2 w-full text-center text-xs font-semibold text-[#0055a2] hover:underline">
                  Voir mon profil →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${!isSidebarOpen ? "justify-center" : ""}
                  ${isActive 
                    ? `bg-gradient-to-r ${roleConfig.gradient} text-white shadow-md`
                    : `text-gray-700 ${roleConfig.hoverColor} hover:text-[#0055a2]`}
                `}
              >
                <Icon size={18} />
                {isSidebarOpen && <span className="flex-1">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all ${!isSidebarOpen ? "justify-center" : ""}`}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Déconnexion</span>}
          </button>

          {isSidebarOpen && (
            <div className="mt-4 text-center">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${roleConfig.bgColor} ${roleConfig.textColor} text-[10px] font-medium`}>
                <Zap size={10} />
                <span>{roleConfig.badge}</span>
              </div>
              <p className="text-[9px] text-gray-500 mt-3">© 2026 Algérie Poste</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;