// components/Layout/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      if (userData.avatar) {
        setAvatarUrl(userData.avatar);
      }
    }
    loadNotifications();
    loadAvatar();
  }, []);

  // Écouter les mises à jour de l'avatar
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      if (event.detail?.avatar) {
        setAvatarUrl(event.detail.avatar);
        setAvatarError(false);
        
        // Mettre à jour l'utilisateur dans le state
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          userData.avatar = event.detail.avatar;
          setUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
      } else {
        loadAvatar();
      }
    };

    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setUser(event.detail);
        if (event.detail.avatar) {
          setAvatarUrl(event.detail.avatar);
          setAvatarError(false);
        }
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'currentUser' && e.newValue) {
        try {
          const userData = JSON.parse(e.newValue);
          setUser(userData);
          if (userData.avatar) {
            setAvatarUrl(userData.avatar);
            setAvatarError(false);
          }
        } catch (error) {}
      }
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('userDataChanged', handleProfileUpdate);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginSuccess', () => {
      loadAvatar();
      loadNotifications();
    });

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('userDataChanged', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginSuccess', () => {});
    };
  }, []);

  const loadAvatar = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL}/users/avatar`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success && response.data.avatar) {
        setAvatarUrl(response.data.avatar);
        setAvatarError(false);
        
        // Mettre à jour dans localStorage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          userData.avatar = response.data.avatar;
          localStorage.setItem('currentUser', JSON.stringify(userData));
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Erreur chargement avatar:', error);
    }
  };

  const loadNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } else if (response.status === 404) {
        console.log('ℹ️ API notifications non disponible');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('⚠️ Erreur chargement notifications:', error.message);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Composant Avatar avec fallback
  const AvatarImage = () => {
    const [imgError, setImgError] = useState(false);
    
    // Si l'URL de l'avatar existe et pas d'erreur, afficher l'image
    if (avatarUrl && !avatarError && !imgError) {
      return (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover"
          onError={() => {
            console.error('Erreur chargement avatar:', avatarUrl);
            setImgError(true);
            setAvatarError(true);
          }}
        />
      );
    }
    
    // Fallback: afficher l'icône selon le rôle
    if (!user) return '👤';
    if (user.role === 'admin') return '👑';
    if (user.role === 'formateur') return '🎓';
    return '👤';
  };

  // Obtenir l'initiale pour le fallback
  const getInitial = () => {
    if (user?.prenom) return user.prenom.charAt(0).toUpperCase();
    if (user?.nom) return user.nom.charAt(0).toUpperCase();
    return 'U';
  };

  // Obtenir les couleurs de fond selon le rôle
  const getAvatarBgColor = () => {
    if (!user) return 'from-indigo-100 to-purple-100';
    if (user.role === 'admin') return 'from-red-100 to-rose-100';
    if (user.role === 'formateur') return 'from-emerald-100 to-teal-100';
    return 'from-indigo-100 to-purple-100';
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo / Titre */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AP</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Plateforme Formation</h1>
            <p className="text-xs text-gray-400">Algérie Poste Learning</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Menu notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <Bell size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                        onClick={() => markAsRead(notif._id)}
                      >
                        <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {/* Avatar avec photo */}
              <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarBgColor()} rounded-full flex items-center justify-center text-base font-medium text-gray-700 overflow-hidden`}>
                {avatarUrl && !avatarError ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  getInitial()
                )}
              </div>
              
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-xs text-gray-400">{user.matricule}</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  {/* Petit avatar dans le menu */}
                  <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarBgColor()} rounded-full flex items-center justify-center text-lg font-medium text-gray-700 overflow-hidden`}>
                    {avatarUrl && !avatarError ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      getInitial()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {user.prenom} {user.nom}
                    </p>
                    <p className="text-xs text-gray-400">{user.matricule}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User size={16} />
                  Mon profil
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
                >
                  <Settings size={16} />
                  Paramètres
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;