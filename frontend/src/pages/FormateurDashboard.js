// frontend/src/pages/FormateurDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  BookOpen,
  Star,
  Plus,
  Edit3,
  Bell,
  Search,
  Zap,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Clock,
  PlayCircle,
  FileText,
  Sparkles,
  MessageCircle,
  Calendar,
} from "lucide-react";

const FormateurDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [apprenantsCount, setApprenantsCount] = useState({});
  const [stats, setStats] = useState({
    totalFormations: 0,
    totalApprenants: 0,
    moyenneNote: 0,
    tauxAchevement: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const getAuthToken = () => localStorage.getItem("token");

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (!savedUser) {
      navigate("/login");
      return;
    }
    setCurrentUser(JSON.parse(savedUser));
  }, [navigate]);

  useEffect(() => {
    if (currentUser && currentUser.role === "formateur") {
      loadFormations();
      loadNotifications();
      loadRecentActivity();
    }
  }, [currentUser]);

  // Charger les formations du formateur
  const loadFormations = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const userId = currentUser?._id || currentUser?.id;

      // 1. Récupérer toutes les affectations
      const affectationsResponse = await axios.get(`${API_URL}/affectations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (affectationsResponse.data.success) {
        // Filtrer les affectations du formateur
        const userAffectations = affectationsResponse.data.data.filter(
          (a) => a.userId === userId,
        );

        if (userAffectations.length === 0) {
          setFormations([]);
          setFilteredFormations([]);
          setLoading(false);
          return;
        }

        // 2. Récupérer les détails des formations
        const formationIds = userAffectations.map((a) => a.formationId);
        const formationsPromises = formationIds.map(async (id) => {
          const response = await axios.get(`${API_URL}/formations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return response.data.success ? response.data.data : null;
        });

        const formationsData = await Promise.all(formationsPromises);
        const validFormations = formationsData.filter((f) => f !== null);

        setFormations(validFormations);
        setFilteredFormations(validFormations);

        // 3. Compter les apprenants pour chaque formation
        await countApprenantsByFormation(token, formationIds);

        // 4. Calculer les statistiques
        calculateStats(validFormations);
      }
    } catch (error) {
      console.error("Erreur chargement formations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Compter les apprenants par formation
  const countApprenantsByFormation = async (token, formationIds) => {
    try {
      const affectationsResponse = await axios.get(`${API_URL}/affectations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (affectationsResponse.data.success) {
        const apprenantsAffectations = affectationsResponse.data.data.filter(
          (a) => a.userType === "apprenants",
        );

        const countMap = {};
        formationIds.forEach((id) => {
          countMap[id] = apprenantsAffectations.filter(
            (a) => a.formationId === id,
          ).length;
        });

        setApprenantsCount(countMap);
      }
    } catch (error) {
      console.error("Erreur comptage apprenants:", error);
    }
  };

  // Calculer les statistiques
  const calculateStats = (formationsList) => {
    const totalFormations = formationsList.length;
    const totalApprenants = formationsList.reduce(
      (acc, f) => acc + (apprenantsCount[f._id] || 0),
      0,
    );

    // Calculer la moyenne des notes des quiz (à implémenter avec vos données)
    const moyenneNote = 4.5; // À remplacer par calcul réel

    // Calculer le taux d'achèvement moyen des formations
    let totalProgress = 0;
    formationsList.forEach((f) => {
      const saved = localStorage.getItem(
        `progress_${f._id}_${currentUser?._id}`,
      );
      if (saved) {
        totalProgress += JSON.parse(saved).pourcentage || 0;
      }
    });
    const tauxAchevement =
      formationsList.length > 0
        ? Math.round(totalProgress / formationsList.length)
        : 0;

    setStats({
      totalFormations,
      totalApprenants,
      moyenneNote,
      tauxAchevement,
    });
  };

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setNotifications(response.data.data || []);
      } else {
        // Notifications mockées en attendant
        setNotifications([
          {
            id: 1,
            message: "Bienvenue sur votre tableau de bord formateur",
            time: "Maintenant",
            read: false,
            type: "info",
          },
        ]);
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    }
  };

  // Charger l'activité récente
  const loadRecentActivity = async () => {
    try {
      const token = getAuthToken();
      // Récupérer les soumissions récentes
      const response = await axios.get(`${API_URL}/affectations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const recentAffectations = response.data.data
          .filter((a) => a.userType === "apprenants")
          .slice(0, 5)
          .map((a) => ({
            id: a._id,
            message: `${a.userNom} a rejoint une formation`,
            time: new Date(a.dateAffectation).toLocaleDateString(),
            formationId: a.formationId,
          }));
        setRecentActivity(recentAffectations);
      }
    } catch (error) {
      console.error("Erreur chargement activité:", error);
      // Données mockées
      setRecentActivity([
        {
          id: 1,
          message: "Bienvenue sur votre tableau de bord",
          time: "Maintenant",
        },
      ]);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getStatusBadge = (formation) => {
    if (formation.statut === "actif") {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle size={12} /> Actif
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
        <Clock size={12} /> Inactif
      </span>
    );
  };

  const getProgressForFormation = (formationId) => {
    const saved = localStorage.getItem(
      `progress_${formationId}_${currentUser?._id}`,
    );
    if (saved) {
      return JSON.parse(saved).pourcentage || 0;
    }
    return 0;
  };

  const filteredFormationsList = filteredFormations.filter(
    (formation) =>
      formation.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formation.domaine?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const markAsRead = async (id) => {
    try {
      const token = getAuthToken();
      await axios.put(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif,
        ),
      );
    } catch (error) {
      console.error("Erreur marquage notification:", error);
    }
  };

  if (!currentUser || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-yellow-500 animate-pulse" size={24} />
          </div>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      label: "Formations",
      value: stats.totalFormations,
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Apprenants",
      value: stats.totalApprenants,
      icon: Users,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Note moyenne",
      value: stats.moyenneNote.toFixed(1),
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "Taux d'achèvement",
      value: `${stats.tauxAchevement}%`,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-500">
            Bienvenue, {currentUser.prenom} {currentUser.nom} ! Voici l'aperçu
            de vos formations
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0055a2] w-64"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${!notif.read ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      >
                        <p className="text-sm text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notif.time}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bouton Chat */}
          <button
            onClick={() => navigate("/chat")}
            className="relative p-2 text-gray-600 hover:text-[#0055a2] transition"
          >
            <MessageCircle size={20} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform`}
              >
                <stat.icon className={stat.textColor} size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                style={{ width: "70%" }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#0055a2] to-[#0077e6] rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Gérer vos formations</h3>
            <p className="text-blue-100 text-sm">
              Consultez et gérez le contenu de vos formations
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/mes-formations")}
              className="px-6 py-3 bg-white text-[#0055a2] rounded-xl font-medium hover:bg-yellow-500 hover:text-[#0055a2] transition-all flex items-center gap-2"
            >
              <BookOpen size={18} />
              Mes formations
            </button>
            <button
              onClick={() => navigate("/formateur/mes-apprenants")}
              className="px-6 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <Users size={18} />
              Mes apprenants
            </button>
            <button
              onClick={() => navigate("/formateur/evaluations")}
              className="px-6 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <Star size={18} />
              Évaluations
            </button>
          </div>
        </div>
      </div>

      {/* Mes Formations */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={20} className="text-[#0055a2]" />
              Mes formations
            </h2>
            <button
              onClick={() => navigate("/mes-formations")}
              className="text-sm text-[#0055a2] hover:text-yellow-600 transition-colors flex items-center gap-1"
            >
              Voir tout <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {filteredFormationsList.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Aucune formation trouvée</p>
              <p className="text-sm text-gray-400 mt-2">
                Les formations qui vous seront affectées apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFormationsList.map((formation) => {
                const progress = getProgressForFormation(formation._id);
                const apprenants = apprenantsCount[formation._id] || 0;

                return (
                  <div
                    key={formation._id}
                    className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="relative h-48 overflow-hidden bg-gradient-to-r from-[#0055a2] to-[#0077e6]">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(formation)}
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
                          {formation.domaine}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
                          {formation.duree}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {formation.titre}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {formation.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {apprenants} apprenants
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Début:{" "}
                          {formation.dateDebut
                            ? new Date(formation.dateDebut).toLocaleDateString()
                            : "Non définie"}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            Progression globale
                          </span>
                          <span className="font-medium text-[#0055a2]">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#0055a2] to-yellow-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            navigate(`/formations/${formation._id}/contenu`)
                          }
                          className="flex-1 py-2 bg-[#0055a2] text-white rounded-lg font-medium text-sm hover:bg-[#003d7a] transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit3 size={16} />
                          Gérer le contenu
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/formateur/mes-apprenants`, {
                              state: { formationId: formation._id },
                            })
                          }
                          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-yellow-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                          <Users size={16} />
                          Voir apprenants
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#0055a2]" />
            Activité récente
          </h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune activité récente
              </div>
            ) : (
              recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conseils */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" />
            Conseils du jour
          </h3>
          <div className="space-y-4">
            <div className="bg-white/60 rounded-xl p-3">
              <p className="text-sm text-gray-700">
                🎯 Interagissez avec vos apprenants pour améliorer l'engagement
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <p className="text-sm text-gray-700">
                📊 Utilisez les statistiques pour suivre la progression
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <p className="text-sm text-gray-700">
                ✨ Mettez à jour vos cours régulièrement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormateurDashboard;
