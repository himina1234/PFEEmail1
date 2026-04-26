// components/Layout/Header.js
import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  UserCircle,
  Menu,
  LogOut,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import api from "../../services/api";

const Header = ({ onMenuClick, sidebarOpen }) => {
  const navigate = useNavigate();
  const { currentUser, logout: contextLogout } = useUser();

  // ========== TOUS LES HOOKS ==========
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [userData, setUserData] = useState(null);
  const [imageError, setImageError] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // ========== FONCTION POUR METTRE À JOUR L'AVATAR ==========
  const updateAvatarFromStorage = () => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser && savedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (
          parsedUser.avatar &&
          parsedUser.avatar !== "null" &&
          parsedUser.avatar !== "undefined"
        ) {
          setAvatarUrl(parsedUser.avatar);
          setImageError(false);
          setAvatarKey(Date.now());
        } else {
          setAvatarUrl(null);
        }
        setUserData(parsedUser);
      } catch (e) {
        console.error("Erreur parsing localStorage:", e);
      }
    }
  };

  // ========== useEffect 1 - Chargement initial ==========
  useEffect(() => {
    updateAvatarFromStorage();

    const handleAvatarUpdate = (event) => {
      console.log("📸 Avatar update event reçu:", event.detail);
      if (event.detail && event.detail.avatar) {
        setAvatarUrl(event.detail.avatar);
        setImageError(false);
        setAvatarKey(Date.now());
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            user.avatar = event.detail.avatar;
            localStorage.setItem("currentUser", JSON.stringify(user));
            setUserData(user);
          } catch (e) {}
        }
      } else {
        updateAvatarFromStorage();
      }
    };

    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setUserData(event.detail);
        if (event.detail.avatar) {
          setAvatarUrl(event.detail.avatar);
          setImageError(false);
          setAvatarKey(Date.now());
        }
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "currentUser" && e.newValue) {
        try {
          const newUserData = JSON.parse(e.newValue);
          setUserData(newUserData);
          if (newUserData.avatar) {
            setAvatarUrl(newUserData.avatar);
            setImageError(false);
            setAvatarKey(Date.now());
          }
        } catch (err) {}
      }
    };

    const handleLoginSuccess = () => {
      setTimeout(updateAvatarFromStorage, 100);
    };

    window.addEventListener("avatarUpdated", handleAvatarUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("userDataChanged", handleProfileUpdate);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("loginSuccess", handleLoginSuccess);

    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("userDataChanged", handleProfileUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loginSuccess", handleLoginSuccess);
    };
  }, []);

  // ========== useEffect 2 - Mise à jour quand currentUser change ==========
  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
      if (currentUser.avatar) {
        setAvatarUrl(currentUser.avatar);
        setImageError(false);
        setAvatarKey(Date.now());
      }
    } else {
      updateAvatarFromStorage();
    }
  }, [currentUser]);

  // ========== useEffect 3 - Vérification périodique (500ms) ==========
  useEffect(() => {
    let lastAvatar = avatarUrl;
    const interval = setInterval(() => {
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser && savedUser !== "undefined") {
        try {
          const user = JSON.parse(savedUser);
          if (user.avatar && user.avatar !== lastAvatar) {
            setAvatarUrl(user.avatar);
            setAvatarKey(Date.now());
            lastAvatar = user.avatar;
          }
        } catch (e) {}
      }
    }, 500);
    return () => clearInterval(interval);
  }, [avatarUrl]);

  // ========== useEffect 4 - Notifications ==========
  useEffect(() => {
    const loadNotifications = async () => {
      const userId = userData?._id || currentUser?._id;
      if (!userId) return;

      try {
        const response = await api.get("/notifications");
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error(
            "Erreur chargement notifications:",
            error.response?.status,
          );
        }
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    if (userData || currentUser) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userData, currentUser]);

  // ========== useEffect 5 - Click outside ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ========== FONCTIONS ==========
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const role = userData?.role || currentUser?.role;
      let results = [];
      let menus = [];

      if (role === "admin") {
        menus = [
          { name: "Tableau de bord", path: "/dashboard" },
          { name: "Gestion formations", path: "/formations" },
          { name: "Utilisateurs", path: "/users" },
          { name: "Services", path: "/services" },
          { name: "Statistiques", path: "/statistiques" },
          { name: "Mon Profil", path: "/profile" },
        ];
      } else if (role === "apprenant") {
        menus = [
          { name: "Tableau de bord", path: "/apprenant" },
          {
            name: "Toutes les formations",
            path: "/apprenant/formations",
          },
          {
            name: "Mes formations",
            path: "/apprenant/mes-formations",
          },
          { name: "Planning", path: "/apprenant/planning" },
          { name: "Mon Profil", path: "/profile" },
        ];
      } else if (role === "formateur") {
        menus = [
          { name: "Tableau de bord", path: "/formateur" },
          { name: "Mes formations", path: "/mes-formations" },
          {
            name: "Mes apprenants",
            path: "/formateur/mes-apprenants",
            icon: "👥",
          },
          { name: "Mon Profil", path: "/profile" },
        ];
      }

      results = menus.filter((menu) =>
        menu.name.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Erreur recherche:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const navigateToResult = (path) => {
    setSearchQuery("");
    setShowSearchResults(false);
    navigate(path);
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur marquage notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur marquage toutes lues:", error);
    }
  };

  const deleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await api.delete(`/notifications/${notificationId}`);
      const newNotifications = notifications.filter(
        (n) => n._id !== notificationId,
      );
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification._id);
    setShowNotifications(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "call":
        return <Phone className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "À l'instant";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    const diffHours = Math.floor((now - date) / 3600000);
    const diffDays = Math.floor((now - date) / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return `Il y a ${diffDays} j`;
  };

  const getFullName = () => {
    if (userData) {
      if (userData.prenom && userData.nom)
        return `${userData.prenom} ${userData.nom}`;
      if (userData.nom) return userData.nom;
      if (userData.email) return userData.email.split("@")[0];
    }
    if (currentUser?.prenom && currentUser?.nom)
      return `${currentUser.prenom} ${currentUser.nom}`;

    const savedUser = localStorage.getItem("currentUser");
    if (savedUser && savedUser !== "undefined") {
      try {
        const parsed = JSON.parse(savedUser);
        return (
          `${parsed.prenom || ""} ${parsed.nom || ""}`.trim() || "Utilisateur"
        );
      } catch (e) {
        return "Utilisateur";
      }
    }
    return "Utilisateur";
  };

  const getRoleLabel = () => {
    const role = userData?.role || currentUser?.role;
    if (role === "admin") return "Administrateur";
    if (role === "formateur") return "Formateur";
    if (role === "formateur-etab") return "Formateur Établissement";
    return "Apprenant";
  };

  const getInitial = () => {
    const prenom = userData?.prenom || currentUser?.prenom || "";
    const nom = userData?.nom || currentUser?.nom || "";
    if (prenom && nom)
      return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    if (prenom) return prenom.charAt(0).toUpperCase();
    if (nom) return nom.charAt(0).toUpperCase();
    return "?";
  };

  const handleLogout = () => {
    contextLogout();
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ========== COMPOSANT AVATAR ==========
  const HeaderAvatar = () => {
    const [localImageError, setLocalImageError] = useState(false);
    const [currentAvatar, setCurrentAvatar] = useState(null);

    useEffect(() => {
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser && savedUser !== "undefined") {
        try {
          const user = JSON.parse(savedUser);
          if (
            user.avatar &&
            user.avatar !== "null" &&
            user.avatar !== "undefined"
          ) {
            setCurrentAvatar(user.avatar);
          } else {
            setCurrentAvatar(null);
          }
        } catch (e) {}
      }
    }, [avatarUrl, avatarKey]);

    if (
      currentAvatar &&
      !localImageError &&
      currentAvatar !== "null" &&
      currentAvatar !== "undefined"
    ) {
      return (
        <img
          key={Date.now()}
          src={currentAvatar}
          alt={getFullName()}
          className="w-8 h-8 rounded-full object-cover"
          onError={() => {
            setLocalImageError(true);
          }}
        />
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#122E8E] to-[#1e4a8a] flex items-center justify-center text-white text-sm font-bold">
        {getInitial()}
      </div>
    );
  };

  const isAuthenticated =
    !!currentUser || !!localStorage.getItem("currentUser");
  if (!isAuthenticated) return null;

  // ========== RENDU ==========
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 mr-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#122E8E] focus:border-transparent text-sm bg-gray-50"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm mt-2">Recherche...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="p-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">
                        Résultats ({searchResults.length})
                      </p>
                    </div>
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => navigateToResult(result.path)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <span className="text-lg">{result.icon || "🔍"}</span>
                        <div>
                          <p className="text-sm text-gray-800">{result.name}</p>
                          <p className="text-xs text-gray-500">{result.path}</p>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  searchQuery && (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">Aucun résultat</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Tout lire
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">
                        Aucune notification
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors relative ${!notif.read ? "bg-blue-50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notif.title}
                              </p>
                              <span className="text-xs text-gray-400">
                                {getTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {notif.message}
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteNotification(notif._id, e)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        {!notif.read && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200"></div>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <HeaderAvatar />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-800">
                  {getFullName()}
                </p>
                <p className="text-xs text-gray-500">{getRoleLabel()}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserCircle className="h-4 w-4" />
                    Mon profil
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
