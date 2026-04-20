// frontend/src/components/Layout/Header.js
import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  UserCircle,
  Menu,
  LogOut,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import io from "socket.io-client";
import api from "../../services/api";

const Header = ({ onMenuClick, sidebarOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const notificationRef = useRef(null);

  const getFullName = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom} ${user.nom}`;
    }
    if (user?.nom) return user.nom;
    if (user?.email) return user.email.split("@")[0];
    // Vérifier aussi dans localStorage
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return (
          parsed.fullName ||
          `${parsed.prenom || ""} ${parsed.nom || ""}`.trim() ||
          "Utilisateur"
        );
      } catch (e) {
        return "Utilisateur";
      }
    }
    return "Utilisateur";
  };

  const getRoleLabel = () => {
    const role = user?.role;
    if (role === "admin") return "Administrateur";
    if (role === "formateur") return "Formateur";
    if (role === "user" || role === "apprenant") return "Apprenant";
    // Vérifier dans localStorage
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const userRole = parsed.role;
        if (userRole === "admin") return "Administrateur";
        if (userRole === "formateur") return "Formateur";
        return "Apprenant";
      } catch (e) {
        return "Apprenant";
      }
    }
    return "Apprenant";
  };

  // Charger les notifications depuis l'API
  const loadNotifications = async () => {
    const userId = user?._id || user?.id;
    if (!userId) {
      console.log(
        "❌ Pas d'utilisateur, impossible de charger les notifications",
      );
      return;
    }

    try {
      const response = await api.get("/notifications");
      console.log("✅ Notifications chargées:", response.data);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error(
        "❌ Erreur chargement notifications:",
        error.response?.status,
      );
    }
  };

  // Initialiser Socket.io
  useEffect(() => {
    console.log("🔌 Initialisation Socket.io");
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    const userId = user?._id || user?.id;
    if (userId) {
      console.log(`📡 Enregistrement utilisateur ${userId}`);
      newSocket.emit("register", userId);
    }

    newSocket.on("new-notification", (notification) => {
      console.log("🔔 Nouvelle notification reçue:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/logo.png",
        });
      }
    });

    return () => {
      console.log("🔌 Déconnexion Socket.io");
      newSocket.disconnect();
    };
  }, [user?._id, user?.id]);

  // Demander la permission pour les notifications
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Charger les notifications au montage
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      loadNotifications();
    }
  }, [user?._id, user?.id]);

  // Fermer le menu des notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    navigate("/login");
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
      console.error("Erreur marquage toutes notifications:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);
    } catch (error) {
      console.error("Erreur suppression notifications:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification._id);

    if (notification.type === "message") {
      const rolePath = user?.role === "apprenant" ? "apprenant" : "formateur";
      navigate(`/${rolePath}/messages`);
    }

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
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return `Il y a ${diffDays} j`;
  };

  if (!isAuthenticated && !localStorage.getItem("currentUser")) {
    return null;
  }

  return (
    <header
      className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="flex items-center justify-between">
        {/* Partie gauche - Bouton menu */}
        <div className="flex items-center flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 mr-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={sidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                style={{ backgroundColor: "#f9fafb" }}
              />
            </div>
          </div>
        </div>

        {/* Partie droite - Notifications + Profil */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
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
                  <div className="flex gap-2">
                    {notifications.length > 0 && (
                      <>
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Tout marquer lu
                        </button>
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Tout effacer
                        </button>
                      </>
                    )}
                  </div>
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
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notif.read ? "bg-blue-50" : ""
                        }`}
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
                          {!notif.read && (
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div className="w-px h-6 bg-gray-200"></div>

          {/* Profil utilisateur */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-gray-400" />
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
