// frontend/src/components/Layout/SidebarFormateurEtab.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  MessageSquare,
  Settings,
  LogOut,
  GraduationCap,
  TrendingUp,
  ChevronDown,
  Mail,
  ShieldCheck,
  Zap,
} from "lucide-react";

const SidebarFormateurEtab = ({ isOpen = true }) => {
  const { currentUser, logout } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userMatricule, setUserMatricule] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const getAuthToken = () => localStorage.getItem("token");

  const primaryColor = "#6B7280"; // Gris moyen
  const lightBgColor = "#F3F4F6"; // Fond très clair
  const darkTextColor = "#4B5563"; // Texte foncé
  const hoverBgColor = "#F9FAFB"; // Fond au survol

  const loadUserFromBackend = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      console.log("📡 SidebarFormateurEtab: Chargement depuis le backend...");
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.data) {
        const user = response.data.data;
        console.log(
          "✅ SidebarFormateurEtab: Données chargées",
          user.prenom,
          user.nom,
        );

        setProfilePhoto(user.avatar || null);
        setUserEmail(user.email || "");
        setUserName(
          `${user.prenom || ""} ${user.nom || ""}`.trim() || "Formateur Étab",
        );
        setUserMatricule(
          user.matricule || user.email?.split("@")[0] || "FORMETAB",
        );

        localStorage.setItem("currentUser", JSON.stringify(user));
      }
    } catch (error) {
      console.error("❌ SidebarFormateurEtab: Erreur chargement:", error);
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser && savedUser !== "undefined") {
        const user = JSON.parse(savedUser);
        setProfilePhoto(user.avatar || null);
        setUserEmail(user.email || "");
        setUserName(
          `${user.prenom || ""} ${user.nom || ""}`.trim() || "Formateur Étab",
        );
        setUserMatricule(
          user.matricule || user.email?.split("@")[0] || "FORMETAB",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserFromBackend();
  }, []);

  useEffect(() => {
    const handleLoginSuccess = () => {
      console.log(
        "🔐 SidebarFormateurEtab: Connexion détectée, rechargement...",
      );
      setTimeout(() => loadUserFromBackend(), 500);
    };

    const handleProfileUpdated = (event) => {
      if (event.detail) {
        setProfilePhoto(event.detail.avatar || null);
        setUserEmail(event.detail.email || "");
        setUserName(
          `${event.detail.prenom || ""} ${event.detail.nom || ""}`.trim() ||
            "Formateur Étab",
        );
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "currentUser" && e.newValue) {
        const user = JSON.parse(e.newValue);
        setProfilePhoto(user.avatar || null);
        setUserEmail(user.email || "");
        setUserName(
          `${user.prenom || ""} ${user.nom || ""}`.trim() || "Formateur Étab",
        );
        setUserMatricule(
          user.matricule || user.email?.split("@")[0] || "FORMETAB",
        );
      }
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);
    window.addEventListener("profileUpdated", handleProfileUpdated);
    window.addEventListener("userDataChanged", handleProfileUpdated);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
      window.removeEventListener("profileUpdated", handleProfileUpdated);
      window.removeEventListener("userDataChanged", handleProfileUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const menuItems = [
    {
      path: "/formateur-etab",
      icon: LayoutDashboard,
      label: "Tableau de bord",
    },
    {
      path: "/formateur-etab/mes-formations",
      icon: BookOpen,
      label: "Mes formations",
    },
    {
      path: "/formateur-etab/mes-apprenants",
      icon: Users,
      label: "Mes apprenants",
    },
    { path: "/formateur-etab/evaluations", icon: Award, label: "Évaluations" },
    {
      path: "/formateur-etab/statistiques",
      icon: TrendingUp,
      label: "Statistiques",
    },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/profile", icon: Settings, label: "Profil" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleConfig = {
    icon: "🏫",
    badge: "Formateur Établissement",
  };

  if (isLoading) {
    return (
      <aside
        className={`bg-white flex items-center justify-center transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B7280]"></div>
      </aside>
    );
  }

  return (
    <aside
      className={`bg-white shadow-lg flex flex-col border-r border-gray-100 transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* LOGO */}
      <div
        className={`p-6 pb-4 border-b border-gray-100 ${!isOpen ? "flex justify-center" : ""}`}
      >
        <div className="flex items-center gap-3 group cursor-pointer">
          {isOpen ? (
            <>
              <img
                src="/image/imag4.jpg"
                alt="Logo"
                className="h-16 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="font-black text-sm text-[#172554]">
                  ALGÉRIE POSTE
                </span>
                <span className="text-[9px] uppercase font-bold text-[#FFC107]">
                  Learning
                </span>
              </div>
            </>
          ) : (
            <img
              src="/image/imag4.jpg"
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
          )}
        </div>
      </div>

      {/* Cadre du profil - Fond clair, écriture foncée */}
      <div className="p-4 border-b border-gray-100">
        <div
          className="rounded-xl p-3 border transition-all duration-200 hover:shadow-md"
          style={{
            backgroundColor: lightBgColor,
            borderColor: `${primaryColor}40`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md text-white"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  {userName.charAt(0).toUpperCase() || "F"}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            {isOpen && (
              <>
                <div className="flex-1">
                  <h3
                    className="font-semibold text-sm truncate"
                    style={{ color: darkTextColor }}
                  >
                    {userName || "Formateur Étab"}
                  </h3>
                  <p
                    className="text-[10px] truncate"
                    style={{ color: darkTextColor, opacity: 0.7 }}
                  >
                    {userMatricule}
                  </p>
                </div>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showProfile ? "rotate-180" : ""}`}
                    style={{ color: darkTextColor }}
                  />
                </button>
              </>
            )}
          </div>
          {showProfile && isOpen && (
            <div
              className="mt-3 pt-3 border-t"
              style={{ borderColor: `${primaryColor}30` }}
            >
              <div className="flex items-center gap-2 text-[11px]">
                <Mail size={12} style={{ color: primaryColor }} />
                <span
                  className="truncate"
                  style={{ color: darkTextColor, opacity: 0.8 }}
                >
                  {userEmail}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] mt-1">
                <ShieldCheck size={12} style={{ color: primaryColor }} />
                <span style={{ color: darkTextColor }}>{roleConfig.badge}</span>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="mt-2 w-full text-center text-xs font-semibold hover:underline transition-colors"
                style={{ color: primaryColor }}
              >
                Voir mon profil →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Menus avec couleur #6B7280 au survol et quand actif */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${!isOpen ? "justify-center" : ""}
              ${
                isActive
                  ? "bg-gray-100 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }
            `}
            style={({ isActive }) => ({
              color: isActive ? primaryColor : undefined,
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  style={{ color: isActive ? primaryColor : undefined }}
                />
                {isOpen && (
                  <span
                    className="flex-1"
                    style={{ color: isActive ? primaryColor : undefined }}
                  >
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all ${!isOpen ? "justify-center" : ""}`}
        >
          <LogOut size={18} />
          {isOpen && <span>Déconnexion</span>}
        </button>
        {isOpen && (
          <div className="mt-4 text-center">
            <div
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-medium"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                border: `1px solid ${primaryColor}30`,
              }}
            >
              <Zap size={10} style={{ color: primaryColor }} />
              <span>{roleConfig.badge}</span>
            </div>
            <p className="text-[9px] text-gray-400 mt-2">
              © 2026 Algérie Poste
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarFormateurEtab;
