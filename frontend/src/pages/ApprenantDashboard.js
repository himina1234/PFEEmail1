import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  GraduationCap,
  Calendar,
  Folder,
  ChevronRight,
} from "lucide-react";

const ApprenantDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const [localUser, setLocalUser] = useState(null);
  const [formations, setFormations] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    formationsEnCours: 0,
    formationsTerminees: 0,
    formationsInscrites: 0,
    ressourcesDisponibles: 8,
    prochaineSession: "Aucune session planifiée",
    prochaineSessionDate: null,
    progressionGlobale: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }
  }, []);

  const currentUser = user || localUser;
  const isAuthenticated = !!currentUser;
  const userRole = currentUser?.role || currentUser?.user?.role;

  // Charger toutes les données
  useEffect(() => {
    if (isAuthenticated && (userRole === "apprenant" || userRole === "user")) {
      fetchData();
    }
  }, [isAuthenticated, userRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // 1. Récupérer les inscriptions de l'apprenant
      const inscriptionsRes = await fetch(
        "http://localhost:5000/api/formations/mes-inscriptions",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      let userInscriptions = [];
      if (inscriptionsRes.ok) {
        const data = await inscriptionsRes.json();
        if (data.success && data.data) {
          userInscriptions = data.data;
          setInscriptions(userInscriptions);
        }
      }

      // Filtrer les inscriptions confirmées (acceptées par l'admin)
      const inscriptionsConfirmees = userInscriptions.filter(
        (insc) => insc.statut === "confirmee",
      );

      // 2. Construire la liste des formations inscrites
      const formationsInscrites = inscriptionsConfirmees.map((insc) => ({
        id: insc.formationId,
        titre: insc.formationTitre,
        domaine: insc.formationDomaine,
        progression: 0, // Par défaut 0%, sera mis à jour par le cahier de suivi
        statut: "ongoing",
        dateDebut: null,
      }));

      setFormations(formationsInscrites);

      // 3. Calculer les statistiques
      // ✅ Formations en cours = TOUTES les formations inscrites (progression < 100)
      const formationsEnCours = formationsInscrites.length;
      // ✅ Formations terminées = formations avec progression >= 100 (pour l'instant 0)
      const formationsTerminees = formationsInscrites.filter(
        (f) => f.progression >= 100,
      ).length;
      const formationsInscritesCount = formationsInscrites.length;

      // 4. Progression globale (moyenne des progressions)
      const totalProgression = formationsInscrites.reduce(
        (acc, f) => acc + f.progression,
        0,
      );
      const progressionGlobale =
        formationsInscrites.length > 0
          ? Math.round(totalProgression / formationsInscrites.length)
          : 0;

      // 5. Prochaine session (à partir des dates des formations)
      let prochaineSession = "Aucune session planifiée";

      // 6. Événements du planning
      const planningEvents = [];

      setStats({
        formationsEnCours,
        formationsTerminees,
        formationsInscrites: formationsInscritesCount,
        ressourcesDisponibles: 8,
        prochaineSession,
        prochaineSessionDate: null,
        progressionGlobale,
      });

      setEvents(planningEvents);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier l'authentification
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    } else if (
      !authLoading &&
      isAuthenticated &&
      userRole !== "apprenant" &&
      userRole !== "user"
    ) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, userRole, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || (userRole !== "apprenant" && userRole !== "user")) {
    return null;
  }

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (stats.progressionGlobale / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-6">
        {/* 4 CARTES STATISTIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => navigate("/apprenant/mes-formations")}
            className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="bg-amber-100 p-3 rounded-xl">
              <BookOpen className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.formationsEnCours}
              </div>
              <div className="text-xs text-gray-500">Formations en cours</div>
            </div>
          </div>

          <div
            onClick={() => navigate("/apprenant/mes-formations")}
            className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="bg-emerald-100 p-3 rounded-xl">
              <GraduationCap className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.formationsTerminees}
              </div>
              <div className="text-xs text-gray-500">Formations terminées</div>
            </div>
          </div>

          <div
            onClick={() => navigate("/apprenant/planning")}
            className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="bg-blue-100 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 max-w-[150px] truncate">
                {stats.prochaineSession}
              </div>
              <div className="text-xs text-gray-500">Prochaine session</div>
            </div>
          </div>

          <div
            onClick={() => navigate("/apprenant/ressources")}
            className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="bg-purple-100 p-3 rounded-xl">
              <Folder className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.ressourcesDisponibles}
              </div>
              <div className="text-xs text-gray-500">
                Ressources disponibles
              </div>
            </div>
          </div>
        </div>

        {/* SECTION MES FORMATIONS + PLANNING + PROGRESSION */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Mes formations
                </h2>
                <button
                  onClick={() => navigate("/apprenant/mes-formations")}
                  className="text-sm flex items-center gap-1 hover:opacity-80"
                  style={{ color: "#2b5ea7" }}
                >
                  Voir tout ({stats.formationsInscrites}){" "}
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="space-y-4">
                {formations.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucune formation inscrite</p>
                    <button
                      onClick={() => navigate("/apprenant/formations")}
                      className="mt-3 text-sm text-[#2b5ea7] hover:underline"
                    >
                      Découvrir les formations →
                    </button>
                  </div>
                ) : (
                  formations.slice(0, 2).map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => navigate("/apprenant/mes-formations")}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {item.titre}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {item.domaine}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900">
                          {item.progression}%
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${item.progression}%`,
                              backgroundColor: "#2b5ea7",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-5">
                Progression globale
              </h3>
              <div className="relative inline-block mb-4">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="none"
                    stroke="#2b5ea7"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: "#2b5ea7" }}
                  >
                    {stats.progressionGlobale}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {stats.formationsTerminees} formation(s) terminée(s) sur{" "}
                {stats.formationsInscrites}
              </p>
            </div>
          </div>

          <div className="lg:w-80">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Planning du jour</h3>
                <button
                  onClick={() => navigate("/apprenant/planning")}
                  className="text-sm flex items-center gap-1 hover:opacity-80"
                  style={{ color: "#2b5ea7" }}
                >
                  Voir tout &gt;
                </button>
              </div>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucun événement planifié</p>
                  </div>
                ) : (
                  events.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => navigate("/apprenant/planning")}
                    >
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {item.titre}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.dateFormatted}
                        </div>
                      </div>
                      <div className="font-semibold text-sm text-gray-900">
                        {item.horaire}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApprenantDashboard;